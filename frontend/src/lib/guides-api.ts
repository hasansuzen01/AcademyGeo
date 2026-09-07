import 'server-only';
import { readPublic } from './api-base';
import type { MetaCategory } from './admin-api';

export interface GuideTopicCard {
  id: string;
  locale: string;
  slug: string;
  title: string;
  summary: string;
  icon: string;
  coverImageUrl: string | null;
  category: MetaCategory | null;
  /** Readable entries under the heading, and how long they take together. */
  entryCount: number;
  readingTime: number;
}

export interface GuideEntryCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  countryCode: string | null;
  readingTime: number;
  position: number;
}

export interface GuideTopic extends Omit<GuideTopicCard, 'entryCount' | 'readingTime'> {
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string;
  canonicalUrl: string | null;
  robotsMeta: string;
  updatedAt: string;
  entries: GuideEntryCard[];
}

export interface GuideEntry extends GuideEntryCard {
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string;
  canonicalUrl: string | null;
  robotsMeta: string;
  publishedAt: string | null;
  updatedAt: string;
  country: { code: string; nameEn: string; nameTr: string; flagEmoji: string | null } | null;
}

export interface GuideReading {
  entry: GuideEntry;
  topic: Omit<GuideTopic, 'entries'>;
  /** The entry to offer next, or null at the end of the heading. */
  next: GuideEntryCard | null;
}

/** An entry about one country, carrying the heading it sits under. */
export interface CountryGuide extends GuideEntryCard {
  topic: { locale: string; slug: string; title: string; icon: string };
}

export async function fetchGuideTopics(locale: string): Promise<GuideTopicCard[]> {
  return (await readPublic<GuideTopicCard[]>(`/guides?locale=${locale}`, 120)) ?? [];
}

export async function fetchGuideTopic(locale: string, slug: string): Promise<GuideTopic | null> {
  return readPublic<GuideTopic>(`/guides/${locale}/${encodeURIComponent(slug)}`, 120);
}

export async function fetchGuideEntry(
  locale: string,
  topic: string,
  entry: string,
): Promise<GuideReading | null> {
  return readPublic<GuideReading>(
    `/guides/${locale}/${encodeURIComponent(topic)}/${encodeURIComponent(entry)}`,
    120,
  );
}

export async function fetchCountryGuides(code: string): Promise<CountryGuide[]> {
  return (
    (await readPublic<CountryGuide[]>(`/guides/country/${encodeURIComponent(code)}`, 300)) ?? []
  );
}
