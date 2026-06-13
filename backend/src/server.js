import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import config, { validateConfig } from './config/index.js';
import logger from './utils/logger.js';
import { initSocket, closeSocket } from './sockets/socket.js';
import { startWorkers, closeWorkers } from './jobs/workers.js';
import { redisConnection, scheduleCleanupJob } from './queues/queue.js';

let server;
let isShuttingDown = false;

async function bootstrap() {
  try {
    logger.info('Starting DSA Visualizer API bootstrap process...');
    logger.info('Validating configuration...');
    // Validate configuration before starting — fails hard if critical env vars missing
    validateConfig();
    logger.info('Configuration validation passed');

    logger.info('Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri, { autoIndex: true });
    logger.info('MongoDB connected successfully');

    // Start background workers
    startWorkers();

    // Schedule periodic database cleanup
    await scheduleCleanupJob();

    // Create HTTP server and attach Socket.IO
    server = http.createServer(app);
    initSocket(server);

    server.listen(config.port, () => {
      logger.info('='.repeat(50));
      logger.info(`DSA Visualizer API running on port ${config.port}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`Health check: http://localhost:${config.port}/health`);
      logger.info(`API docs: http://localhost:${config.port}/api-docs`);
      logger.info('='.repeat(50));
    });

    // ── Process signal handlers ────────────────────────────────────
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled promise rejection:', { reason, promise });
      // Don't exit on unhandled rejections — log and continue
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught exception — initiating shutdown:', err);
      gracefulShutdown(1);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received — initiating graceful shutdown');
      gracefulShutdown(0);
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received — initiating graceful shutdown');
      gracefulShutdown(0);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(exitCode = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info('Graceful shutdown initiated...');

  // Force exit after 15 seconds if shutdown stalls
  const forceExitTimer = setTimeout(() => {
    logger.error('Graceful shutdown timed out — forcing exit');
    process.exit(1);
  }, 15_000);
  forceExitTimer.unref(); // Don't prevent Node from exiting naturally

  try {
    // 1. Stop accepting new HTTP connections
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      logger.info('HTTP server closed');
    }

    // 2. Close Socket.IO
    await closeSocket();
    logger.info('Socket.IO closed');

    // 3. Close BullMQ workers
    await closeWorkers();
    logger.info('BullMQ workers closed');

    // 4. Close shared Redis connection
    if (redisConnection) {
      await redisConnection.quit();
      logger.info('Redis connection closed');
    }

    // 5. Close MongoDB
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');

    logger.info('Graceful shutdown complete');
    clearTimeout(forceExitTimer);
    process.exit(exitCode);
  } catch (err) {
    logger.error('Error during shutdown:', err);
    clearTimeout(forceExitTimer);
    process.exit(1);
  }
}

bootstrap();
export default server;
