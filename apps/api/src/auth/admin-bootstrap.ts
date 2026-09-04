import type { UserRole } from '@prisma/client';

/**
 * Declares the role column to Better Auth.
 *
 * The adapter writes only the columns it has been told about, so a field that
 * exists in the Prisma schema but not here is dropped on create without an
 * error. `input: false` keeps it server-owned: the value comes from the create
 * hook below, never from whatever the browser sent.
 */
export const USER_ADDITIONAL_FIELDS = {
  role: {
    type: 'string',
    required: false,
    defaultValue: 'USER',
    input: false,
  },
} as const;

/** Reads ADMIN_EMAILS, which people write with stray spaces and capitals. */
export function parseAdminEmails(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * The role a brand new account starts with. This is the only way the first
 * admin is created; everyone after that is promoted from the admin panel.
 */
export function resolveInitialRole(email: string, adminEmails: string[]): UserRole {
  return adminEmails.includes(email.toLowerCase()) ? 'ADMIN' : 'USER';
}
