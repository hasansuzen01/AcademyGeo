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
# The public URLs are baked into the bundle here. Everything else the build
# needs, the R2 media host above all, is read from frontend/.env.local, which
# .dockerignore lets through for that reason.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_AUTH_URL
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_AUTH_URL=$NEXT_PUBLIC_AUTH_URL \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
COPY frontend frontend
RUN npm run build --workspace frontend

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/frontend/package.json frontend/package.json
COPY --from=build /app/frontend/next.config.ts frontend/next.config.ts
COPY --from=build /app/frontend/public frontend/public
COPY --from=build /app/frontend/.next frontend/.next
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "frontend"]
