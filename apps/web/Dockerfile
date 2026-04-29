# ── Stage 1: Install dependencies ─────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Copy workspace package manifests
COPY package.json package-lock.json .npmrc turbo.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/trpc/package.json ./packages/trpc/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json

RUN npm ci

# ── Stage 2: Build ────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app ./
COPY . .

# Env vars not available at build time
ENV SKIP_ENV_VALIDATION=1

# Public vars must be inlined at build time
ARG NEXT_PUBLIC_BETTER_AUTH_URL
ENV NEXT_PUBLIC_BETTER_AUTH_URL=$NEXT_PUBLIC_BETTER_AUTH_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

RUN npm run build -w web

# ── Stage 3: Run ──────────────────────────────────────────────────────
FROM node:22-alpine AS run
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3020

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3020

CMD ["node", "apps/web/server.js"]
