import { describe, expect, it } from 'vitest';

import { parseMediaPattern } from './media-host';

describe('parseMediaPattern', () => {
  it('returns nothing when the setting is missing', () => {
    expect(parseMediaPattern(undefined)).toBeUndefined();
  });

  it('returns nothing when the setting is blank', () => {
    expect(parseMediaPattern('   ')).toBeUndefined();
  });

  it('serves a bare hostname over https', () => {
    expect(parseMediaPattern('pub-abc123.r2.dev')).toEqual({
      protocol: 'https',
      hostname: 'pub-abc123.r2.dev',
    });
  });

  // The bucket address Cloudflare hands you is a full URL, so that is what
  // operators paste in. Reading it as a hostname matched nothing and every
  // uploaded picture came back as a broken image.
  it('accepts the full bucket URL operators copy from Cloudflare', () => {
    expect(parseMediaPattern('https://pub-abc123.r2.dev')).toEqual({
      protocol: 'https',
      hostname: 'pub-abc123.r2.dev',
    });
  });

  it('ignores a trailing slash', () => {
    expect(parseMediaPattern('https://pub-abc123.r2.dev/')?.hostname).toBe('pub-abc123.r2.dev');
  });

  it('ignores a path', () => {
    expect(parseMediaPattern('https://media.example.com/images')?.hostname).toBe(
      'media.example.com',
    );
  });

  // Hard-coding https here would have failed the same silent way the missing
  // hostname did: the picture simply never loads.
  it('keeps a media host served over plain http', () => {
    expect(parseMediaPattern('http://media.example.com')).toEqual({
      protocol: 'http',
      hostname: 'media.example.com',
    });
  });

  it('keeps a non-default port, which next/image matches separately', () => {
    expect(parseMediaPattern('https://media.example.com:8443')).toEqual({
      protocol: 'https',
      hostname: 'media.example.com',
      port: '8443',
    });
  });

  it('returns nothing for a value that is not an address at all', () => {
    expect(parseMediaPattern('https://')).toBeUndefined();
  });
});
