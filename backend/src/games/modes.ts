/** The ways a player can practise. PRACTICE is the untimed spaced-repetition
 *  session; the rest are scored runs that end on their own terms. */
export type GameMode =
  | 'PRACTICE'
  | 'RUSH'
  | 'SURVIVAL'
  | 'DAILY'
  | 'DRILL'
  | 'DUEL'
  | 'FLASH';

/** How many answer buttons a card in this mode is dealt. */
export const DEFAULT_CHOICES = 4;
/** A duel offers the answer and the one country worth confusing it with. */
export const DUEL_CHOICES = 2;

export interface RunRules {
  /** How many cards the run is dealt, or null when it runs until the clock
   *  or the player's lives stop it. */
  cardCount: number | null;
  /** Wrong answers allowed before the run ends, or null for no limit. */
  lives: number | null;
  timeLimitMs: number | null;
  /** How many answer buttons sit under a card. */
  choices: number;
  /** Whether the picture is taken away before the player answers. */
  hidesPicture: boolean;
}

const STANDARD = { choices: DEFAULT_CHOICES, hidesPicture: false };

export const RUN_RULES: Record<GameMode, RunRules> = {
  PRACTICE: { cardCount: 12, lives: null, timeLimitMs: null, ...STANDARD },
  RUSH: { cardCount: null, lives: null, timeLimitMs: 90_000, ...STANDARD },
  SURVIVAL: { cardCount: null, lives: 3, timeLimitMs: null, ...STANDARD },
  DAILY: { cardCount: 10, lives: null, timeLimitMs: null, ...STANDARD },
  DRILL: { cardCount: 15, lives: null, timeLimitMs: null, ...STANDARD },
  // Two countries, one picture, no time to think it through.
  DUEL: {
    cardCount: 20,
    lives: null,
    timeLimitMs: null,
    choices: DUEL_CHOICES,
    hidesPicture: false,
  },
  // The picture is taken away before you answer, so you answer from memory.
  FLASH: {
    cardCount: 15,
    lives: null,
    timeLimitMs: null,
    choices: DEFAULT_CHOICES,
    hidesPicture: true,
  },
};

export function rulesFor(mode: GameMode): RunRules {
  return RUN_RULES[mode];
}
