import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve logs directory relative to this file (not process.cwd())
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '..', '..', 'logs');

// ── JSON log format for file transport ───────────────────────────────
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// ── Human-readable format for console transport ───────────────────────
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, stack, correlationId, ...meta }) => {
    const correlation = correlationId ? ` [${correlationId}]` : '';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}]${correlation} ${level}: ${stack || message}${metaStr}`;
  })
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: jsonFormat,
  defaultMeta: { service: 'dsa-visualizer-backend' },
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
      silent: process.env.NODE_ENV === 'test' // Suppress logs during tests
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10
    })
  ]
});

export default logger;
