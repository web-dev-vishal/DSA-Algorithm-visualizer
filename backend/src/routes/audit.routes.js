import { Router } from 'express';
import AuditController from '../controllers/audit.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Apply admin checks to all logs
router.use(authenticate);
router.use(authorize()); // Ensures Super Admin or Admin access (as owner and admin bypass this check)

router.get('/audit-logs', AuditController.adminGetAuditLogs);
router.get('/activity-logs', AuditController.adminGetActivityLogs);
router.get('/security-events', AuditController.adminGetSecurityEvents);

export default router;
