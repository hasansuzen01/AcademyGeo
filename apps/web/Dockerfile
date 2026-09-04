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
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_AUTH_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_MEDIA_HOST
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_AUTH_URL=$NEXT_PUBLIC_AUTH_URL \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_MEDIA_HOST=$NEXT_PUBLIC_MEDIA_HOST
COPY apps/web apps/web
RUN npm run build --workspace web

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/apps/web/package.json apps/web/package.json
COPY --from=build /app/apps/web/next.config.ts apps/web/next.config.ts
COPY --from=build /app/apps/web/public apps/web/public
COPY --from=build /app/apps/web/.next apps/web/.next
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "web"]
