import type { ImageSource } from './card-image';

import { SERVER_API_URL } from './api-base';

export type DrivingSide = 'LEFT' | 'RIGHT';

export interface AtlasCountry {
  code: string;
  nameEn: string;
  nameTr: string;
  region: string;
  flagEmoji: string | null;
  drivingSide: DrivingSide | null;
  summaryEn: string;
  summaryTr: string;
  clueCount: number;
}

export interface AtlasClue {
  id: string;
  slug: string;
  category: string;
  titleEn: string;
  titleTr: string;
  descriptionEn: string;
  descriptionTr: string;
  imageUrl: string;
  imageSource: ImageSource;
  difficulty: number;
}

export interface AtlasCountryDetail extends Omit<AtlasCountry, 'clueCount'> {
  ccTld: string | null;
  phonePrefix: string | null;
  currency: string | null;
  languages: string[];
  cameraGens: string[];
  clueCount: number;
  groups: Array<{ category: string; clues: AtlasClue[] }>;
}

/**
 * The atlas is public and changes only when an admin edits it, so it is read
 * on the server and cached rather than fetched again in every visitor's
 * browser.
 */
const ATLAS_REVALIDATE_SECONDS = 300;

/**
 * An unreachable API answers as an empty atlas rather than throwing.
 *
 * The image is built before anything is running, so a build that insists on
 * reaching the API cannot be built at all. Every caller already handles an
 * empty answer: the index shows its empty state and the country pages are
 * rendered on demand instead of ahead of time.
 */
export async function fetchAtlasCountries(): Promise<AtlasCountry[]> {
  try {
    const response = await fetch(`${SERVER_API_URL}/api/atlas/countries`, {
      next: { revalidate: ATLAS_REVALIDATE_SECONDS },
    });

    return response.ok ? ((await response.json()) as AtlasCountry[]) : [];
  } catch {
    return [];
  }
}

export async function fetchAtlasCountry(code: string): Promise<AtlasCountryDetail | null> {
  try {
    const response = await fetch(
      `${SERVER_API_URL}/api/atlas/countries/${encodeURIComponent(code)}`,
      { next: { revalidate: ATLAS_REVALIDATE_SECONDS } },
    );

    return response.ok ? ((await response.json()) as AtlasCountryDetail) : null;
  } catch {
    return null;
  }
}
