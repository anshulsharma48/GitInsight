import Repository from '../models/Repository.js';
import Analysis from '../models/Analysis.js';
import { runDeterministicAnalysis } from '../analyzers/scoringEngine.js';
import { generateRepositoryInsights } from '../services/ai/geminiService.js';

/**
 * @desc    Run deterministic repository analysis and one optional AI interpretation
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

    // 1. Deterministic analysis is always available and does not consume AI quota.
    const deterministic = runDeterministicAnalysis(repository);

    // 2. One Gemini request generates summary + recommendations + onboarding together.
    const ai = await generateRepositoryInsights(repository, deterministic);

    const analysisPayload = {
      repositoryId: repository._id,
      userId: req.user._id,
      healthScore: deterministic.healthScore,
      categories: deterministic.categories,
      findings: deterministic.findings,
      metrics: deterministic.metrics,
      aiSummary: ai.aiSummary,
      aiRecommendations: ai.aiRecommendations,
      aiOnboarding: ai.aiOnboarding,
    };

    const analysis = await Analysis.findOneAndUpdate(
      { repositoryId: repository._id, userId: req.user._id },
      analysisPayload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const aiMessage =
  ai.source === 'gemini'
    ? 'AI interpretation generated successfully.'
    : ai.errorType === 'QUOTA'
      ? 'Static analysis completed. Gemini quota is currently unavailable, so grounded fallback content was used.'
      : ai.errorType === 'COOLDOWN'
        ? 'Static analysis completed. Gemini is temporarily in cooldown, so grounded fallback content was used.'
        : 'Static analysis completed. Grounded fallback content was used for AI sections.';

    return res.status(200).json({
      success: true,
      message: `Analysis completed successfully. ${aiMessage}`,
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
