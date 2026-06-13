import { Queue } from 'bullmq';
import Redis from 'ioredis';
import config from '../config/index.js';
import logger from '../utils/logger.js';

// Setup Redis connection for BullMQ
let connection;
try {
  connection = new Redis(config.redisUrl, {
    maxRetriesPerRequest: null, // Required configuration for BullMQ
    lazyConnect: true
  });
  
  if (config.env !== 'test') {
    connection.connect().catch(err => {
      logger.error('Redis connection failed. Background queues might not operate correctly.', err);
    });
  }
} catch (err) {
  logger.error('Failed to initialize Redis client for queues:', err);
}

export const emailQueue = connection ? new Queue('email', { connection }) : null;
export const notificationQueue = connection ? new Queue('notification', { connection }) : null;
export const cleanupQueue = connection ? new Queue('cleanup', { connection }) : null;

logger.info('BullMQ Queues initialized');
