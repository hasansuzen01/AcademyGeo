import { describe, expect, it } from 'vitest';

import { returnPlace } from './return-place';

describe('returnPlace', () => {
  it('sends a player who came from a collection back to the collections', () => {
    expect(returnPlace('collections')).toEqual({ href: '/collections', label: 'collections' });
  });

  it('sends a reader back to the guide topic they came from', () => {
    expect(returnPlace('guides/bollards')).toEqual({ href: '/guides/bollards', label: 'guides' });
  });

  it('falls back to the play hub for an unknown or missing origin', () => {
    expect(returnPlace(undefined)).toEqual({ href: '/play', label: 'play' });
    expect(returnPlace('play')).toEqual({ href: '/play', label: 'play' });
  });

  it('never follows an origin that could leave the site', () => {
    expect(returnPlace('//evil.example')).toEqual({ href: '/play', label: 'play' });
    expect(returnPlace('guides/../admin')).toEqual({ href: '/play', label: 'play' });
  });
});
