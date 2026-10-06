import Repository from '../models/Repository.js';
import { indexRepositoryFiles, answerRepositoryQuestion } from '../services/rag/ragService.js';

/**
 * @desc    Index repository files for semantic retrieval
 * @route   POST /api/repositories/:id/index
 * @access  Private
 */
export const indexRepository = async (req, res, next) => {
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

    const result = await indexRepositoryFiles(repository);

    return res.status(200).json({
      success: true,
      message: `Successfully indexed ${result.chunksCreated} code chunks across ${result.indexedFilesCount} key files.`,
      result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Chat with repository using grounded RAG pipeline
 * @route   POST /api/repositories/:id/chat
 * @access  Private
 */
export const chatWithRepo = async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question about the repository.',
      });
    }

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

    const response = await answerRepositoryQuestion(repository, question.trim());

    return res.status(200).json({
      success: true,
      question: question.trim(),
      answer: response.answer,
      sources: response.sources,
    });
  } catch (error) {
    next(error);
  }
};
