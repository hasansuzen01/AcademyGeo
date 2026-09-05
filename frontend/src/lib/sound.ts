'use client';

import { useCallback, useSyncExternalStore } from 'react';

import { type EffectName, notesFor } from './sound-design';
import { readSoundPreference, writeSoundPreference } from './sound-preference';

/** Loud enough to hear over a room, quiet enough to leave on. */
const MASTER_GAIN = 0.14;
/** The fade at each end of a note, so it starts and stops without a click. */
const EDGE_SECONDS = 0.012;

let context: AudioContext | null = null;

/**
 * The one audio context, made on the first sound rather than on load.
 *
 * A browser refuses to start audio before the person has interacted with the
 * page, and the first sound only ever follows a click, so building it lazily
 * is both allowed and cheaper.
 */
function audioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();

    return context;
  } catch {
    return null;
  }
}

/** Plays one effect. Silently does nothing where audio is unavailable. */
export function playEffect(name: EffectName): void {
  if (!readSoundPreference()) return;

  const ctx = audioContext();
  if (!ctx) return;

  const start = ctx.currentTime;

  for (const note of notesFor(name)) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const from = start + note.at;
    const to = from + note.seconds;

    oscillator.type = note.shape;
    oscillator.frequency.setValueAtTime(note.hz, from);

    // A square-edged note clicks. Ramping in and out of the level removes it.
    gain.gain.setValueAtTime(0, from);
    gain.gain.linearRampToValueAtTime(note.gain * MASTER_GAIN, from + EDGE_SECONDS);
    gain.gain.setValueAtTime(note.gain * MASTER_GAIN, to - EDGE_SECONDS);
    gain.gain.linearRampToValueAtTime(0, to);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(from);
    oscillator.stop(to);
  }
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Whether sound is on, and the switch that changes it.
 *
 * The preference lives in localStorage rather than in React state, so it is
 * read through useSyncExternalStore: that keeps the server render and the
 * first client render agreed on the default, and every toggle in the page in
 * agreement with each other.
 */
export function useSound(): { enabled: boolean; toggle: () => void } {
  const enabled = useSyncExternalStore(subscribe, readSoundPreference, () => true);

  const toggle = useCallback(() => {
    const next = !readSoundPreference();
    writeSoundPreference(next);
    for (const listener of listeners) listener();
    if (next) playEffect('correct');
  }, []);

  return { enabled, toggle };
}
