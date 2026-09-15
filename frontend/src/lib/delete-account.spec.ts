import { describe, expect, it } from 'vitest';

import { deleteAccountProblem } from './delete-account';

describe('deleteAccountProblem', () => {
  // Better Auth refuses to delete an account whose sign-in is more than a day
  // old. The way through is to sign in again, so that is what the page offers.
  it('asks for a fresh sign-in when the session is too old', () => {
    expect(deleteAccountProblem('SESSION_EXPIRED')).toBe('reauth');
  });

  it('names the last-admin rule', () => {
    expect(deleteAccountProblem('LAST_ADMIN')).toBe('last-admin');
  });

  it('falls back to a general failure for anything else', () => {
    expect(deleteAccountProblem(undefined)).toBe('generic');
    expect(deleteAccountProblem('INTERNAL_SERVER_ERROR')).toBe('generic');
  });
});
