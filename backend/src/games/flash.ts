/**
 * Flash mode shows the picture, then covers it. You answer from memory.
 *
 * The window shrinks with the run of correct answers behind you, so the mode
 * tightens as you get good at it and opens back up the moment you miss one.
 * The server decides the window rather than the client, so it cannot be held
 * open by anyone who would rather read the picture at their leisure.
 */

const FIRST_REVEAL_MS = 4_000;
const SHRINK_PER_CORRECT_MS = 350;

/** Below this there is nothing a person could read, however good they are. */
export const MIN_REVEAL_MS = 1_200;

export function revealWindowMs(streak: number): number {
  const shrunk = FIRST_REVEAL_MS - Math.max(0, streak) * SHRINK_PER_CORRECT_MS;

  return Math.max(MIN_REVEAL_MS, shrunk);
}
