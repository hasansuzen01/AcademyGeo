/**
 * The sounds the game makes, written as notes rather than shipped as files.
 *
 * Three reasons for synthesising them. They weigh nothing, so there is no
 * audio to download before the first card. They belong to this project rather
 * than to whoever recorded them. And a note list can be read, argued with and
 * tested, which a .mp3 cannot.
 *
 * The design rule is the one people already know without being told: up means
 * yes, down means no, and nothing lasts long enough to be in the way.
 */

export interface Note {
  hz: number;
  /** Seconds from the start of the effect. */
  at: number;
  seconds: number;
  /** 0 to 1, before the master volume. */
  gain: number;
  shape: OscillatorType;
}

export type EffectName = 'correct' | 'wrong' | 'finish' | 'cover' | 'streak';

/** A note, with the parts that rarely change filled in. */
function note(hz: number, at: number, seconds = 0.12, gain = 0.5, shape: OscillatorType = 'sine') {
  return { hz, at, seconds, gain, shape };
}

export const EFFECTS: Record<EffectName, Note[]> = {
  // A rising fifth. Short, bright, and over before the next card lands.
  correct: [note(660, 0), note(880, 0.09, 0.16)],

  // A falling second on a softer shape: wrong, not catastrophic.
  wrong: [note(220, 0, 0.16, 0.45, 'triangle'), note(165, 0.1, 0.22, 0.4, 'triangle')],

  // Three notes up, for the end of a run.
  finish: [note(523, 0), note(659, 0.1), note(784, 0.2, 0.28)],

  // A soft low knock as the picture is covered in flash mode.
  cover: [note(180, 0, 0.1, 0.35, 'triangle')],

  // A brighter pair when a streak reaches something worth noticing.
  streak: [note(880, 0, 0.08, 0.4), note(1175, 0.07, 0.14, 0.4)],
};

export function notesFor(name: EffectName): Note[] {
  return EFFECTS[name];
}

/** How long the whole effect runs, so a caller can leave the context alone. */
export function effectSeconds(name: EffectName): number {
  return notesFor(name).reduce((longest, part) => Math.max(longest, part.at + part.seconds), 0);
}
