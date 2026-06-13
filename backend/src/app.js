import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import Redis from 'ioredis';

import config from './config/index.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/error.js';
import { generalLimiter } from './middlewares/rateLimiter.js';
import { ApiResponse } from './utils/apiResponse.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';

const app = express();

// 1. Basic security headers
app.use(helmet());

// 2. CORS configuration (allow credentials & target client url)
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// 3. Request parsing & cookie handling
app.use(express.json({ limit: '10kb' })); // Mitigate DOS by restricting JSON size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(config.cookieSecret));

// 4. Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// 5. Data sanitization against XSS (HTML scripting injection)
app.use(xss());

// 6. Gzip compression
app.use(compression());

// 7. General rate limiting for entire application API
app.use('/api', generalLimiter);

// 8. Serve temporary uploads folder statically (e.g. for mock file uploads)
const uploadsPath = path.join(process.cwd(), 'src', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// 9. Central Health Check Endpoint (checks DB + Redis connectivity)
app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    env: config.env,
    database: 'disconnected',
    redis: 'disconnected'
  };

  try {
    if (mongoose.connection.readyState === 1) {
      health.database = 'connected';
    }
  } catch (err) {
    health.database = `error: ${err.message}`;
  }

  try {
    const redis = new Redis(config.redisUrl, { maxRetriesPerRequest: 1, connectTimeout: 1000 });
    const ping = await redis.ping();
    if (ping === 'PONG') {
      health.redis = 'connected';
    }
    redis.disconnect();
  } catch (err) {
    health.redis = `error: ${err.message}`;
  }

  const isHealthy = health.database === 'connected' && (config.env === 'test' || health.redis === 'connected');
  return res.status(isHealthy ? 200 : 503).json(
    new ApiResponse(isHealthy ? 200 : 503, health, isHealthy ? 'System is healthy' : 'System is degraded')
  );
});

// 10. Swagger Docs integration
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// 11. Core Routing Registration
app.use('/api/v1', apiRoutes);

// 12. Handle 404 routes
app.use('*', (req, res, next) => {
  res.status(404).json(
    new ApiResponse(404, null, `Path ${req.originalUrl} not found`)
  );
});

// 13. Centralized Error Middleware (must be registered last!)
app.use(errorHandler);

export default app;
