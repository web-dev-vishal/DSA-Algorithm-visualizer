import { Server } from 'socket.io';
import PasetoService from '../services/paseto.service.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

let io = null;
const onlineUsers = new Map(); // Map of userId -> Set of socket.ids

/**
 * Initialize Socket.io Server
 * @param {import('http').Server} server 
 */
export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: config.clientUrl,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication Middleware
  io.use(async (socket, next) => {
    try {
      let token = null;

      // Extract token from query or headers
      if (socket.handshake.auth && socket.handshake.auth.token) {
        token = socket.handshake.auth.token;
      } else if (socket.handshake.headers.authorization) {
        const parts = socket.handshake.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
          token = parts[1];
        }
      }

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify token
      const decoded = await PasetoService.verifyAccessToken(token);

      // Verify User
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error('User not found'));
      }

      if (user.status !== 'active') {
        return next(new Error(`Account status is ${user.status}`));
      }

      socket.user = user;
      socket.sessionId = decoded.sessionId;
      next();
    } catch (err) {
      logger.warn(`Socket.IO handshake authentication failed: ${err.message}`);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    logger.info(`Socket IO connected: User ${userId} [Socket: ${socket.id}]`);

    // 1. Join individual user channel for targeted notifications
    socket.join(`user:${userId}`);

    // 2. Update presence tracker
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
      // Broadcast online status
      socket.broadcast.emit('presence:online', { userId });
    }
    onlineUsers.get(userId).add(socket.id);

    // Send active online users list to current socket
    socket.emit('presence:list', Array.from(onlineUsers.keys()));

    // 3. Collaborative features / room joins
    socket.on('room:join', (roomId) => {
      socket.join(`room:${roomId}`);
      logger.debug(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('room:leave', (roomId) => {
      socket.leave(`room:${roomId}`);
      logger.debug(`Socket ${socket.id} left room ${roomId}`);
    });

    // 4. Typing indicators
    socket.on('typing:start', (data) => {
      const { roomId } = data;
      if (roomId) {
        socket.to(`room:${roomId}`).emit('typing:start', { userId, username: socket.user.name });
      }
    });

    socket.on('typing:stop', (data) => {
      const { roomId } = data;
      if (roomId) {
        socket.to(`room:${roomId}`).emit('typing:stop', { userId });
      }
    });

    // 5. Cleanup on disconnect
    socket.on('disconnect', () => {
      logger.info(`Socket IO disconnected: Socket ${socket.id}`);
      
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          
          // Broadcast offline event with last active timestamp
          const lastSeen = new Date();
          socket.broadcast.emit('presence:offline', { userId, lastSeen });

          // Non-blocking update to user preferences/settings last active
          User.findByIdAndUpdate(userId, { updatedAt: lastSeen }).catch(err => {
            logger.error(`Failed to update last seen status for ${userId}:`, err);
          });
        }
      }
    });
  });

  return io;
}

/**
 * Pushes notification message to active socket rooms for a specific user ID
 * @param {string} userId 
 * @param {Object} notification 
 */
export function pushNotificationToUser(userId, notification) {
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
    logger.debug(`Socket IO notification pushed to user:${userId}`);
  } else {
    logger.warn('Socket IO server not initialized; skipped push notification.');
  }
}

/**
 * Broadcast dashboard telemetry statistics
 * @param {Object} metrics 
 */
export function broadcastDashboardUpdate(metrics) {
  if (io) {
    io.emit('dashboard:telemetry', metrics);
  }
}
export default initSocket;
