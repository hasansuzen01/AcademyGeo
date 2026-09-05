import { describe, expect, it } from 'vitest';

import { resolveMeStatus } from './me-status';

describe('resolveMeStatus', () => {
  it('waits while the session is still resolving', () => {
    expect(
      resolveMeStatus({ sessionPending: true, signedIn: false, me: null, failed: false }),
    ).toBe('loading');
  });

  it('reports anonymous when there is no session', () => {
    expect(
      resolveMeStatus({ sessionPending: false, signedIn: false, me: null, failed: false }),
    ).toBe('anonymous');
  });

  it('keeps waiting while the account is being fetched', () => {
    expect(
      resolveMeStatus({ sessionPending: false, signedIn: true, me: null, failed: false }),
    ).toBe('loading');
  });

  it('is ready once the account has arrived', () => {
    expect(
      resolveMeStatus({ sessionPending: false, signedIn: true, me: { id: 'u1' }, failed: false }),
    ).toBe('ready');
  });

  // A session cookie the API rejects has to settle as anonymous, otherwise the
  // admin shell spins forever instead of showing the 404.
  it('falls back to anonymous when the account could not be fetched', () => {
    expect(resolveMeStatus({ sessionPending: false, signedIn: true, me: null, failed: true })).toBe(
      'anonymous',
    );
  });
});
