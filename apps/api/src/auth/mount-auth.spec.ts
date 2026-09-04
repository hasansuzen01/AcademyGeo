import express, { type Request } from 'express';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';

import { AUTH_BASE_PATH } from './auth.js';
import { mountAuthHandler } from './mount-auth.js';

let close: (() => Promise<void>) | undefined;

afterEach(async () => {
  await close?.();
  close = undefined;
});

/** Serves one request through the real mount and reports what the handler saw. */
async function requestThroughMount(path: string): Promise<Request> {
  const app = express();
  let seen: Request | undefined;

  mountAuthHandler(app, (request, response) => {
    seen = request;
    response.end();
  });

  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  close = () => new Promise((resolve) => server.close(() => resolve()));

  const { port } = server.address() as AddressInfo;
  await fetch(`http://127.0.0.1:${port}${path}`);

  if (!seen) throw new Error('the auth handler was never reached');
  return seen;
}

describe('mountAuthHandler', () => {
  const callback = `${AUTH_BASE_PATH}/callback/google?code=abc&state=xyz`;

  it('routes the auth paths to the handler', async () => {
    const request = await requestThroughMount(callback);

    expect(request.originalUrl).toBe(callback);
  });

  // Better Auth rebuilds the request URL as `baseUrl + url` and only trusts it
  // when that equals `originalUrl`. Mounting on a wildcard put the whole path
  // in `baseUrl` and left `/` in `url`, so the two stopped matching and the
  // query string was dropped. Every Google callback then failed with
  // `state_not_found`, because the state parameter never arrived.
  it('leaves the URL in the shape Better Auth can rebuild', async () => {
    const request = await requestThroughMount(callback);

    expect(request.baseUrl + request.url).toBe(request.originalUrl);
  });

  it('keeps the query string the OAuth callback carries', async () => {
    const request = await requestThroughMount(callback);

    expect(request.url).toContain('state=xyz');
    expect(request.url).toContain('code=abc');
  });
});
