export type DeleteAccountProblem = 'reauth' | 'last-admin' | 'generic';

/**
 * What the profile page should say when deleting the account was refused.
 *
 * A sign-in older than a day is the common case, and it has a way through:
 * sign in again and press delete once more. The last-admin rule is explained
 * in its own words. Anything else is a plain failure.
 */
export function deleteAccountProblem(code: string | undefined): DeleteAccountProblem {
  if (code === 'SESSION_EXPIRED') return 'reauth';
  if (code === 'LAST_ADMIN') return 'last-admin';

  return 'generic';
}
