# ── Stage 1: Build the React Application ──────────────────────────────
FROM node:20-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

# Run production build
RUN npm run build

# ── Stage 2: Serve the built static assets using Nginx ─────────────────
FROM nginx:alpine-slim

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from Stage 1 to Nginx public folder
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
