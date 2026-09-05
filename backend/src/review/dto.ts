import { IsIn, IsInt, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';

import { MetaCategory, Region } from '@prisma/client';

const CATEGORIES = Object.values(MetaCategory);
const REGIONS = Object.values(Region);

/** Matches the slug shape the admin panel writes. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class ReviewQueueQuery {
  @IsOptional()
  @IsIn(CATEGORIES)
  category?: MetaCategory;

  @IsOptional()
  @IsIn(REGIONS)
  region?: Region;

  /** Practise one collection instead of the whole catalogue. */
  @IsOptional()
  @IsString()
  @Matches(SLUG)
  @Length(2, 60)
  deckSlug?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class SubmitAnswerDto {
  @IsString()
  @Length(1, 40)
  metaId!: string;

  @IsString()
  @Length(2, 2)
  guessedCountryCode!: string;

  @IsInt()
  @Min(0)
  @Max(600_000)
  responseMs!: number;
}
