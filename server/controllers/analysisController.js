import Repository from '../models/Repository.js';
import Analysis from '../models/Analysis.js';
import { runDeterministicAnalysis } from '../analyzers/scoringEngine.js';
import {
  generateRepositorySummary,
  generateRecommendations,
  generateOnboardingGuide,
} from '../services/ai/geminiService.js';

/**
 * @desc    Run full static analysis and AI interpretation on a repository
 * @route   POST /api/repositories/:id/analyze
 * @access  Private
 */
export const triggerAnalysis = async (req, res, next) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found.',
      });
    }

    // 1. Run deterministic static analysis & scoring engine
    const deterministic = runDeterministicAnalysis(repository);

    // 2. Generate AI grounded summaries & recommendations
    const [aiSummary, aiRecommendations, aiOnboarding] = await Promise.all([
      generateRepositorySummary(repository, deterministic),
      generateRecommendations(repository, deterministic),
      generateOnboardingGuide(repository),
    ]);

    // 3. Upsert Analysis record
    const analysisPayload = {
      repositoryId: repository._id,
      userId: req.user._id,
      healthScore: deterministic.healthScore,
      categories: deterministic.categories,
      findings: deterministic.findings,
      metrics: deterministic.metrics,
      aiSummary,
      aiRecommendations,
      aiOnboarding,
    };

    const analysis = await Analysis.findOneAndUpdate(
      { repositoryId: repository._id, userId: req.user._id },
      analysisPayload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Analysis completed successfully.',
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get analysis results for a repository
 * @route   GET /api/repositories/:id/analysis
 * @access  Private
 */
export const getAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({
      repositoryId: req.params.id,
      userId: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'No analysis found for this repository. Trigger analysis first.',
      });
    }

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};
