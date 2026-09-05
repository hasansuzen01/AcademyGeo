import { describe, expect, it } from 'vitest';

import { EFFECTS, type EffectName, notesFor } from './sound-design';

const NAMES = Object.keys(EFFECTS) as EffectName[];

describe('notesFor', () => {
  it('rises for a correct answer, because up reads as yes', () => {
    const [first, ...rest] = notesFor('correct');

    expect(rest.at(-1)!.hz).toBeGreaterThan(first.hz);
  });

  it('falls for a wrong answer', () => {
    const [first, ...rest] = notesFor('wrong');

    expect(rest.at(-1)!.hz).toBeLessThan(first.hz);
  });

  it('gives every effect something to play', () => {
    for (const name of NAMES) {
      expect(notesFor(name).length).toBeGreaterThan(0);
    }
  });

  it('keeps every note short enough to stay out of the way', () => {
    for (const name of NAMES) {
      for (const note of notesFor(name)) {
        expect(note.seconds).toBeGreaterThan(0);
        expect(note.seconds).toBeLessThanOrEqual(0.4);
      }
    }
  });

  it('never starts a note before the one in front of it', () => {
    for (const name of NAMES) {
      const starts = notesFor(name).map((note) => note.at);

      expect([...starts].sort((a, b) => a - b)).toEqual(starts);
    }
  });
});
