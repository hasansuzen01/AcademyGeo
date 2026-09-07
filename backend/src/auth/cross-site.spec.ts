import { describe, expect, it } from 'vitest';

import { needsCrossSiteCookie } from './cross-site.js';

describe('needsCrossSiteCookie', () => {
  it('is not needed when both apps answer on the same origin', () => {
    expect(
      needsCrossSiteCookie({ webUrl: 'https://academygeo.com', apiUrl: 'https://academygeo.com' }),
    ).toBe(false);
  });

  // The usual production shape: one domain per service. The browser drops a
  // lax cookie on this request, and the whole site silently signs itself out.
  it('is needed for a separate API subdomain', () => {
    expect(
      needsCrossSiteCookie({
        webUrl: 'https://academygeo.com',
        apiUrl: 'https://api.academygeo.com',
      }),
    ).toBe(true);
  });

  it('is needed for two unrelated domains', () => {
    expect(
      needsCrossSiteCookie({ webUrl: 'https://web.example', apiUrl: 'https://api.other.example' }),
    ).toBe(true);
  });

  // Ports differ in development but the site is the same, and a "none" cookie
  // must also be secure, which localhost over plain HTTP is not.
  it('is not needed between two ports on localhost', () => {
    expect(
      needsCrossSiteCookie({ webUrl: 'http://localhost:3000', apiUrl: 'http://localhost:3001' }),
    ).toBe(false);
  });

  it('reads only the first of several web origins', () => {
    expect(
      needsCrossSiteCookie({
        webUrl: 'https://academygeo.com, https://staging.academygeo.com',
        apiUrl: 'https://api.academygeo.com',
      }),
    ).toBe(true);
  });

  it('assumes same-site when an address cannot be read', () => {
    expect(needsCrossSiteCookie({ webUrl: 'not a url', apiUrl: '' })).toBe(false);
  });
});
