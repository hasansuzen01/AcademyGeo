/** The ways a player can practise. PRACTICE is the untimed spaced-repetition
 *  session; the rest are scored runs that end on their own terms. */
export type GameMode = 'PRACTICE' | 'RUSH' | 'SURVIVAL' | 'DAILY' | 'DRILL';

export interface RunRules {
  /** How many cards the run is dealt, or null when it runs until the clock
   *  or the player's lives stop it. */
  cardCount: number | null;
  /** Wrong answers allowed before the run ends, or null for no limit. */
  lives: number | null;
  timeLimitMs: number | null;
}

export const RUN_RULES: Record<GameMode, RunRules> = {
  PRACTICE: { cardCount: 12, lives: null, timeLimitMs: null },
  RUSH: { cardCount: null, lives: null, timeLimitMs: 90_000 },
  SURVIVAL: { cardCount: null, lives: 3, timeLimitMs: null },
  DAILY: { cardCount: 10, lives: null, timeLimitMs: null },
  DRILL: { cardCount: 15, lives: null, timeLimitMs: null },
};

export function rulesFor(mode: GameMode): RunRules {
  return RUN_RULES[mode];
}
