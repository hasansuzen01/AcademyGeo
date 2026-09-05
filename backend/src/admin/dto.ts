import {
  DrivingSide,
  ImageSource,
  MetaCategory,
  Region,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

import { IMAGE_CONTENT_TYPES } from '../storage/object-key.js';

const CATEGORIES = Object.values(MetaCategory);
const IMAGE_SOURCES = Object.values(ImageSource);
const REGIONS = Object.values(Region);
const DRIVING_SIDES = Object.values(DrivingSide);
const USER_STATUSES = Object.values(UserStatus);
const ROLES = Object.values(UserRole);

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class PageQuery {
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

export class MetaListQuery extends PageQuery {
  @IsOptional()
  @IsString()
  @Length(1, 80)
  search?: string;

  @IsOptional()
  @IsIn(CATEGORIES)
  category?: MetaCategory;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  countryCode?: string;

  // Read from the raw query object: implicit conversion has already turned the
  // string "false" into true by the time a value-based transform would see it,
  // which made the draft filter list published cards.
  @IsOptional()
  @Transform(({ obj }) => parseBooleanParam((obj as Record<string, unknown>).isPublished))
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsIn(IMAGE_SOURCES)
  imageSource?: ImageSource;

  /** false lists the cards still waiting for a picture to be uploaded. */
  @IsOptional()
  @Transform(({ obj }) => parseBooleanParam((obj as Record<string, unknown>).hasImage))
  @IsBoolean()
  hasImage?: boolean;
}

/** Query strings carry booleans as text, and only "true"/"false" mean anything. */
function parseBooleanParam(raw: unknown): boolean | undefined {
  if (raw === 'true' || raw === true) return true;
  if (raw === 'false' || raw === false) return false;
  return undefined;
}

export class UpsertMetaDto {
  @IsString()
  @Matches(SLUG, { message: 'slug must be lower-case words joined by hyphens' })
  @Length(2, 60)
  slug!: string;

  @IsString()
  @Length(2, 2)
  countryCode!: string;

  @IsIn(CATEGORIES)
  category!: MetaCategory;

  @IsString()
  @Length(2, 120)
  titleEn!: string;

  @IsString()
  @Length(2, 120)
  titleTr!: string;

  @IsString()
  @Length(10, 1200)
  descriptionEn!: string;

  @IsString()
  @Length(10, 1200)
  descriptionTr!: string;

  /** Empty while the card is still waiting for a photograph. */
  @IsString()
  @Length(0, 500)
  imageUrl!: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  imageKey?: string;

  @IsOptional()
  @IsIn(IMAGE_SOURCES)
  imageSource?: ImageSource;

  @IsInt()
  @Min(1)
  @Max(5)
  difficulty!: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpsertCountryDto {
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Z]{2}$/, { message: 'code must be two upper-case letters' })
  code!: string;

  @IsString()
  @Length(2, 80)
  nameEn!: string;

  @IsString()
  @Length(2, 80)
  nameTr!: string;

  @IsIn(REGIONS)
  region!: Region;

  // -- Atlas facts. All optional: a country is worth practising long before
  //    anyone has finished writing it up. --------------------------------
  @IsOptional()
  @IsString()
  @Length(0, 8)
  flagEmoji?: string;

  @IsOptional()
  @IsIn(DRIVING_SIDES)
  drivingSide?: DrivingSide;

  @IsOptional()
  @IsString()
  @Length(0, 12)
  ccTld?: string;

  @IsOptional()
  @IsString()
  @Length(0, 12)
  phonePrefix?: string;

  @IsOptional()
  @IsString()
  @Length(0, 40)
  currency?: string;

  /** Comma-separated, e.g. "Turkish,Kurdish". */
  @IsOptional()
  @IsString()
  @Length(0, 200)
  languages?: string;

  /** Comma-separated coverage generations, e.g. "Gen 3,Gen 4". */
  @IsOptional()
  @IsString()
  @Length(0, 200)
  cameraGens?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1200)
  summaryEn?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1200)
  summaryTr?: string;
}

export class UpsertDeckDto {
  @IsString()
  @Matches(SLUG)
  @Length(2, 60)
  slug!: string;

  @IsString()
  @Length(2, 120)
  nameEn!: string;

  @IsString()
  @Length(2, 120)
  nameTr!: string;

  @IsOptional()
  @IsString()
  @Length(0, 1200)
  descriptionEn?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1200)
  descriptionTr?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  coverImageKey?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsISO8601()
  startsAt?: string;

  @IsOptional()
  @IsISO8601()
  endsAt?: string;
}

export class DeckOrderDto {
  @IsArray()
  @ArrayMaxSize(500)
  @IsString({ each: true })
  @Type(() => String)
  metaIds!: string[];
}

export class UserListQuery extends PageQuery {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;

  @IsOptional()
  @IsIn(ROLES)
  role?: UserRole;

  @IsOptional()
  @IsIn(USER_STATUSES)
  status?: UserStatus;
}

export class SetRoleDto {
  @IsIn(ROLES)
  role!: UserRole;
}

export class SetStatusDto {
  @IsIn(USER_STATUSES)
  status!: UserStatus;

  /** Kept so the admin who lifts the suspension can see why it was applied. */
  @IsOptional()
  @IsString()
  @Length(0, 300)
  reason?: string;
}

export class UpdateUserDto {
  @IsString()
  @Length(1, 80)
  name!: string;
}

export class SignUploadDto {
  @IsString()
  @Length(1, 200)
  filename!: string;

  @IsIn(IMAGE_CONTENT_TYPES, {
    message: `contentType must be one of: ${IMAGE_CONTENT_TYPES.join(', ')}`,
  })
  contentType!: string;

  @IsInt()
  @Min(1)
  size!: number;

  @IsOptional()
  @IsIn(['metas', 'decks', 'avatars'])
  prefix?: 'metas' | 'decks' | 'avatars';
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 80)
  name?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @Length(1, 500)
  image?: string;
}
