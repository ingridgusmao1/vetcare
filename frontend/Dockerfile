# ============================================================================
# STAGE 1 — build the static SPA with Vite
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build         # outputs to /app/dist

# ============================================================================
# STAGE 2 — serve the static files with nginx
# ============================================================================
FROM nginx:alpine

# Replace the default config so nginx knows about /api proxy + SPA fallback.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets to nginx's served directory.
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
# nginx alpine starts the daemon by default — no CMD override needed.