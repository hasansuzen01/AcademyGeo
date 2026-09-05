import type { Express, RequestHandler } from 'express';

import { AUTH_BASE_PATH } from './auth.js';

/**
 * Mounts the Better Auth handler on every path below its base.
 *
 * The path is a plain prefix rather than a wildcard. Better Auth rebuilds the
 * request URL as `baseUrl + url` and only trusts the result when it equals
 * `originalUrl`. A wildcard mount puts the whole path in `baseUrl` and leaves
 * `/` in `url`, so the two disagree by a slash, the rebuilt URL falls back to
 * the path alone, and the query string is lost. Google's callback carries its
 * `state` and `code` there, so every sign-in ended in `state_not_found`.
 */
export function mountAuthHandler(app: Express, handler: RequestHandler): void {
  app.use(AUTH_BASE_PATH, handler);
}
