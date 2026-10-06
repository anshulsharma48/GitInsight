import express from 'express';
import {
  importRepository,
  getUserRepositories,
  getRepositoryById,
  deleteRepository,
} from '../controllers/repositoryController.js';
import {
  triggerAnalysis,
  getAnalysis,
} from '../controllers/analysisController.js';
import {
  indexRepository,
  chatWithRepo,
} from '../controllers/ragController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All repository routes require JWT authentication
router.use(protect);

// Repository Management
router.post('/import', importRepository);
router.get('/', getUserRepositories);
router.get('/:id', getRepositoryById);
router.delete('/:id', deleteRepository);

// Static Analysis & Health Scoring
router.post('/:id/analyze', triggerAnalysis);
router.get('/:id/analysis', getAnalysis);

// RAG Code Indexing & Chat
router.post('/:id/index', indexRepository);
router.post('/:id/chat', chatWithRepo);

export default router;
