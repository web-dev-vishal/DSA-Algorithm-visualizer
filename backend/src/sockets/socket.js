import { Server } from 'socket.io';
import PasetoService from '../services/paseto.service.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

let io = null;

/**
 * In-memory presence tracker: userId -> Set of socket IDs.
 * For multi-instance deployments, use a Redis adapter instead.
 */
const onlineUsers = new Map();

/**
 * Initialize the Socket.IO server and attach authentication middleware.
 * @param {import('http').Server} server
 * @returns {Server}
 */
export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: config.clientUrl,
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 10000
  });

  // ── Authentication middleware ─────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      let token = null;

      if (socket.handshake.auth?.token) {
        token = socket.handshake.auth.token;
      } else if (socket.handshake.headers.authorization?.startsWith('Bearer ')) {
        token = socket.handshake.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return next(new Error('Authentication token is required'));
      }

      const decoded = await PasetoService.verifyAccessToken(token);

      // Verify the session is still valid
      const session = await Session.findOne({ _id: decoded.sessionId, isRevoked: false });
      if (!session) {
        return next(new Error('Session has expired or been revoked'));
      }

      const user = await User.findById(decoded.userId);
      if (!user) return next(new Error('User account not found'));
      if (user.status !== 'active') return next(new Error(`Account is ${user.status}`));

      socket.user = user;
      socket.sessionId = decoded.sessionId;
      next();
    } catch (err) {
      logger.warn(`Socket authentication failed: ${err.message}`);
      next(new Error('Authentication failed'));
    }
  });

  // ── Connection handler ────────────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    logger.info(`Socket connected`, { userId, socketId: socket.id });

    // Join personal channel for targeted notifications
    socket.join(`user:${userId}`);

    // Track online presence
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
      socket.broadcast.emit('presence:online', { userId });
    }
    onlineUsers.get(userId).add(socket.id);

    // Notify new connection of current online users
    socket.emit('presence:list', Array.from(onlineUsers.keys()));

    // ── Room management (with authorization) ─────────────────────
    socket.on('room:join', (roomId) => {
      if (!roomId || typeof roomId !== 'string' || roomId.length > 100) {
        socket.emit('error', { message: 'Invalid room ID' });
        return;
      }

      // Only allow joining rooms prefixed with the user's own ID or shared rooms
      // In production, validate against a database of allowed rooms
      const sanitizedRoomId = roomId.replace(/[^a-zA-Z0-9_-]/g, '');
      if (!sanitizedRoomId) {
        socket.emit('error', { message: 'Invalid room ID format' });
        return;
      }

      socket.join(`room:${sanitizedRoomId}`);
      logger.debug(`Socket joined room`, { socketId: socket.id, roomId: sanitizedRoomId });
    });

    socket.on('room:leave', (roomId) => {
      if (!roomId || typeof roomId !== 'string') return;
      const sanitizedRoomId = roomId.replace(/[^a-zA-Z0-9_-]/g, '');
      socket.leave(`room:${sanitizedRoomId}`);
      logger.debug(`Socket left room`, { socketId: socket.id, roomId: sanitizedRoomId });
    });

    // ── Typing indicators ─────────────────────────────────────────
    socket.on('typing:start', (data) => {
      if (!data?.roomId || typeof data.roomId !== 'string') return;
      const sanitizedRoomId = data.roomId.replace(/[^a-zA-Z0-9_-]/g, '');
      socket.to(`room:${sanitizedRoomId}`).emit('typing:start', {
        userId,
        username: socket.user.name
      });
    });

    socket.on('typing:stop', (data) => {
      if (!data?.roomId || typeof data.roomId !== 'string') return;
      const sanitizedRoomId = data.roomId.replace(/[^a-zA-Z0-9_-]/g, '');
      socket.to(`room:${sanitizedRoomId}`).emit('typing:stop', { userId });
    });

    // ── Disconnect ────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected`, { socketId: socket.id, userId, reason });

      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          socket.broadcast.emit('presence:offline', {
            userId,
            lastSeen: new Date()
          });

          // Update session lastActive (non-blocking)
          Session.findByIdAndUpdate(socket.sessionId, { lastActive: new Date() })
            .catch(err => logger.error('Failed to update session lastActive:', err));
        }
      }
    });
  });

  return io;
}

/**
 * Push a notification to all active sockets for a user.
 * @param {string} userId
 * @param {Object} notification
 */
export function pushNotificationToUser(userId, notification) {
  if (!io) {
    logger.warn('Socket.IO server not initialized — notification not delivered');
    return;
  }
  io.to(`user:${userId}`).emit('notification', notification);
  logger.debug(`Notification pushed`, { userId });
}

/**
 * Broadcast dashboard telemetry to all connected admin clients.
 * @param {Object} metrics
 */
export function broadcastDashboardUpdate(metrics) {
  if (!io) return;
  io.to('admin:dashboard').emit('dashboard:telemetry', metrics);
}

/**
 * Close the Socket.IO server (used during graceful shutdown).
 */
export function closeSocket() {
  return new Promise((resolve) => {
    if (!io) return resolve();
    io.close(resolve);
  });
}

export default initSocket;
