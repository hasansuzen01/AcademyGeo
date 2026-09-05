import { describe, expect, it } from 'vitest';

import { publishBlocker } from './publishable.js';

describe('publishBlocker', () => {
  it('lets a card with a picture go live', () => {
    expect(publishBlocker({ imageUrl: '/metas/abc.svg', isPublished: true })).toBeNull();
  });

  it('holds back a card that has no picture yet', () => {
    expect(publishBlocker({ imageUrl: '', isPublished: true })).toBe('no-picture');
  });

  it('treats whitespace as no picture, because it is not one', () => {
    expect(publishBlocker({ imageUrl: '   ', isPublished: true })).toBe('no-picture');
  });

  it('leaves a draft alone, because a draft nobody sees can be half written', () => {
    expect(publishBlocker({ imageUrl: '', isPublished: false })).toBeNull();
  });
});
