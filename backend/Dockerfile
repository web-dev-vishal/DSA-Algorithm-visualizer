# Stage 1: Build dependencies
FROM node:20-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Install production and development dependencies
RUN npm ci

COPY . .

# Stage 2: Production image
FROM node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

COPY --from=builder /usr/src/app/src ./src

# Create logs and upload directories
RUN mkdir -p logs src/uploads && chown -R node:node /usr/src/app

USER node

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
