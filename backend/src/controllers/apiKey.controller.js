import crypto from 'crypto';
import ApiKey from '../models/ApiKey.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { NotFoundError } from '../errors/ApiError.js';

export class ApiKeyController {
  // ── Create API Key ────────────────────────────────────────────────
  static async createKey(req, res, next) {
    try {
      const { name } = req.body;

      // Generate secure key: av_live_64hex
      const rawKey = `av_live_${crypto.randomBytes(32).toString('hex')}`;
      
      // Hash the key using sha256 to save in DB
      const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
      
      // Create mask format: av_live_xxxx...xxxx
      const keyMask = `${rawKey.substring(0, 12)}...${rawKey.substring(rawKey.length - 4)}`;

      const apiKey = new ApiKey({
        userId: req.user._id,
        name,
        keyHash,
        keyMask
      });

      await apiKey.save();

      // Return the unhashed raw key only once during creation!
      return ApiResponse.success(res, {
        id: apiKey._id,
        name: apiKey.name,
        key: rawKey, // Plain key returned once
        keyMask: apiKey.keyMask,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt
      }, 'API Key generated successfully. Save this key somewhere secure, you will not be able to view it again.', 201);
    } catch (err) {
      next(err);
    }
  }

  // ── List API Keys ──────────────────────────────────────────────────
  static async getKeys(req, res, next) {
    try {
      const keys = await ApiKey.find({ userId: req.user._id }).sort({ createdAt: -1 });
      return ApiResponse.success(res, keys, 'API Keys retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  // ── Toggle API Key Active/Inactive ─────────────────────────────────
  static async updateKey(req, res, next) {
    try {
      const { id } = req.params;
      const { name, isActive } = req.body;

      const key = await ApiKey.findOne({ _id: id, userId: req.user._id });
      if (!key) {
        throw new NotFoundError('API Key not found');
      }

      if (name !== undefined) key.name = name;
      if (isActive !== undefined) key.isActive = isActive;

      await key.save();

      return ApiResponse.success(res, key, 'API Key updated successfully');
    } catch (err) {
      next(err);
    }
  }

  // ── Delete/Revoke API Key ──────────────────────────────────────────
  static async deleteKey(req, res, next) {
    try {
      const { id } = req.params;

      const result = await ApiKey.findOneAndDelete({ _id: id, userId: req.user._id });
      if (!result) {
        throw new NotFoundError('API Key not found');
      }

      return ApiResponse.success(res, null, 'API Key revoked and deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

export default ApiKeyController;
