import rateLimit from 'express-rate-limit';
import { RateLimitError } from '../errors/ApiError.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

// Base options
const limitHandler = (req, res, next, options) => {
  logger.warn(`Rate limit hit: IP ${req.ip} tried to access ${req.originalUrl}`);
  next(new RateLimitError(options.message));
};

// Bypass utility for tests
const bypassInTest = (limiterMiddleware) => (req, res, next) => {
  if (config.env === 'test') {
    return next();
  }
  return limiterMiddleware(req, res, next);
};

export const generalLimiter = bypassInTest(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP. Please try again after 15 minutes.',
  handler: limitHandler
}));

export const authLimiter = bypassInTest(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 authentication requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts. Please wait 15 minutes.',
  handler: limitHandler
}));

export const apiAnalysisLimiter = bypassInTest(rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP/user to 30 code analyses per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Hourly analysis limits exceeded. Please wait before analyzing more algorithms.',
  handler: limitHandler
}));
