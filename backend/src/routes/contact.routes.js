import { Router } from 'express';
import ContactController from '../controllers/contact.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { contactSchema } from '../validators/schemas.js';

const router = Router();

// Public route to submit inquiries
router.post('/', authLimiter, validate(contactSchema), ContactController.submitContact);

// Admin-only listing route
router.get('/', authenticate, authorize(), ContactController.adminGetMessages);

export default router;
