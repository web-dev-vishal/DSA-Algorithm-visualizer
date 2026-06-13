import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema
} from '../validators/schemas.js';

const router = Router();

// ── Public routes (rate-limited) ──────────────────────────────────────
router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);

// Forgot/Reset password
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), AuthController.resetPassword);

// Email verification — POST body, not query string (CRIT-09 fix)
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), AuthController.verifyEmail);
router.post('/resend-verification', authLimiter, AuthController.resendVerification);

// ── Authenticated routes ───────────────────────────────────────────────
router.post('/logout', authenticate, AuthController.logout);
router.post('/logout-all', authenticate, AuthController.logoutAll);
router.post('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);
router.post('/deactivate', authenticate, AuthController.deactivate);

// Session management
router.get('/sessions', authenticate, AuthController.getSessions);
router.delete('/sessions/:sessionId', authenticate, AuthController.revokeSession);

export default router;
