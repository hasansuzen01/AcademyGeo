/**
 * The rules about what an admin may do to an account.
 *
 * Two of them exist to stop the panel locking itself: nobody can take
 * themselves out, and the last admin cannot be taken out either, because there
 * would then be no one left able to put anybody back.
 */
export type AccountAction = 'suspend' | 'restore' | 'delete' | 'demote';

export type AccountActionBlocker = 'self' | 'last-admin';

export interface TargetAccount {
  id: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface ActionScene {
  /** The admin performing the action. */
  actorId: string;
  /** How many active admins the site has, including the target. */
  adminCount: number;
}

/** Why the action is refused, or null when it may go ahead. */
export function accountActionBlocker(
  action: AccountAction,
  target: TargetAccount,
  scene: ActionScene,
): AccountActionBlocker | null {
  // Putting an account back can never be the thing that locks the panel.
  if (action === 'restore') return null;

  if (target.id === scene.actorId) return 'self';
  if (target.role === 'ADMIN' && scene.adminCount <= 1) return 'last-admin';

  return null;
}
