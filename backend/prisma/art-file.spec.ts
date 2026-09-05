import { describe, expect, it } from 'vitest';

import { artFileName } from './art-file.ts';

describe('artFileName', () => {
  it('gives the same card the same file every time', () => {
    expect(artFileName('tr-plate')).toBe(artFileName('tr-plate'));
  });

  it('gives two cards different files', () => {
    expect(artFileName('tr-plate')).not.toBe(artFileName('ge-plate'));
  });

  it('says nothing about the country, which is the answer', () => {
    expect(artFileName('tr-plate')).not.toContain('tr');
    expect(artFileName('ke-plate')).not.toContain('ke');
  });

  it('is a plain svg filename', () => {
    expect(artFileName('tr-plate')).toMatch(/^[0-9a-f]+\.svg$/);
  });
});
