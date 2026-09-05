import { IsIn, IsInt, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';

import { MetaCategory, Region } from '@prisma/client';

import type { GameMode } from './modes.js';

const CATEGORIES = Object.values(MetaCategory);
const REGIONS = Object.values(Region);

/** Practice is played through /review; only these are scored runs. */
export const SCORED_MODES = ['RUSH', 'SURVIVAL', 'DAILY', 'DRILL'] as const;
export type ScoredMode = (typeof SCORED_MODES)[number];

/** Matches the slug shape the admin panel writes. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const LEADERBOARD_WINDOWS = ['all', 'week'] as const;
export type LeaderboardWindow = (typeof LEADERBOARD_WINDOWS)[number];

export class StartRunDto {
  @IsIn(SCORED_MODES)
  mode!: ScoredMode;

  /** Rush and survival can be narrowed; the daily challenge never is. */
  @IsOptional()
  @IsIn(CATEGORIES)
  category?: MetaCategory;

  @IsOptional()
  @IsIn(REGIONS)
  region?: Region;

  /** Draw the hand from one collection instead of the whole catalogue. */
  @IsOptional()
  @IsString()
  @Matches(SLUG)
  @Length(2, 60)
  deckSlug?: string;
}

export class RunAnswerDto {
  @IsString()
  @Length(1, 40)
  runId!: string;

  @IsString()
  @Length(2, 2)
  guessedCountryCode!: string;

  @IsInt()
  @Min(0)
  @Max(600_000)
  responseMs!: number;
}

export class LeaderboardQuery {
  @IsIn(SCORED_MODES)
  mode!: ScoredMode;

  @IsOptional()
  @IsIn(LEADERBOARD_WINDOWS)
  window?: LeaderboardWindow;
}

export function isScoredMode(mode: GameMode): mode is ScoredMode {
  return (SCORED_MODES as readonly string[]).includes(mode);
}
