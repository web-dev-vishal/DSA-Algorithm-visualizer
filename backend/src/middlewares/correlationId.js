import { v4 as uuidv4 } from 'uuid';

/**
 * Correlation ID middleware.
 *
 * Attaches a unique request ID to every incoming request.
 * - Reads X-Request-ID from the client if provided (useful for tracing across services).
 * - Generates a new UUID v4 if none is provided.
 * - Adds X-Request-ID to the response headers so clients can correlate logs.
 * - Attaches correlationId to req for use in controllers and loggers.
 */
export function correlationId(req, res, next) {
  const id = req.headers['x-request-id'] || uuidv4();
  req.correlationId = id;
  res.setHeader('X-Request-ID', id);
  next();
}

export default correlationId;
