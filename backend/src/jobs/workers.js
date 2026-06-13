import { Worker } from 'bullmq';
import Redis from 'ioredis';
import config from '../config/index.js';
import emailService from '../services/email.service.js';
import logger from '../utils/logger.js';
import Session from '../models/Session.js';
import RefreshToken from '../models/RefreshToken.js';

let connection;
try {
  connection = new Redis(config.redisUrl, {
    maxRetriesPerRequest: null,
    lazyConnect: true
  });
} catch (err) {
  logger.error('Failed to initialize Redis connection for workers:', err);
}

export function startWorkers() {
  if (config.env === 'test' || !connection) {
    logger.warn('Workers not starting (test environment or no Redis connection)');
    return;
  }

  // Connect to Redis
  connection.connect().catch(err => {
    logger.error('Redis connection for workers failed:', err);
  });

  // 1. Email Queue Worker
  const emailWorker = new Worker('email', async (job) => {
    logger.info(`Processing email job ${job.id} [${job.data.type}]`);
    const { type, data } = job.data;
    
    switch (type) {
      case 'welcome':
        await emailService.sendWelcomeEmail(data.user);
        break;
      case 'verify':
        await emailService.sendVerificationEmail(data.user, data.token);
        break;
      case 'forgot':
        await emailService.sendForgotPasswordEmail(data.user, data.token);
        break;
      case 'login_alert':
        await emailService.sendLoginAlert(data.user, data.session);
        break;
      case 'lockout':
        await emailService.sendLockoutAlert(data.user);
        break;
      default:
        logger.warn(`Unknown email job type: ${type}`);
    }
  }, { connection });

  // 2. Notification Queue Worker
  const notificationWorker = new Worker('notification', async (job) => {
    logger.info(`Processing notification job ${job.id}`);
    const { userId, notification } = job.data;

    // Load socket server dynamically to avoid circular dependencies
    try {
      const { pushNotificationToUser } = await import('../sockets/socket.js');
      pushNotificationToUser(userId, notification);
    } catch (err) {
      logger.error('Failed to broadcast socket notification:', err);
    }
  }, { connection });

  // 3. System Cleanup Worker
  const cleanupWorker = new Worker('cleanup', async (job) => {
    logger.info(`Processing cleanup job ${job.id}`);
    try {
      const now = new Date();
      const sessionPurge = await Session.deleteMany({ expiresAt: { $lt: now } });
      const tokenPurge = await RefreshToken.deleteMany({ expiresAt: { $lt: now } });
      logger.info(`Cleanup worker finished. Purged ${sessionPurge.deletedCount} sessions and ${tokenPurge.deletedCount} refresh tokens.`);
    } catch (err) {
      logger.error('Cleanup worker failed:', err);
      throw err;
    }
  }, { connection });

  emailWorker.on('completed', (job) => logger.debug(`Email job ${job.id} completed`));
  emailWorker.on('failed', (job, err) => logger.error(`Email job ${job.id} failed: ${err.message}`));

  notificationWorker.on('completed', (job) => logger.debug(`Notification job ${job.id} completed`));
  notificationWorker.on('failed', (job, err) => logger.error(`Notification job ${job.id} failed: ${err.message}`));

  cleanupWorker.on('completed', (job) => logger.debug(`Cleanup job ${job.id} completed`));
  cleanupWorker.on('failed', (job, err) => logger.error(`Cleanup job ${job.id} failed: ${err.message}`));

  logger.info('BullMQ workers started successfully');
}
export default startWorkers;
