import { Router } from 'express';
import AnalysisController from '../controllers/analysis.controller.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { apiAnalysisLimiter } from '../middlewares/rateLimiter.js';
import { analyzeSchema } from '../validators/schemas.js';

const router = Router();

// Analyze code (supports both anonymous and logged in users)
router.post('/', apiAnalysisLimiter, optionalAuthenticate, validate(analyzeSchema), AnalysisController.analyze);

// History listing (requires login)
router.get('/history', authenticate, AnalysisController.getHistory);
router.delete('/history/:id', authenticate, AnalysisController.deleteHistory);
router.patch('/history/:id/share', authenticate, AnalysisController.toggleShare);

// Single analysis details (accessible by owner or public if shared)
router.get('/:id', optionalAuthenticate, AnalysisController.getAnalysisDetails);

export default router;
