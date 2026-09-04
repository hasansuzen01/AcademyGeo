export type MeStatus = 'loading' | 'anonymous' | 'ready';

interface MeStatusInput {
  /** The session hook has not settled yet. */
  sessionPending: boolean;
  /** The session hook found a signed-in account. */
  signedIn: boolean;
  /** The account as the API returned it, or null while it is on its way. */
  me: { id: string } | null;
  /** The API refused or could not answer the account request. */
  failed: boolean;
}

/**
 * Derives the account status from what is known, rather than storing it. The
 * stored version had to be written from inside an effect, which meant a render
 * where the status disagreed with the session it came from.
 */
export function resolveMeStatus({ sessionPending, signedIn, me, failed }: MeStatusInput): MeStatus {
  if (sessionPending) return 'loading';
  if (!signedIn || failed) return 'anonymous';

  return me ? 'ready' : 'loading';
}
