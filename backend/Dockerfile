# ============================================================================
# STAGE 1 — builder
# Compiles TypeScript to JavaScript. Has dev dependencies installed.
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests first — layer cache trick. If only source code
# changes (not deps), Docker reuses the npm install layer.
COPY package*.json ./

# `npm ci` is stricter than install: it requires package-lock.json and never
# touches it. Faster and reproducible across machines.
RUN npm ci

# Now copy the rest of the project and build.
COPY . .
RUN npm run build

# ============================================================================
# STAGE 2 — runtime
# A clean image with ONLY production deps + compiled JS. ~200 MB smaller.
# ============================================================================
FROM node:20-alpine

WORKDIR /app

# Don't run as root in production — security best practice.
RUN addgroup -S vetcare && adduser -S vetcare -G vetcare

# Production deps only.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from the builder stage.
COPY --from=builder /app/dist ./dist

# Switch to the unprivileged user.
USER vetcare

# Container will listen on this port. docker-compose maps it externally.
EXPOSE 4000

# Healthcheck: docker-compose can refuse to start dependents until healthy.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/server.js"]