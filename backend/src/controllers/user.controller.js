import User from '../models/User.js';
import UserPreference from '../models/UserPreference.js';
import AuditLog from '../models/AuditLog.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { NotFoundError, BadRequestError } from '../errors/ApiError.js';

export class UserController {
  // ── Get Profile ────────────────────────────────────────────────────
  static async getMe(req, res, next) {
    try {
      const preferences = await UserPreference.findOne({ userId: req.user._id });
      return ApiResponse.success(res, {
        user: req.user,
        preferences: preferences || {}
      }, 'Profile retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  // ── Update Profile ─────────────────────────────────────────────────
  static async updateMe(req, res, next) {
    try {
      const { name, avatar } = req.body;
      const user = await User.findById(req.user._id);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (name) user.name = name;
      if (avatar) user.avatar = avatar;

      await user.save();

      return ApiResponse.success(res, { user }, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }

  // ── Update Preferences ─────────────────────────────────────────────
  static async updatePreferences(req, res, next) {
    try {
      const { theme, emailNotifications, playbackSpeed } = req.body;
      let prefs = await UserPreference.findOne({ userId: req.user._id });

      if (!prefs) {
        prefs = new UserPreference({ userId: req.user._id });
      }

      if (theme !== undefined) prefs.theme = theme;
      if (emailNotifications !== undefined) prefs.emailNotifications = emailNotifications;
      if (playbackSpeed !== undefined) prefs.playbackSpeed = playbackSpeed;

      await prefs.save();

      return ApiResponse.success(res, { preferences: prefs }, 'Preferences updated successfully');
    } catch (err) {
      next(err);
    }
  }

  // ── Admin: List Users (Paginated, Searchable, Filterable) ───────────
  static async adminGetUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', role, plan, status } = req.query;

      const filter = {};

      if (role) filter.role = role;
      if (plan) filter.plan = plan;
      if (status) filter.status = status;

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const options = {
        skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 }
      };

      const users = await User.find(filter, null, options);
      const totalDocs = await User.countDocuments(filter);

      return ApiResponse.success(res, users, 'Users retrieved successfully', 200, {
        total: totalDocs,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(totalDocs / parseInt(limit, 10))
      });
    } catch (err) {
      next(err);
    }
  }

  // ── Admin: Update User Role / Plan / Status ───────────────────────
  static async adminUpdateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { role, plan, status } = req.body;

      const user = await User.findById(id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const beforeState = { role: user.role, plan: user.plan, status: user.status };

      if (role) user.role = role;
      if (plan) user.plan = plan;
      if (status) user.status = status;

      await user.save();

      // Log Audit Log
      const auditLog = new AuditLog({
        userId: req.user._id,
        userName: req.user.name,
        action: 'admin_update_user',
        resource: 'User',
        resourceId: user._id.toString(),
        ip: req.ip || 'Unknown',
        userAgent: req.headers['user-agent'] || 'Unknown',
        status: 'success',
        changes: { before: beforeState, after: { role: user.role, plan: user.plan, status: user.status } }
      });
      await auditLog.save();

      return ApiResponse.success(res, user, 'User updated successfully by administrator');
    } catch (err) {
      next(err);
    }
  }

  // ── Admin: Soft Delete User ────────────────────────────────────────
  static async adminDeleteUser(req, res, next) {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      user.deletedAt = new Date();
      await user.save();

      // Log Audit Log
      const auditLog = new AuditLog({
        userId: req.user._id,
        userName: req.user.name,
        action: 'admin_delete_user',
        resource: 'User',
        resourceId: user._id.toString(),
        ip: req.ip || 'Unknown',
        userAgent: req.headers['user-agent'] || 'Unknown',
        status: 'success',
        changes: { before: { deletedAt: null }, after: { deletedAt: user.deletedAt } }
      });
      await auditLog.save();

      return ApiResponse.success(res, null, 'User soft-deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

export default UserController;
