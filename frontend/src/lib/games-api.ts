import { type QueueCard, apiFetch } from './api';

/** Practice is played through /review; these are the scored runs. */
export const SCORED_MODES = [
  'DAILY',
  'RUSH',
  'SURVIVAL',
  'DUEL',
  'FLASH',
  'DRILL',
] as const;
export type ScoredMode = (typeof SCORED_MODES)[number];

export type PlayMode = 'PRACTICE' | ScoredMode;

export interface RunView {
  runId: string;
  mode: ScoredMode;
  answered: number;
  correct: number;
  /** How many cards the run was dealt, or null when it runs on the clock. */
  total: number | null;
  score: number;
  bestStreak: number;
  durationMs: number;
  streak: number;
  livesLeft: number | null;
  /** The collection the hand came from, when it came from one. */
  deckSlug: string | null;
  endsAt: string | null;
  card: QueueCard | null;
  finished: boolean;
}

/** What the player is told about the card they just answered. */
export interface GradedAnswer {
  correct: boolean;
  country: { code: string; nameEn: string; nameTr: string };
  explanation: {
    titleEn: string;
    titleTr: string;
    descriptionEn: string;
    descriptionTr: string;
  };
  points: number;
  xpGained: number;
  /** Badge codes the answer just earned. */
  unlocked: string[];
}

export interface RunAnswer {
  /**
   * Null when the run ended before the answer could count, which is what a
   * click that lands just after the clock stops looks like.
   */
  graded: GradedAnswer | null;
  finished: boolean;
  run: RunView;
}

export interface RunSummary {
  id: string;
  mode: ScoredMode;
  score: number;
  correct: number;
  answered: number;
  bestStreak: number;
  durationMs: number;
  finishedAt: string;
}

export interface DailyStatus {
  day: string;
  played: boolean;
  inProgress: boolean;
  score: number | null;
  correct: number | null;
  answered: number | null;
  total: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  score: number;
  correct: number;
  answered: number;
  playedAt: string;
}

export interface Leaderboard {
  mode: ScoredMode;
  window: LeaderboardWindow;
  entries: LeaderboardEntry[];
  you: { rank: number; score: number } | null;
}

export type LeaderboardWindow = 'all' | 'week';

export interface GlobalEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  xp: number;
  level: number;
}

/** One table for the whole site, ranked on experience. */
export interface GlobalBoard {
  entries: GlobalEntry[];
  total: number;
  you: GlobalEntry | null;
}

export function startRun(body: {
  mode: ScoredMode;
  category?: string;
  region?: string;
  deckSlug?: string;
}) {
  return apiFetch<RunView>('/games/start', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function answerRun(body: {
  runId: string;
  guessedCountryCode: string;
  responseMs: number;
}) {
  return apiFetch<RunAnswer>('/games/answer', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function fetchActiveRun() {
  return apiFetch<RunView | null>('/games/active');
}

export function fetchRunHistory() {
  return apiFetch<RunSummary[]>('/games/history');
}

export function fetchDailyStatus() {
  return apiFetch<DailyStatus>('/games/daily');
}

export function fetchLeaderboard(mode: ScoredMode, window: LeaderboardWindow) {
  return apiFetch<Leaderboard>(`/games/leaderboard?mode=${mode}&window=${window}`);
}

export function fetchGlobalRanking(skip: number, take: number) {
  return apiFetch<GlobalBoard>(`/games/ranking?skip=${skip}&take=${take}`);
}
