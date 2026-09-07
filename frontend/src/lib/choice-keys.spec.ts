import { describe, expect, it } from 'vitest';

import { choiceForKey } from './choice-keys';

describe('choiceForKey', () => {
  // A 90-second Rush run is unplayable if every answer costs a mouse journey,
  // and the numbers on the buttons are the obvious thing to press.
  it('reads a number key as the choice in that position', () => {
    expect(choiceForKey('1', 4)).toBe(0);
    expect(choiceForKey('4', 4)).toBe(3);
  });

  it('ignores a number past the last choice', () => {
    expect(choiceForKey('4', 2)).toBeNull();
  });

  it('ignores zero, which names no button', () => {
    expect(choiceForKey('0', 4)).toBeNull();
  });

  it('ignores a letter', () => {
    expect(choiceForKey('a', 4)).toBeNull();
  });
});
