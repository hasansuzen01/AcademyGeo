import { describe, expect, it } from 'vitest';

import { IMAGE_CONTENT_TYPES, buildObjectKey } from './object-key.js';

describe('IMAGE_CONTENT_TYPES', () => {
  // The upload DTO validates against this list so an unsupported picture comes
  // back as a 400 naming the accepted formats. It used to reach buildObjectKey
  // and surface as an unexplained 500.
  it('lists the formats the key builder can file', () => {
    for (const contentType of IMAGE_CONTENT_TYPES) {
      expect(() => buildObjectKey({ prefix: 'metas', filename: 'x', contentType })).not.toThrow();
    }
  });

  it('leaves out SVG, which can carry script on the media domain', () => {
    expect(IMAGE_CONTENT_TYPES).not.toContain('image/svg+xml');
  });
});

describe('buildObjectKey', () => {
  it('refuses a content type that is not an allowed image', () => {
    expect(() =>
      buildObjectKey({ prefix: 'metas', filename: 'payload.svg', contentType: 'image/svg+xml' }),
    ).toThrow(/content type/i);
  });

  it('files the upload under the prefix with the extension for its type', () => {
    const key = buildObjectKey({
      prefix: 'metas',
      filename: 'norwegian bollard.PNG',
      contentType: 'image/png',
    });

    expect(key.startsWith('metas/')).toBe(true);
    expect(key.endsWith('.png')).toBe(true);
    expect(key).toContain('norwegian-bollard');
  });

  it('cannot be steered out of the prefix by the supplied filename', () => {
    const key = buildObjectKey({
      prefix: 'metas',
      filename: '../../../secrets/key.png',
      contentType: 'image/png',
    });

    expect(key).not.toContain('..');
    expect(key.split('/')).toHaveLength(2);
    expect(key.startsWith('metas/')).toBe(true);
  });

  it('gives two uploads of the same filename different keys', () => {
    const input = { prefix: 'metas', filename: 'plate.png', contentType: 'image/png' };

    expect(buildObjectKey(input)).not.toBe(buildObjectKey(input));
  });

  it('reuses one key when a fixed name is given, so a re-upload replaces the old file', () => {
    const input = {
      prefix: 'avatars',
      filename: 'selfie.png',
      contentType: 'image/png',
      name: 'user_123',
    };

    expect(buildObjectKey(input)).toBe(buildObjectKey(input));
    expect(buildObjectKey(input)).toBe('avatars/user-123.png');
  });
});
