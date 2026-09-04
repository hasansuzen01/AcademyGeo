import { IsIn, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

import { MetaCategory, Region } from '@prisma/client';

const CATEGORIES = Object.values(MetaCategory);
const REGIONS = Object.values(Region);

export class ReviewQueueQuery {
  @IsOptional()
  @IsIn(CATEGORIES)
  category?: MetaCategory;

  @IsOptional()
  @IsIn(REGIONS)
  region?: Region;

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
