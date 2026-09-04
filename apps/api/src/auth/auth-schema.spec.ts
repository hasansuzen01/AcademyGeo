import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAuthTables } from '@better-auth/core/db';
import { describe, expect, it } from 'vitest';

/**
 * Better Auth writes to these tables through the Prisma adapter, which means a
 * field it expects and the schema does not declare is only discovered when a
 * real person tries to sign in. Upgrading to 1.7 added `issuer` to the account
 * table and the first Google sign-in died on
 * "Unknown argument `issuer`". This compares the two so the next upgrade fails
 * here instead.
 */
const SCHEMA = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../prisma/schema.prisma'),
  'utf8',
);

const tables = getAuthTables({
  socialProviders: { google: { clientId: 'test', clientSecret: 'test' } },
  emailAndPassword: { enabled: false },
});

/** The field names declared on one Prisma model, ignoring relations. */
function modelFields(model: string): string[] {
  const body = new RegExp(`model ${model} \\{([\\s\\S]*?)\\n\\}`).exec(SCHEMA)?.[1];
  if (!body) throw new Error(`schema.prisma has no model ${model}`);

  return body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('@@') && !line.startsWith('//'))
    .map((line) => line.split(/\s+/)[0]!);
}

describe('prisma schema against the Better Auth tables', () => {
  for (const [name, table] of Object.entries(tables)) {
    const model = name.charAt(0).toUpperCase() + name.slice(1);

    it(`declares every field Better Auth writes on ${model}`, () => {
      const declared = modelFields(model);
      const expected = Object.values(table.fields).map((field) => field.fieldName ?? '');

      expect(declared).toEqual(expect.arrayContaining(expected));
    });
  }

  // Two accounts at the same provider can share an id across issuers, so the
  // pair that has to stay unique is the issuer and the account id.
  it('scopes account identity by issuer', () => {
    expect(SCHEMA).toContain('@@unique([issuer, accountId])');
  });
});
