# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

WORKDIR /repo

# Dependency manifests first (Docker layer cache)
COPY package.json pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN pnpm install --frozen-lockfile

# Source
COPY packages/shared/ ./packages/shared/
COPY packages/db/ ./packages/db/
COPY apps/web/ ./apps/web/

# Build Next.js (standalone output)
RUN pnpm --filter @pippit/web build

# ── Stage 2: Runner ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/.next/static     ./apps/web/.next/static
COPY --from=builder /repo/apps/web/public           ./apps/web/public

USER nextjs
EXPOSE 3000

CMD ["node", "apps/web/server.js"]
