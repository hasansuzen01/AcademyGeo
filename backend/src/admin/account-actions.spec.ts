import { describe, expect, it } from 'vitest';

import { accountActionBlocker } from './account-actions.js';

const ADMIN = { id: 'admin-1', role: 'ADMIN' as const, status: 'ACTIVE' as const };
const PLAYER = { id: 'player-1', role: 'USER' as const, status: 'ACTIVE' as const };

const scene = { actorId: 'admin-1', adminCount: 2 };

describe('accountActionBlocker', () => {
  it('lets an admin suspend an ordinary player', () => {
    expect(accountActionBlocker('suspend', PLAYER, scene)).toBeNull();
  });

  it('refuses to let an admin suspend themselves', () => {
    expect(accountActionBlocker('suspend', ADMIN, scene)).toBe('self');
  });

  it('refuses to let an admin delete themselves', () => {
    expect(accountActionBlocker('delete', ADMIN, scene)).toBe('self');
  });

  it('refuses to suspend the last admin, which would lock everyone out', () => {
    const other = { id: 'admin-2', role: 'ADMIN' as const, status: 'ACTIVE' as const };

    expect(accountActionBlocker('suspend', other, { ...scene, adminCount: 1 })).toBe('last-admin');
  });

  it('allows restoring an account whatever else is true', () => {
    const suspended = { id: 'admin-2', role: 'ADMIN' as const, status: 'SUSPENDED' as const };

    expect(accountActionBlocker('restore', suspended, { ...scene, adminCount: 1 })).toBeNull();
  });
});
