FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables (dummy values for build)
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dummy"
ENV AUTH0_SECRET="dummy-secret-for-build-only"
ENV AUTH0_DOMAIN="dummy.auth0.com"
ENV AUTH0_CLIENT_ID="dummy-client-id"
ENV AUTH0_CLIENT_SECRET="dummy-client-secret"
ENV APP_BASE_URL="http://localhost:3000"
ENV SENTRY_AUTH_TOKEN=""
ENV NEXT_PUBLIC_SENTRY_DSN=""

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files for standalone
COPY --from=builder /app/public ./public

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Runtime environment variables will be provided by Kubernetes
# Start the standalone server
CMD ["node", "server.js"]