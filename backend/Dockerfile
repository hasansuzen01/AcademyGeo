# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --ignore-scripts

FROM deps AS build
COPY apps/api apps/api
RUN npm run db:generate --workspace api \
 && npm run build --workspace api

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/apps/api/package.json apps/api/package.json
COPY --from=build /app/apps/api/prisma apps/api/prisma
COPY --from=build /app/apps/api/prisma.config.ts apps/api/prisma.config.ts
COPY --from=build /app/apps/api/dist apps/api/dist
WORKDIR /app/apps/api
EXPOSE 3001
# Bring the schema up to date and make sure the deck is present before serving.
CMD ["sh", "-c", "npx prisma migrate deploy && node --experimental-strip-types prisma/seed.ts && node dist/main.js"]
