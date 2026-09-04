import { getAuthTables } from '@better-auth/core/db';
import { describe, expect, it } from 'vitest';

import { USER_ADDITIONAL_FIELDS, parseAdminEmails, resolveInitialRole } from './admin-bootstrap.js';

describe('parseAdminEmails', () => {
  it('reads nothing from an unset value', () => {
    expect(parseAdminEmails(undefined)).toEqual([]);
  });

  it('splits a comma-separated list', () => {
    expect(parseAdminEmails('one@example.com,two@example.com')).toEqual([
      'one@example.com',
      'two@example.com',
    ]);
  });

  it('ignores spacing and casing, which people get wrong in env files', () => {
    expect(parseAdminEmails('  One@Example.COM , two@example.com ,, ')).toEqual([
      'one@example.com',
      'two@example.com',
    ]);
  });
});

describe('resolveInitialRole', () => {
  const admins = ['owner@example.com'];

  it('makes a listed address an admin', () => {
    expect(resolveInitialRole('owner@example.com', admins)).toBe('ADMIN');
  });

  it('matches regardless of the casing the provider reports', () => {
    expect(resolveInitialRole('Owner@Example.com', admins)).toBe('ADMIN');
  });

  it('leaves everyone else a player', () => {
    expect(resolveInitialRole('someone@example.com', admins)).toBe('USER');
  });

  it('makes nobody an admin when the list is empty', () => {
    expect(resolveInitialRole('owner@example.com', [])).toBe('USER');
  });
});

describe('USER_ADDITIONAL_FIELDS', () => {
  // Better Auth writes only the columns it knows about. `role` lives in our
  // schema but not in its built-in user table, so without declaring it here
  // the create hook's role was silently dropped and the first admin signed in
  // as a plain player.
  it('teaches Better Auth about the role column', () => {
    const tables = getAuthTables({ user: { additionalFields: USER_ADDITIONAL_FIELDS } });

    expect(Object.keys(tables.user.fields)).toContain('role');
  });

  it('refuses a role supplied by the client', () => {
    expect(USER_ADDITIONAL_FIELDS.role.input).toBe(false);
  });
});
