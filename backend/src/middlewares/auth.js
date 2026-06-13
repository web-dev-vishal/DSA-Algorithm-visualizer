import PasetoService from '../services/paseto.service.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Role from '../models/Role.js';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../errors/ApiError.js';
import logger from '../utils/logger.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Get token from Authorization header or Cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication token is missing');
    }

    // 2. Verify PASETO token
    const decoded = await PasetoService.verifyAccessToken(token);

    // 3. Check session validity
    const session = await Session.findOne({ _id: decoded.sessionId, isRevoked: false });
    if (!session) {
      throw new UnauthorizedError('Session has expired or been revoked');
    }

    // 4. Fetch User
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError('User account not found');
    }

    if (user.status !== 'active') {
      throw new ForbiddenError(`User account is ${user.status}`);
    }

    // 5. Attach info to request
    req.user = user;
    req.session = session;
    next();
  } catch (err) {
    logger.warn(`Authentication failed: ${err.message}`);
    next(err);
  }
};

export const optionalAuthenticate = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = await PasetoService.verifyAccessToken(token);
      const session = await Session.findOne({ _id: decoded.sessionId, isRevoked: false });
      if (session) {
        const user = await User.findById(decoded.userId);
        if (user && user.status === 'active') {
          req.user = user;
          req.session = session;
        }
      }
    }
  } catch (err) {
    // Ignore verification errors for optional authentication
  }
  next();
};

/**
 * Authorize roles or specific permissions
 * @param {Array<string>} permissions 
 */
export const authorize = (permissions = []) => async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User is not authenticated');
    }

    // Super Admin / Owner has absolute authorization
    if (req.user.role === 'owner' || req.user.role === 'admin') {
      return next();
    }

    // If no specific permissions required, role-check alone is enough
    if (permissions.length === 0) {
      return next();
    }

    // Fetch Role's permissions
    const userRole = await Role.findOne({ name: req.user.role });
    if (!userRole) {
      throw new ForbiddenError('User role permissions are not defined');
    }

    const hasPermission = permissions.every(perm => userRole.permissions.includes(perm));
    if (!hasPermission) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Ensures user owns the resource or has admin privileges
 * @param {import('mongoose').Model} model Mongoose model to query
 * @param {string} paramIdName Name of the parameter containing the resource ID
 * @param {string} userField Field referencing the User ID in the model (default: 'userId')
 */
export const checkOwnership = (model, paramIdName = 'id', userField = 'userId') => async (req, res, next) => {
  try {
    const resourceId = req.params[paramIdName];
    if (!resourceId) {
      throw new NotFoundError('Resource identifier is missing in parameters');
    }

    const resource = await model.findById(resourceId);
    if (!resource) {
      throw new NotFoundError(`Resource not found`);
    }

    // Admin/Owner can bypass ownership check
    if (req.user.role === 'owner' || req.user.role === 'admin') {
      req.resource = resource; // Attach resource for controller
      return next();
    }

    if (resource[userField] && resource[userField].toString() !== req.user._id.toString()) {
      throw new ForbiddenError('You do not own this resource');
    }

    req.resource = resource; // Attach resource for controller
    next();
  } catch (err) {
    next(err);
  }
};
