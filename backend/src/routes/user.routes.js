import { Router } from 'express';
import UserController from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileSchema, adminUpdateUserSchema } from '../validators/schemas.js';

const router = Router();

// Self routes
router.get('/me', authenticate, UserController.getMe);
router.patch('/me', authenticate, validate(updateProfileSchema), UserController.updateMe);
router.put('/me/preferences', authenticate, UserController.updatePreferences);

// Admin-only user management routes
router.get('/', authenticate, authorize(), UserController.adminGetUsers);
router.patch('/:id', authenticate, authorize(), validate(adminUpdateUserSchema), UserController.adminUpdateUser);
router.delete('/:id', authenticate, authorize(), UserController.adminDeleteUser);

export default router;
