import type { UserRole, UserStatus } from '@prisma/client';

/**
 * Why an account may not delete itself, or null when it may.
 *
 * The same rule the admin panel keeps: with no active admin left, nobody could
 * ever be promoted again. A suspended admin does not hold the panel, so it
 * does not count.
 */
export function selfDeleteBlocker(
  account: { role: UserRole; status: UserStatus },
  activeAdminCount: number,
): 'last-admin' | null {
  const holdsPanel = account.role === 'ADMIN' && account.status === 'ACTIVE';

  return holdsPanel && activeAdminCount <= 1 ? 'last-admin' : null;
}

const AVATAR_FOLDER = 'avatars/';

/**
 * The storage key of a picture the account uploaded itself, or null.
 *
 * Only a file directly inside the avatars folder of this site's own bucket
 * qualifies. Anything else, a Google profile photo or a card picture, is not
 * the account's to delete.
 */
export function ownedAvatarKey(
  imageUrl: string | null | undefined,
  publicBaseUrl: string | null,
): string | null {
  if (!imageUrl || !publicBaseUrl) return null;

  const base = `${publicBaseUrl.replace(/\/+$/, '')}/`;
  if (!imageUrl.startsWith(base)) return null;

  const key = imageUrl.slice(base.length).split(/[?#]/)[0];
  const insideFolder =
    key.startsWith(AVATAR_FOLDER) &&
    key.length > AVATAR_FOLDER.length &&
    !key.includes('/', AVATAR_FOLDER.length) &&
    !key.includes('..');

  return insideFolder ? key : null;
}
