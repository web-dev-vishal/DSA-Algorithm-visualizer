# ── Stage 1: Build dependencies ──────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Install all dependencies (including devDependencies needed during build)
RUN npm ci

COPY . .

# ── Stage 2: Production image ─────────────────────────────────────────
FROM node:20-slim AS production

WORKDIR /usr/src/app

# Copy package files and install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source from builder
COPY --from=builder /usr/src/app/src ./src

# Create logs directory with correct ownership
RUN mkdir -p logs && chown -R node:node /usr/src/app

# Run as non-root user for security
USER node

EXPOSE 5000

ENV NODE_ENV=production

# Health check: probe the /health endpoint every 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
