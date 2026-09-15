import { describe, expect, it } from 'vitest';

import { ownedAvatarKey, selfDeleteBlocker } from './self-delete.js';

describe('selfDeleteBlocker', () => {
  it('lets a player delete their own account', () => {
    expect(selfDeleteBlocker({ role: 'USER', status: 'ACTIVE' }, 1)).toBeNull();
  });

  it('lets an admin delete their account while another admin remains', () => {
    expect(selfDeleteBlocker({ role: 'ADMIN', status: 'ACTIVE' }, 2)).toBeNull();
  });

  // The same rule the panel follows: with no admin left, nobody could ever be
  // promoted again.
  it('refuses the last active admin', () => {
    expect(selfDeleteBlocker({ role: 'ADMIN', status: 'ACTIVE' }, 1)).toBe('last-admin');
  });

  it('does not count a suspended admin as the one holding the panel', () => {
    expect(selfDeleteBlocker({ role: 'ADMIN', status: 'SUSPENDED' }, 1)).toBeNull();
  });
});

describe('ownedAvatarKey', () => {
  const base = 'https://cdn.academygeo.com';

  it('finds the key of a picture the account uploaded', () => {
    expect(ownedAvatarKey('https://cdn.academygeo.com/avatars/user-1.jpg', base)).toBe(
      'avatars/user-1.jpg',
    );
  });

  it('accepts a base address written with a trailing slash', () => {
    expect(ownedAvatarKey('https://cdn.academygeo.com/avatars/user-1.png', `${base}/`)).toBe(
      'avatars/user-1.png',
    );
  });

  // Deleting an account must never reach into the card pictures, whatever the
  // image field happens to hold.
  it('refuses anything outside the avatars folder', () => {
    expect(ownedAvatarKey('https://cdn.academygeo.com/metas/abc.jpg', base)).toBeNull();
  });

  it('refuses a folder that only starts with the same letters', () => {
    expect(ownedAvatarKey('https://cdn.academygeo.com/avatars-old/user-1.jpg', base)).toBeNull();
  });

  it('refuses a path that climbs out of the folder', () => {
    expect(ownedAvatarKey('https://cdn.academygeo.com/avatars/../metas/abc.jpg', base)).toBeNull();
  });

  it('ignores a picture hosted somewhere else, such as the Google profile photo', () => {
    expect(ownedAvatarKey('https://lh3.googleusercontent.com/a/photo', base)).toBeNull();
  });

  it('has nothing to remove without a picture or without storage', () => {
    expect(ownedAvatarKey(null, base)).toBeNull();
    expect(ownedAvatarKey('https://cdn.academygeo.com/avatars/user-1.jpg', null)).toBeNull();
  });
});
