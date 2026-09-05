import { apiFetch } from './api';

export type AchievementTier = 'BRONZE' | 'SILVER' | 'GOLD';

export interface AchievementStanding {
  code: string;
  tier: AchievementTier;
  threshold: number;
  current: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface ProgressSnapshot {
  totalReviews: number;
  correctReviews: number;
  dayStreak: number;
  level: number;
  bestRunScore: number;
  bestAnswerStreak: number;
  perfectDailies: number;
  countriesAnswered: number;
}

export interface Progress {
  level: number;
  xp: number;
  levelStartXp: number;
  nextLevelXp: number;
  /** How far through the current level, 0 to 1. */
  progress: number;
  snapshot: ProgressSnapshot;
  achievements: AchievementStanding[];
}

export function fetchProgress() {
  return apiFetch<Progress>('/progress');
}
