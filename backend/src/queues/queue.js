import { Queue } from 'bullmq';
import Redis from 'ioredis';
import config from '../config/index.js';
import logger from '../utils/logger.js';

// ── Singleton Redis connection for all queues ─────────────────────────
// A single connection is shared between all queues (email, notification, cleanup)
// and the workers module to avoid connection proliferation.
let connection = null;

function createRedisConnection() {
  const client = new Redis(config.redisUrl, {
    maxRetriesPerRequest: null, // Required for BullMQ
    lazyConnect: true,
    enableReadyCheck: false
  });

  client.on('error', (err) => {
    logger.error('BullMQ Redis connection error:', err);
  });

  client.on('connect', () => {
    logger.info('BullMQ Redis connection established');
  });

  return client;
}

if (config.env !== 'test') {
  try {
    connection = createRedisConnection();
    connection.connect().catch(err => {
      logger.error('Failed to connect BullMQ Redis — background jobs will be unavailable:', err);
    });
  } catch (err) {
    logger.error('Failed to initialize BullMQ Redis client:', err);
  }
}

// ── Queues ──────────────────────────────────────────────────────────────
export const emailQueue        = connection ? new Queue('email', { connection }) : null;
export const notificationQueue = connection ? new Queue('notification', { connection }) : null;
export const cleanupQueue      = connection ? new Queue('cleanup', { connection }) : null;

/**
 * Schedule the periodic database cleanup job if not already scheduled.
 * Runs every 6 hours to purge expired sessions and refresh tokens.
 */
export async function scheduleCleanupJob() {
  if (!cleanupQueue) {
    logger.warn('Cleanup queue unavailable — skipping job scheduling');
    return;
  }

  try {
    // Remove any existing repeatable cleanup job before adding a new one
    const repeatableJobs = await cleanupQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await cleanupQueue.removeRepeatableByKey(job.key);
    }

    await cleanupQueue.add(
      'cleanup_expired_records',
      { type: 'cleanup' },
      {
        repeat: { every: 6 * 60 * 60 * 1000 }, // Every 6 hours
        removeOnComplete: { count: 5 },
        removeOnFail: { count: 10 }
      }
    );

    logger.info('Cleanup job scheduled: runs every 6 hours');
  } catch (err) {
    logger.error('Failed to schedule cleanup job:', err);
  }
}

/**
 * Export the shared Redis connection for use in graceful shutdown.
 */
export { connection as redisConnection };

logger.info(`BullMQ queues initialized (${config.env === 'test' ? 'disabled in test' : 'active'})`);
