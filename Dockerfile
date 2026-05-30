FROM node:24-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
COPY swagger-output.json ./
COPY logs ./logs
COPY seed-images ./seed-images
COPY uploads ./uploads
RUN npm run build

FROM node:24-alpine AS runner-base

RUN addgroup -S mercado_libre \
    && adduser -S mercado_libre -G mercado_libre
WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN npm ci
COPY --from=builder /app/dist ./dist
COPY ./drizzle ./drizzle
COPY drizzle.config.ts ./
USER mercado_libre
EXPOSE 3030

FROM runner-base AS development

USER mercado_libre
ENV NODE_ENV=development
COPY --from=builder --chown=root:root --chmod=755 /app/src ./src
COPY --from=builder --chown=root:root --chmod=755 /app/swagger-output.json ./
COPY --from=builder --chown=mercado_libre:mercado_libre --chmod=700 /app/logs ./logs
COPY --from=builder --chown=mercado_libre:mercado_libre --chmod=700 /app/seed-images ./seed-images
COPY --from=builder --chown=mercado_libre:mercado_libre --chmod=700 /app/uploads ./uploads
CMD ["node", "dist/index.js"]

FROM runner-base AS production

USER mercado_libre
ENV NODE_ENV=production
COPY --from=builder --chown=mercado_libre:mercado_libre --chmod=700 /app/logs ./logs
COPY --from=builder --chown=mercado_libre:mercado_libre --chmod=700 /app/seed-images ./seed-images
COPY --from=builder --chown=mercado_libre:mercado_libre --chmod=700 /app/uploads ./uploads
CMD ["node", "dist/index.js"]
