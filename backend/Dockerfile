# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

FROM base AS deps
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci --ignore-scripts

FROM deps AS build
COPY backend backend
RUN npm run db:generate --workspace backend \
 && npm run build --workspace backend

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/backend/package.json backend/package.json
COPY --from=build /app/backend/prisma backend/prisma
COPY --from=build /app/backend/prisma.config.ts backend/prisma.config.ts
COPY --from=build /app/backend/dist backend/dist
WORKDIR /app/backend
EXPOSE 3001
# Bring the schema up to date and make sure the deck is present before serving.
CMD ["sh", "-c", "npx prisma migrate deploy && node --experimental-strip-types prisma/seed.ts && node dist/main.js"]
