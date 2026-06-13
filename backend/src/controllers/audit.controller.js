import AuditLog from '../models/AuditLog.js';
import ActivityLog from '../models/ActivityLog.js';
import SecurityEvent from '../models/SecurityEvent.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AuditController {
  // ── Admin: List Audit Logs ─────────────────────────────────────────
  static async adminGetAuditLogs(req, res, next) {
    try {
      const { page = 1, limit = 20, resource, action, status } = req.query;
      const filter = {};

      if (resource) filter.resource = resource;
      if (action) filter.action = action;
      if (status) filter.status = status;

      const options = {
        skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 }
      };

      const items = await AuditLog.find(filter, null, options).populate('userId', 'name email');
      const totalDocs = await AuditLog.countDocuments(filter);

      return ApiResponse.success(res, items, 'Audit logs fetched successfully', 200, {
        total: totalDocs,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(totalDocs / parseInt(limit, 10))
      });
    } catch (err) {
      next(err);
    }
  }

  // ── Admin: List Activity Logs ──────────────────────────────────────
  static async adminGetActivityLogs(req, res, next) {
    try {
      const { page = 1, limit = 20, action } = req.query;
      const filter = {};

      if (action) filter.action = action;

      const options = {
        skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 }
      };

      const items = await ActivityLog.find(filter, null, options).populate('userId', 'name email');
      const totalDocs = await ActivityLog.countDocuments(filter);

      return ApiResponse.success(res, items, 'Activity logs fetched successfully', 200, {
        total: totalDocs,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(totalDocs / parseInt(limit, 10))
      });
    } catch (err) {
      next(err);
    }
  }

  // ── Admin: List Security Events ────────────────────────────────────
  static async adminGetSecurityEvents(req, res, next) {
    try {
      const { page = 1, limit = 20, eventType } = req.query;
      const filter = {};

      if (eventType) filter.eventType = eventType;

      const options = {
        skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 }
      };

      const items = await SecurityEvent.find(filter, null, options).populate('userId', 'name email');
      const totalDocs = await SecurityEvent.countDocuments(filter);

      return ApiResponse.success(res, items, 'Security events fetched successfully', 200, {
        total: totalDocs,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(totalDocs / parseInt(limit, 10))
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AuditController;
