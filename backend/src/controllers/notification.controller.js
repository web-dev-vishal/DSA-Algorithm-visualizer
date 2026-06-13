import Notification from '../models/Notification.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { NotFoundError } from '../errors/ApiError.js';

export class NotificationController {
  // ── Get Notifications ──────────────────────────────────────────────
  static async getNotifications(req, res, next) {
    try {
      const { page = 1, limit = 10, unreadOnly = 'false' } = req.query;
      const filter = { userId: req.user._id };

      if (unreadOnly === 'true') {
        filter.read = false;
      }

      const options = {
        skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 }
      };

      const notifications = await Notification.find(filter, null, options);
      const totalDocs = await Notification.countDocuments(filter);

      return ApiResponse.success(res, notifications, 'Notifications fetched successfully', 200, {
        total: totalDocs,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(totalDocs / parseInt(limit, 10))
      });
    } catch (err) {
      next(err);
    }
  }

  // ── Mark Single Read ───────────────────────────────────────────────
  static async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        { read: true },
        { new: true }
      );

      if (!notification) {
        throw new NotFoundError('Notification not found');
      }

      return ApiResponse.success(res, notification, 'Notification marked as read');
    } catch (err) {
      next(err);
    }
  }

  // ── Mark All Read ──────────────────────────────────────────────────
  static async markAllAsRead(req, res, next) {
    try {
      await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
      return ApiResponse.success(res, null, 'All notifications marked as read');
    } catch (err) {
      next(err);
    }
  }
}

export default NotificationController;
