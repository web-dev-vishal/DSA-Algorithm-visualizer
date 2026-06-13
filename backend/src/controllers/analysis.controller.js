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

  // ── Dashboard Stats ─────────────────────────────────────────────────
  static async getStats(req, res, next) {
    try {
      const userId = req.user._id;

      // First day of current month
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      // Last 7 days for trend chart
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Run all DB queries in parallel
      const [totalAnalyses, thisMonth, uniqueAlgorithms, avgStepsResult, dailyData, categoryData] =
        await Promise.all([
          // Total analyses
          Analysis.countDocuments({ userId }),

          // This month's analyses
          Analysis.countDocuments({ userId, createdAt: { $gte: monthStart } }),

          // Unique algorithm count
          Analysis.distinct('algorithmName', { userId }).then(a => a.length),

          // Average steps across all analyses
          Analysis.aggregate([
            { $match: { userId } },
            { $project: { stepCount: { $size: '$steps' } } },
            { $group: { _id: null, avg: { $avg: '$stepCount' } } }
          ]),

          // Daily breakdown for trend chart (last 7 days)
          Analysis.aggregate([
            { $match: { userId, createdAt: { $gte: sevenDaysAgo } } },
            { $group: {
              _id: { $dateToString: { format: '%a', date: '$createdAt' } },
              analyses: { $sum: 1 }
            }},
            { $project: { day: '$_id', analyses: 1, api: '$analyses', _id: 0 } },
            { $sort: { day: 1 } }
          ]),

          // Category distribution
          Analysis.aggregate([
            { $match: { userId } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $project: { name: '$_id', count: 1, _id: 0 } },
            { $sort: { count: -1 } },
            { $limit: 8 }
          ])
        ]);

      return ApiResponse.success(res, {
        totalAnalyses,
        thisMonth,
        uniqueAlgorithms,
        avgSteps: Math.round(avgStepsResult[0]?.avg ?? 0),
        dailyData,
        categoryData
      }, 'Dashboard stats fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  // ── Get User History ───────────────────────────────────────────────
  static async getHistory(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', category } = req.query;
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))); // Cap at 100
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

      // Run count and data queries in parallel
      const [items, totalDocs] = await Promise.all([
        Analysis.find(filter, { steps: 0 }, {
          skip: (pageNum - 1) * limitNum,
          limit: limitNum,
          sort: { createdAt: -1 }
        }),
        Analysis.countDocuments(filter)
      ]);

      return ApiResponse.success(res, { items, total: totalDocs }, 'History fetched successfully', 200, {
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalDocs / limitNum)
      });
    } catch (err) {
      next(err);
    }
  }

  // ── Get Single Detailed Analysis ───────────────────────────────────
  static async getAnalysisDetails(req, res, next) {
    try {
      const { id } = req.params;

      const analysis = await Analysis.findById(id);
      if (!analysis) {
        throw new NotFoundError('Analysis not found');
      }

      // Allow access if shared publicly or owned by current user
      if (!analysis.shared && (!req.user || analysis.userId?.toString() !== req.user._id.toString())) {
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
        throw new NotFoundError('Analysis record not found or not owned by you');
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
