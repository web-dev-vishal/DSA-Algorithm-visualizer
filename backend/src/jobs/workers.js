import { Worker } from 'bullmq';
import { redisConnection } from '../queues/queue.js';
import emailService from '../services/email.service.js';
import logger from '../utils/logger.js';
import Session from '../models/Session.js';
import RefreshToken from '../models/RefreshToken.js';
import config from '../config/index.js';

const workers = [];

/**
 * Start all BullMQ background workers.
 * Workers consume jobs from the shared Redis connection.
 */
export function startWorkers() {
  if (config.env === 'test') {
    logger.info('Workers skipped in test environment');
    return;
  }

  if (!redisConnection) {
    logger.warn('Redis connection unavailable — background workers not started');
    return;
  }

  // ── 1. Email Worker ───────────────────────────────────────────────
  const emailWorker = new Worker('email', async (job) => {
    logger.debug(`Processing email job ${job.id}`, { type: job.data.type });
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
        logger.warn(`Unknown email job type: ${type}`, { jobId: job.id });
        throw new Error(`Unknown email job type: ${type}`);
    }
  }, {
    connection: redisConnection,
    concurrency: 3,
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 20 }
  });

  // ── 2. Notification Worker ────────────────────────────────────────
  const notificationWorker = new Worker('notification', async (job) => {
    logger.debug(`Processing notification job ${job.id}`);
    const { userId, notification } = job.data;

    const { pushNotificationToUser } = await import('../sockets/socket.js');
    pushNotificationToUser(userId, notification);
  }, {
    connection: redisConnection,
    concurrency: 5,
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 20 }
  });

  // ── 3. Cleanup Worker ─────────────────────────────────────────────
  const cleanupWorker = new Worker('cleanup', async (job) => {
    logger.info(`Starting cleanup job ${job.id}`);
    const now = new Date();

    const [sessionResult, tokenResult] = await Promise.all([
      Session.deleteMany({ expiresAt: { $lt: now } }),
      RefreshToken.deleteMany({ expiresAt: { $lt: now } })
    ]);

    const stats = {
      sessionsRemoved: sessionResult.deletedCount,
      tokensRemoved: tokenResult.deletedCount
    };

    logger.info('Cleanup job completed', stats);
    return stats;
  }, {
    connection: redisConnection,
    concurrency: 1,
    removeOnComplete: { count: 5 },
    removeOnFail: { count: 5 }
  });

  // ── Wire up event handlers ─────────────────────────────────────────
  [
    { worker: emailWorker, name: 'email' },
    { worker: notificationWorker, name: 'notification' },
    { worker: cleanupWorker, name: 'cleanup' }
  ].forEach(({ worker, name }) => {
    worker.on('completed', (job) =>
      logger.debug(`[${name}] Job ${job.id} completed`)
    );
    worker.on('failed', (job, err) =>
      logger.error(`[${name}] Job ${job?.id} failed: ${err.message}`, { error: err })
    );
    worker.on('error', (err) =>
      logger.error(`[${name}] Worker error:`, err)
    );

    workers.push(worker);
  });

  logger.info('BullMQ workers started successfully', { count: workers.length });
}

/**
 * Gracefully close all active workers.
 * Called during server shutdown.
 */
export async function closeWorkers() {
  await Promise.all(workers.map(w => w.close()));
  logger.info('All BullMQ workers closed');
}

export default startWorkers;
