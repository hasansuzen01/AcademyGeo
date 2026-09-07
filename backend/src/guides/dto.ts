import { ContentStatus, MetaCategory } from '@prisma/client';
import { IsIn, IsInt, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';

const STATUSES = Object.values(ContentStatus);
const CATEGORIES = Object.values(MetaCategory);
const LOCALES = ['en', 'tr'];
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class GuideListQuery {
  @IsOptional()
  @IsIn(LOCALES)
  locale?: string;

  @IsOptional()
  @IsIn(STATUSES)
  status?: ContentStatus;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  search?: string;
}

/** The search-engine fields every guide address carries. */
class SearchFields {
  @IsOptional()
  @IsString()
  @Length(0, 200)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @Length(0, 320)
  metaDescription?: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  keywords?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  @Length(0, 60)
  robotsMeta?: string;
}

export class UpsertTopicDto extends SearchFields {
  @IsIn(LOCALES)
  locale!: string;

  @IsString()
  @Matches(SLUG, { message: 'slug must be lower-case words joined by hyphens' })
  @Length(2, 120)
  slug!: string;

  @IsString()
  @Length(2, 200)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(0, 400)
  summary?: string;

  @IsOptional()
  @IsString()
  @Length(0, 40)
  icon?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  coverImageKey?: string;

  @IsOptional()
  @IsIn([...CATEGORIES, ''])
  category?: MetaCategory | '';

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999)
  position?: number;

  @IsOptional()
  @IsIn(STATUSES)
  status?: ContentStatus;
}

export class UpsertEntryDto extends SearchFields {
  @IsString()
  @Matches(SLUG, { message: 'slug must be lower-case words joined by hyphens' })
  @Length(2, 120)
  slug!: string;

  @IsString()
  @Length(2, 200)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(0, 400)
  excerpt?: string;

  @IsString()
  @Length(1, 200_000)
  content!: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  coverImageKey?: string;

  /** Empty means the entry is not about one country in particular. */
  @IsOptional()
  @IsString()
  @Length(0, 8)
  countryCode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999)
  position?: number;

  @IsOptional()
  @IsIn(STATUSES)
  status?: ContentStatus;
}
