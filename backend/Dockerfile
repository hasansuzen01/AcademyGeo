# syntax=docker/dockerfile:1
#
# The API, built for Coolify.
#
# Build context is the repository root, not this directory: the workspace
# lockfile and the frontend's package.json both have to be present for
# `npm ci` to resolve the same tree the repository was developed against.
# In Coolify set "Base Directory" to / and "Dockerfile Location" to
# backend/Dockerfile.

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
# The Prisma CLI is needed at start-up to bring the schema up to date, so the
# production install keeps dev dependencies. Trimming them would save less
# than re-downloading the CLI on every boot costs.
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/backend/package.json backend/package.json
COPY --from=build --chown=node:node /app/backend/prisma backend/prisma
COPY --from=build --chown=node:node /app/backend/prisma.config.ts backend/prisma.config.ts
COPY --from=build --chown=node:node /app/backend/dist backend/dist
# The seed runs from TypeScript, through Node's own type stripping, and reads
# the content helpers straight out of src. Running it against the compiled
# output instead would mean the deployed seed and the one anybody runs locally
# were different programs.
COPY --from=build --chown=node:node /app/backend/src backend/src
COPY --chmod=755 backend/docker-entrypoint.sh /usr/local/bin/entrypoint.sh

# Nothing here needs root, and a container that never had it cannot lose it.
USER node
WORKDIR /app/backend

EXPOSE 3001
ENV PORT=3001

# Coolify watches this to decide when a new container is ready to take traffic.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/health/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "dist/main.js"]
