import AnalysisService from '../services/analysis.service.js';
import Analysis from '../models/Analysis.js';
import ActivityLog from '../models/ActivityLog.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { NotFoundError } from '../errors/ApiError.js';

export class AnalysisController {
  // ── Analyze Code ───────────────────────────────────────────────────
  static async analyze(req, res, next) {
    try {
      const { code, language, array } = req.body;
      const userId = req.user ? req.user._id : null;

      // Invoke Analysis Service
      const result = await AnalysisService.analyze(code, language, array, userId);

      // Log activity if user is logged in
      if (userId) {
        const log = new ActivityLog({
          userId,
          action: 'analyze_code',
          description: `Analyzed ${result.algorithmName || 'DSA code'} in ${language}`,
          ipAddress: req.ip || 'Unknown',
          userAgent: req.headers['user-agent'] || 'Unknown',
          metadata: {
            algorithm: result.algorithmName,
            language,
            isCorrect: result.isCorrect
          }
        });
        await log.save();
      }

      return ApiResponse.success(res, result, 'Analysis completed successfully');
    } catch (err) {
      next(err);
    }
  }

  // ── Get User History ───────────────────────────────────────────────
  static async getHistory(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', category } = req.query;
      const filter = { userId: req.user._id };

      if (category) {
        filter.category = category;
      }

      if (search) {
        filter.$or = [
          { algorithmName: { $regex: search, $options: 'i' } },
          { explanation: { $regex: search, $options: 'i' } }
        ];
      }

      const options = {
        skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 }
      };

      const items = await Analysis.find(filter, { steps: 0 }, options); // Exclude large steps array for faster listings
      const totalDocs = await Analysis.countDocuments(filter);

      return ApiResponse.success(res, items, 'History fetched successfully', 200, {
        total: totalDocs,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(totalDocs / parseInt(limit, 10))
      });
    } catch (err) {
      next(err);
    }
  }

  // ── Get Single Detailed Analysis ───────────────────────────────────
  static async getAnalysisDetails(req, res, next) {
    try {
      const { id } = req.params;
      
      // Allow viewing if it's the owner or if it has been marked as shared!
      const analysis = await Analysis.findById(id);
      if (!analysis) {
        throw new NotFoundError('Analysis not found');
      }

      if (!analysis.shared && (!req.user || analysis.userId.toString() !== req.user._id.toString())) {
        throw new NotFoundError('Analysis not found');
      }

      return ApiResponse.success(res, analysis, 'Analysis details retrieved');
    } catch (err) {
      next(err);
    }
  }

  // ── Delete Analysis from History ──────────────────────────────────
  static async deleteHistory(req, res, next) {
    try {
      const { id } = req.params;

      const analysis = await Analysis.findOneAndDelete({ _id: id, userId: req.user._id });
      if (!analysis) {
        throw new NotFoundError('Analysis record not found');
      }

      return ApiResponse.success(res, null, 'Analysis deleted from history');
    } catch (err) {
      next(err);
    }
  }

  // ── Toggle Shared Status ──────────────────────────────────────────
  static async toggleShare(req, res, next) {
    try {
      const { id } = req.params;
      const { shared } = req.body;

      const analysis = await Analysis.findOne({ _id: id, userId: req.user._id });
      if (!analysis) {
        throw new NotFoundError('Analysis record not found');
      }

      analysis.shared = !!shared;
      await analysis.save();

      return ApiResponse.success(
        res, 
        { id: analysis._id, shared: analysis.shared }, 
        `Analysis is now ${analysis.shared ? 'publicly shared' : 'private'}`
      );
    } catch (err) {
      next(err);
    }
  }
}

export default AnalysisController;
