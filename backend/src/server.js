import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';
import { initSocket } from './sockets/socket.js';
import { startWorkers } from './jobs/workers.js';

let server;

async function bootstrap() {
  try {
    logger.info('Initializing application database connection...');
    
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri, {
      autoIndex: true
    });
    logger.info('Successfully connected to MongoDB Database');

    // Start background job workers
    startWorkers();

    // Create HTTP Server
    server = http.createServer(app);

    // Attach Socket.IO
    initSocket(server);

    // Start Server
    server.listen(config.port, () => {
      logger.info(`==================================================`);
      logger.info(`DSA Visualizer Server listening on Port: ${config.port}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`API Documentation available at: ${config.clientUrl}/api-docs`);
      logger.info(`==================================================`);
    });

    // Handle system-wide promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! Shutting down server gracefully...', err);
      gracefulShutdown();
    });

    process.on('uncaughtException', (err) => {
      logger.error('UNCAUGHT EXCEPTION! Shutting down server gracefully...', err);
      gracefulShutdown();
    });

    // Listen for terminate signals
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Initiating graceful shutdown...');
      gracefulShutdown();
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received. Initiating graceful shutdown...');
      gracefulShutdown();
    });

  } catch (error) {
    logger.error('Server failed to bootstrap:', error);
    process.exit(1);
  }
}

function gracefulShutdown() {
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        // Disconnect MongoDB connection
        await mongoose.connection.close();
        logger.info('Mongoose connections closed.');
        
        // Disconnect worker connections if any are active
        const { default: Redis } = await import('ioredis');
        const redisClient = new Redis(config.redisUrl);
        await redisClient.quit();
        logger.info('Redis connections purged.');
        
        logger.info('Graceful shutdown completed successfully. Exiting.');
        process.exit(0);
      } catch (err) {
        logger.error('Error during database cleanup during shutdown:', err);
        process.exit(1);
      }
    });

    // Force exit after 10s if graceful close stalls
    setTimeout(() => {
      logger.error('Could not close server in time, forcing exit.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

// Execute bootstrap
bootstrap();
export default server;
