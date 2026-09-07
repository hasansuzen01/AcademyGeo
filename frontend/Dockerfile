# syntax=docker/dockerfile:1
#
# The web app, built for Coolify.
#
# Build context is the repository root. In Coolify set "Base Directory" to /
# and "Dockerfile Location" to frontend/Dockerfile.
#
# Everything the browser is told is baked in here, at build time, so all four
# NEXT_PUBLIC_* values have to be set as Coolify BUILD arguments and not only
# as runtime variables. Getting that wrong ships a bundle that calls localhost
# and refuses to draw a single uploaded picture.

FROM node:24-alpine AS base
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

FROM base AS deps
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci --ignore-scripts

FROM deps AS build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_AUTH_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_MEDIA_HOST
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_AUTH_URL=$NEXT_PUBLIC_AUTH_URL \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_MEDIA_HOST=$NEXT_PUBLIC_MEDIA_HOST \
    NEXT_TELEMETRY_DISABLED=1
COPY frontend frontend
RUN npm run build --workspace frontend

FROM base AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

# The standalone output carries only the files the server actually reaches for,
# so the image holds neither the backend's dependencies nor any dev tooling.
COPY --from=build --chown=node:node /app/frontend/.next/standalone ./
COPY --from=build --chown=node:node /app/frontend/.next/static ./frontend/.next/static
COPY --from=build --chown=node:node /app/frontend/public ./frontend/public

USER node

EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "frontend/server.js"]
