import { ContentStatus } from '@prisma/client';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

const STATUSES = Object.values(ContentStatus);
const LOCALES = ['en', 'tr'];
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class ContentListQuery {
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

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;
}

export class UpsertPostDto {
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

  @IsOptional()
  @IsString()
  @Length(0, 500)
  ogImageUrl?: string;

  @IsOptional()
  @IsIn(STATUSES)
  status?: ContentStatus;
}

export class UpsertPageDto {
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
  excerpt?: string;

  @IsString()
  @Length(1, 200_000)
  content!: string;

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
  @Length(0, 500)
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  @Length(0, 60)
  robotsMeta?: string;

  @IsOptional()
  @IsIn(STATUSES)
  status?: ContentStatus;

  @IsOptional()
  @IsBoolean()
  includeInSitemap?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  footerOrder?: number;
}

export class UpdateSeoDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  siteName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  siteUrl?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  siteDescription?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  defaultMetaTitle?: string;

  @IsOptional()
  @IsString()
  @Length(0, 320)
  defaultMetaDescription?: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  defaultKeywords?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  defaultOgImageUrl?: string;

  @IsOptional()
  @IsString()
  @Length(0, 10_000)
  robotsTxt?: string;

  @IsOptional()
  @IsString()
  @Length(0, 60)
  defaultRobotsMeta?: string;

  @IsOptional()
  @IsBoolean()
  blockIndexingOutsideProduction?: boolean;

  @IsOptional()
  @IsBoolean()
  sitemapEnabled?: boolean;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  googleSiteVerification?: string;

  @IsOptional()
  @IsString()
  @Length(0, 40)
  googleAnalyticsId?: string;

  @IsOptional()
  @IsString()
  @Length(0, 40)
  googleTagManagerId?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  bingSiteVerification?: string;

  @IsOptional()
  @IsString()
  @Length(0, 60)
  twitterSite?: string;

  @IsOptional()
  @IsString()
  @Length(0, 120)
  organisationName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  organisationLogo?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  contactEmail?: string;

  /** Empty clears it; anything else has to be a whole https address. */
  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @Length(0, 300)
  supportUrl?: string;
}
