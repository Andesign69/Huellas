# Build context is the repo root (see infra/docker-compose.yml), so paths
# below are relative to the repo, not this file's own directory.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# No hace falta DATABASE_URL acá: pg.Pool() no conecta hasta el primer
# query, y ninguna ruta se prerenderiza contra la DB en build (confirmado
# corriendo el build sin la variable antes de escribir este Dockerfile).
#
# NEXT_PUBLIC_MAPTILER_KEY sí hace falta en build: las variables NEXT_PUBLIC_*
# se incrustan en el bundle del cliente en build time, no se leen en runtime
# como DATABASE_URL. Por eso prod y staging pueden compartir esta misma
# imagen (DATABASE_URL / UPLOADS_DIR cambian por contenedor en runtime, esto
# no) — ver infra/docker-compose.yml.
ARG NEXT_PUBLIC_MAPTILER_KEY
ENV NEXT_PUBLIC_MAPTILER_KEY=$NEXT_PUBLIC_MAPTILER_KEY
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
