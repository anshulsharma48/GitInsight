import express from 'express';
import {
  importRepository,
  getUserRepositories,
  getRepositoryById,
  deleteRepository,
} from '../controllers/repositoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All repository routes require JWT authentication
router.use(protect);

router.post('/import', importRepository);
router.get('/', getUserRepositories);
router.get('/:id', getRepositoryById);
router.delete('/:id', deleteRepository);

export default router;
