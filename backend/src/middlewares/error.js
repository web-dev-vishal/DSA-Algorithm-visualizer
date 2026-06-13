import config from '../config/index.js';
import logger from '../utils/logger.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message = 'Internal Server Error', errors = [] } = err;

  // Log the complete error stack in development and error messages in production
  if (statusCode === 500) {
    logger.error(`[Express Error Handler] Server error:`, err);
  } else {
    logger.warn(`[Express Error Handler] Client warning: ${statusCode} - ${message}`, { errors });
  }

  // Handle Mongoose cast error (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field ${err.path}`;
    errors = [{ field: err.path, message: `Invalid ID value` }];
  }

  // Handle Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
  }

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const duplicatedField = Object.keys(err.keyValue)[0];
    message = `${duplicatedField.charAt(0).toUpperCase() + duplicatedField.slice(1)} already exists`;
    errors = [{ field: duplicatedField, message: 'Value must be unique' }];
  }

  // Under production, don't leak server errors
  if (config.env === 'production' && statusCode === 500) {
    message = 'An unexpected error occurred. Please contact system support.';
  }

  return ApiResponse.error(res, message, statusCode, errors);
};

export default errorHandler;
