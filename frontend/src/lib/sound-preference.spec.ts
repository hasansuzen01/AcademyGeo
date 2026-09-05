import { afterEach, describe, expect, it, vi } from 'vitest';

import { readSoundPreference, writeSoundPreference } from './sound-preference';

function withStorage(storage: Partial<Storage>) {
  vi.stubGlobal('localStorage', storage as Storage);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('readSoundPreference', () => {
  it('leaves sound on for someone who has never touched the switch', () => {
    withStorage({ getItem: () => null });

    expect(readSoundPreference()).toBe(true);
  });

  it('honours a player who turned it off', () => {
    withStorage({ getItem: () => 'off' });

    expect(readSoundPreference()).toBe(false);
  });

  // A private window, or a browser set to refuse site data, throws on access.
  it('falls back to on when the browser refuses to answer', () => {
    withStorage({
      getItem: () => {
        throw new Error('denied');
      },
    });

    expect(readSoundPreference()).toBe(true);
  });
});

describe('writeSoundPreference', () => {
  it('remembers the choice', () => {
    const setItem = vi.fn();
    withStorage({ setItem });

    writeSoundPreference(false);

    expect(setItem).toHaveBeenCalledWith(expect.any(String), 'off');
  });

  it('does not throw when the browser refuses to remember it', () => {
    withStorage({
      setItem: () => {
        throw new Error('denied');
      },
    });

    expect(() => writeSoundPreference(true)).not.toThrow();
  });
});
