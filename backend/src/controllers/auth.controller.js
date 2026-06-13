import crypto from 'crypto';
import User from '../models/User.js';
import Session from '../models/Session.js';
import RefreshToken from '../models/RefreshToken.js';
import SecurityEvent from '../models/SecurityEvent.js';
import UserPreference from '../models/UserPreference.js';
import PasetoService from '../services/paseto.service.js';
import { emailQueue, notificationQueue } from '../queues/queue.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError } from '../errors/ApiError.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

// Parse simple device info from user-agent
const getDeviceDetails = (req) => {
  const ua = req.headers['user-agent'] || 'Unknown';
  let browser = 'Unknown';
  let os = 'Unknown';
  let deviceType = 'desktop';

  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
    deviceType = 'mobile';
  } else if (ua.includes('Android')) {
    os = 'Android';
    deviceType = 'mobile';
  }

  return {
    userAgent: ua,
    browser,
    os,
    deviceType,
    ipAddress: req.ip || req.connection.remoteAddress || 'Unknown'
  };
};

// Hash token helper
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export class AuthController {
  // ── Register ───────────────────────────────────────────────────────
  static async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new BadRequestError('Email already in use');
      }

      // Create new user
      const user = new User({ name, email, password });
      await user.save();

      // Create preferences default
      const prefs = new UserPreference({ userId: user._id });
      await prefs.save();

      // Generate verification token (simple random hex)
      const verifyToken = crypto.randomBytes(32).toString('hex');
      const verifyTokenHash = hashToken(verifyToken);
      
      // Save verification state or send welcome job
      if (emailQueue) {
        await emailQueue.add('welcome_email', {
          type: 'welcome',
          data: { user: { name: user.name, email: user.email } }
        });
        await emailQueue.add('verify_email', {
          type: 'verify',
          data: { user: { name: user.name, email: user.email }, token: verifyToken }
        });
      }

      // We store the verification token in user model briefly or simply mock verification
      // For this app, let's allow user verification directly
      user.failedLoginAttempts = 0;
      // Storing verification hash on the user instance
      user.set('emailVerifyHash', verifyTokenHash, { strict: false });
      user.set('emailVerifyExpires', Date.now() + 24 * 3600 * 1000, { strict: false });
      await user.save();

      return ApiResponse.success(res, {
        user: { id: user._id, name: user.name, email: user.email, role: user.role, plan: user.plan }
      }, 'Registration successful! Verification email sent.', 201);
    } catch (err) {
      next(err);
    }
  }

  // ── Login ──────────────────────────────────────────────────────────
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const device = getDeviceDetails(req);

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Check Account lock status
      if (user.isLocked()) {
        const lockMinutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
        throw new ForbiddenError(`Account locked. Try again in ${lockMinutes} minutes.`);
      }

      // Compare password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // Track failed attempt
        user.failedLoginAttempts += 1;
        
        const securityEvent = new SecurityEvent({
          userId: user._id,
          email: user.email,
          eventType: 'failed_login',
          ipAddress: device.ipAddress,
          userAgent: device.userAgent
        });
        await securityEvent.save();

        if (user.failedLoginAttempts >= 5) {
          user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 mins
          await user.save();

          // Create security event lockout
          const lockoutEvent = new SecurityEvent({
            userId: user._id,
            email: user.email,
            eventType: 'lockout',
            ipAddress: device.ipAddress,
            userAgent: device.userAgent
          });
          await lockoutEvent.save();

          if (emailQueue) {
            await emailQueue.add('lockout_email', {
              type: 'lockout',
              data: { user: { name: user.name, email: user.email } }
            });
          }

          throw new ForbiddenError('Account locked due to too many failed attempts. A notification has been sent to your email.');
        }

        await user.save();
        throw new UnauthorizedError('Invalid email or password');
      }

      // Login Successful: Reset locks
      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();

      // Create new session
      const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 days
      const session = new Session({
        userId: user._id,
        browser: device.browser,
        os: device.os,
        deviceType: device.deviceType,
        ipAddress: device.ipAddress,
        userAgent: device.userAgent,
        expiresAt,
        refreshTokHash: 'pending' // will be populated shortly
      });
      await session.save();

      // Generate Refresh Token
      const refreshToken = await PasetoService.generateRefreshToken({
        userId: user._id,
        sessionId: session._id
      });
      const refreshHash = hashToken(refreshToken);

      // Save token hash to session
      session.refreshTokHash = refreshHash;
      await session.save();

      // Store in DB RefreshToken (rotation check)
      const tokenDoc = new RefreshToken({
        userId: user._id,
        token: refreshHash,
        expiresAt
      });
      await tokenDoc.save();

      // Generate Access Token
      const accessToken = await PasetoService.generateAccessToken({
        userId: user._id,
        sessionId: session._id,
        role: user.role,
        plan: user.plan
      });

      // Log security event success
      const successEvent = new SecurityEvent({
        userId: user._id,
        email: user.email,
        eventType: 'failed_login', // just an example, but we could log standard login
        ipAddress: device.ipAddress,
        userAgent: device.userAgent
      });
      // We customize eventType locally
      successEvent.eventType = 'failed_login'; // Actually we can use a custom or ignored event
      
      // Store Refresh Token in cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Store Access Token in cookie for convenience
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 mins
      });

      if (emailQueue) {
        await emailQueue.add('login_alert_email', {
          type: 'login_alert',
          data: { user: { name: user.name, email: user.email }, session: { os: device.os, browser: device.browser, ipAddress: device.ipAddress, deviceType: device.deviceType } }
        });
      }

      return ApiResponse.success(res, {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          plan: user.plan,
          emailVerified: user.emailVerified,
          mfaEnabled: user.mfaEnabled,
          createdAt: user.createdAt
        }
      }, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  // ── Token Refresh (with rotation & reuse detection) ───────────────────
  static async refresh(req, res, next) {
    try {
      const oldRefreshToken = req.cookies.refreshToken;
      if (!oldRefreshToken) {
        throw new UnauthorizedError('Refresh token is missing');
      }

      // Verify token
      const decoded = await PasetoService.verifyRefreshToken(oldRefreshToken);
      const oldHash = hashToken(oldRefreshToken);

      // Check DB for token
      const tokenDoc = await RefreshToken.findOne({ token: oldHash });
      if (!tokenDoc) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Reuse Detection: Token was already used or is revoked!
      if (tokenDoc.isUsed || tokenDoc.isRevoked) {
        // Lock user / revoke all sessions as token is compromised
        await Session.updateMany({ userId: decoded.userId }, { isRevoked: true });
        await RefreshToken.updateMany({ userId: decoded.userId }, { isRevoked: true });
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        
        logger.error(`Compromise Alert: Refresh token reuse detected for User ${decoded.userId}. Revoking all sessions.`);
        throw new ForbiddenError('Security breach detected. All sessions terminated. Please log in again.');
      }

      // Check if session itself is revoked
      const session = await Session.findOne({ _id: decoded.sessionId, isRevoked: false });
      if (!session) {
        throw new UnauthorizedError('Session is invalid or revoked');
      }

      // Mark token as used
      tokenDoc.isUsed = true;
      
      // Generate new Refresh Token
      const newRefreshToken = await PasetoService.generateRefreshToken({
        userId: decoded.userId,
        sessionId: decoded.sessionId
      });
      const newHash = hashToken(newRefreshToken);

      tokenDoc.replacedByToken = newHash;
      await tokenDoc.save();

      // Save new token in DB
      const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
      const newTokenDoc = new RefreshToken({
        userId: decoded.userId,
        token: newHash,
        expiresAt
      });
      await newTokenDoc.save();

      // Update session's token hash
      session.refreshTokHash = newHash;
      await session.save();

      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Generate new Access Token
      const accessToken = await PasetoService.generateAccessToken({
        userId: user._id,
        sessionId: session._id,
        role: user.role,
        plan: user.plan
      });

      // Update cookies
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
      });

      return ApiResponse.success(res, { accessToken }, 'Tokens rotated successfully');
    } catch (err) {
      next(err);
    }
  }

  // ── Logout ─────────────────────────────────────────────────────────
  static async logout(req, res, next) {
    try {
      if (req.session) {
        req.session.isRevoked = true;
        await req.session.save();

        // Revoke active refresh tokens
        await RefreshToken.updateMany({ token: req.session.refreshTokHash }, { isRevoked: true });
      }

      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');

      return ApiResponse.success(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }

  // ── Logout All Devices ─────────────────────────────────────────────
  static async logoutAll(req, res, next) {
    try {
      await Session.updateMany({ userId: req.user._id }, { isRevoked: true });
      await RefreshToken.updateMany({ userId: req.user._id }, { isRevoked: true });

      const logoutEvent = new SecurityEvent({
        userId: req.user._id,
        email: req.user.email,
        eventType: 'logout_all',
        ipAddress: req.ip || 'Unknown',
        userAgent: req.headers['user-agent'] || 'Unknown'
      });
      await logoutEvent.save();

      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');

      return ApiResponse.success(res, null, 'All sessions terminated successfully');
    } catch (err) {
      next(err);
    }
  }

  // ── Forgot Password ────────────────────────────────────────────────
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        // To prevent account enumeration, respond with success anyway
        return ApiResponse.success(res, null, 'If this email is registered, a reset link will be sent.');
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetHash = hashToken(resetToken);

      user.set('passwordResetHash', resetHash, { strict: false });
      user.set('passwordResetExpires', Date.now() + 3600 * 1000, { strict: false }); // 1 hour
      await user.save();

      if (emailQueue) {
        await emailQueue.add('forgot_password_email', {
          type: 'forgot',
          data: { user: { name: user.name, email: user.email }, token: resetToken }
        });
      }

      return ApiResponse.success(res, null, 'Password reset link sent to your email.');
    } catch (err) {
      next(err);
    }
  }

  // ── Reset Password ─────────────────────────────────────────────────
  static async resetPassword(req, res, next) {
    try {
      const { token, email, password } = req.body;
      
      const user = await User.findOne({ email });
      if (!user) {
        throw new BadRequestError('Invalid reset attempt');
      }

      const resetHash = hashToken(token);
      
      const storedHash = user.get('passwordResetHash');
      const expires = user.get('passwordResetExpires');

      if (!storedHash || storedHash !== resetHash || !expires || expires < Date.now()) {
        throw new BadRequestError('Invalid or expired password reset token');
      }

      // Reset password
      user.password = password;
      user.set('passwordResetHash', undefined, { strict: false });
      user.set('passwordResetExpires', undefined, { strict: false });
      
      // Clear sessions for security
      await Session.updateMany({ userId: user._id }, { isRevoked: true });
      await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });

      const pwEvent = new SecurityEvent({
        userId: user._id,
        email: user.email,
        eventType: 'password_change',
        ipAddress: req.ip || 'Unknown',
        userAgent: req.headers['user-agent'] || 'Unknown'
      });
      await pwEvent.save();
      await user.save();

      return ApiResponse.success(res, null, 'Password reset successfully. Please log in with your new password.');
    } catch (err) {
      next(err);
    }
  }

  // ── Change Password (Authenticated) ──────────────────────────────
  static async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      
      // Fetch user with password field
      const user = await User.findById(req.user._id).select('+password');
      if (!user || !(await user.comparePassword(oldPassword))) {
        throw new BadRequestError('Invalid current password');
      }

      user.password = newPassword;
      await user.save();

      // Terminate other sessions
      await Session.updateMany({ userId: user._id, _id: { $ne: req.session._id } }, { isRevoked: true });
      await RefreshToken.updateMany({ userId: user._id, token: { $ne: req.session.refreshTokHash } }, { isRevoked: true });

      const pwEvent = new SecurityEvent({
        userId: user._id,
        email: user.email,
        eventType: 'password_change',
        ipAddress: req.ip || 'Unknown',
        userAgent: req.headers['user-agent'] || 'Unknown'
      });
      await pwEvent.save();

      return ApiResponse.success(res, null, 'Password changed successfully');
    } catch (err) {
      next(err);
    }
  }

  // ── Verify Email ───────────────────────────────────────────────────
  static async verifyEmail(req, res, next) {
    try {
      const { token, email } = req.query;

      if (!token || !email) {
        throw new BadRequestError('Token and email parameters are required');
      }

      const user = await User.findOne({ email });
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.emailVerified) {
        return ApiResponse.success(res, null, 'Email is already verified');
      }

      const hash = hashToken(token);
      const storedHash = user.get('emailVerifyHash');
      const expires = user.get('emailVerifyExpires');

      if (!storedHash || storedHash !== hash || !expires || expires < Date.now()) {
        throw new BadRequestError('Invalid or expired email verification link');
      }

      user.emailVerified = true;
      user.set('emailVerifyHash', undefined, { strict: false });
      user.set('emailVerifyExpires', undefined, { strict: false });
      await user.save();

      return ApiResponse.success(res, null, 'Email verified successfully!');
    } catch (err) {
      next(err);
    }
  }

  // ── Resend Verification Email ──────────────────────────────────────
  static async resendVerification(req, res, next) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.emailVerified) {
        throw new BadRequestError('Email is already verified');
      }

      const verifyToken = crypto.randomBytes(32).toString('hex');
      const verifyTokenHash = hashToken(verifyToken);

      user.set('emailVerifyHash', verifyTokenHash, { strict: false });
      user.set('emailVerifyExpires', Date.now() + 24 * 3600 * 1000, { strict: false });
      await user.save();

      if (emailQueue) {
        await emailQueue.add('verify_email', {
          type: 'verify',
          data: { user: { name: user.name, email: user.email }, token: verifyToken }
        });
      }

      return ApiResponse.success(res, null, 'Verification email sent');
    } catch (err) {
      next(err);
    }
  }

  // ── Deactivate Account ─────────────────────────────────────────────
  static async deactivate(req, res, next) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      user.status = 'deactivated';
      await user.save();

      // Kill active sessions
      await Session.updateMany({ userId: user._id }, { isRevoked: true });
      await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });

      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');

      return ApiResponse.success(res, null, 'Account deactivated successfully');
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
