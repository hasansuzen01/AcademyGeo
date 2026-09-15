import type { ImageSource } from './card-image';

import { apiFetch } from './api';

export type MetaCategory =
  | 'PLATE'
  | 'BOLLARD'
  | 'ROAD_LINE'
  | 'VEGETATION'
  | 'ARCHITECTURE'
  | 'LANGUAGE'
  | 'CAMERA'
  | 'VEHICLE'
  | 'INFRASTRUCTURE';

export type Region = 'EUROPE' | 'ASIA' | 'AFRICA' | 'NORTH_AMERICA' | 'SOUTH_AMERICA' | 'OCEANIA';

export const META_CATEGORIES: MetaCategory[] = [
  'PLATE',
  'BOLLARD',
  'ROAD_LINE',
  'VEGETATION',
  'ARCHITECTURE',
  'LANGUAGE',
  'CAMERA',
  'VEHICLE',
  'INFRASTRUCTURE',
];

export const REGIONS: Region[] = [
  'EUROPE',
  'ASIA',
  'AFRICA',
  'NORTH_AMERICA',
  'SOUTH_AMERICA',
  'OCEANIA',
];

export interface Me {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: 'USER' | 'ADMIN';
}

export type DrivingSide = 'LEFT' | 'RIGHT';

export const DRIVING_SIDES: DrivingSide[] = ['RIGHT', 'LEFT'];

export interface AdminCountry {
  code: string;
  nameEn: string;
  nameTr: string;
  region: Region;
  // The atlas facts. Every one is optional: a country is worth practising
  // long before anyone has finished writing it up.
  flagEmoji?: string | null;
  drivingSide?: DrivingSide | null;
  ccTld?: string | null;
  phonePrefix?: string | null;
  currency?: string | null;
  languages?: string;
  cameraGens?: string;
  summaryEn?: string;
  summaryTr?: string;
  _count?: { metas: number };
}

export interface AdminMeta {
  id: string;
  slug: string;
  countryCode: string;
  category: MetaCategory;
  titleEn: string;
  titleTr: string;
  descriptionEn: string;
  descriptionTr: string;
  imageUrl: string;
  imageKey: string | null;
  imageSource: ImageSource;
  /** Who took the photograph, its licence and where it came from. */
  imageAuthor: string | null;
  imageLicense: string | null;
  imageSourceUrl: string | null;
  difficulty: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  country?: AdminCountry;
  _count?: { logs: number };
}

export interface AdminMetaDetail extends AdminMeta {
  createdBy: { id: string; name: string; email: string } | null;
  stats: {
    totalAnswers: number;
    correctAnswers: number;
    winRate: number | null;
    topWrongGuesses: Array<{ countryCode: string; count: number }>;
  };
}

export interface AdminDeck {
  id: string;
  slug: string;
  nameEn: string;
  nameTr: string;
  descriptionEn: string;
  descriptionTr: string;
  coverImageUrl: string | null;
  coverImageKey: string | null;
  isPublished: boolean;
  startsAt: string | null;
  endsAt: string | null;
  updatedAt: string;
  _count?: { metas: number };
}

export interface AdminDeckDetail extends AdminDeck {
  metas: Array<{ position: number; meta: AdminMeta }>;
}

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: 'USER' | 'ADMIN';
  status: UserStatus;
  xp: number;
  level: number;
  /** Null until the account has made a request since last-seen was added. */
  lastSeenAt: string | null;
  createdAt: string;
  _count?: { reviewLogs: number; reviewCards: number; gameRuns: number };
}

export interface AdminUserRun {
  id: string;
  mode: string;
  score: number;
  correct: number;
  answered: number;
  bestStreak: number;
  durationMs: number;
  finishedAt: string;
}

/** One account in full, as the admin account page shows it. */
export interface AdminUserDetail {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: 'USER' | 'ADMIN';
  status: UserStatus;
  xp: number;
  lastSeenAt: string | null;
  createdAt: string;
  suspendedAt: string | null;
  suspendReason: string | null;
  level: {
    level: number;
    xp: number;
    levelStartXp: number;
    nextLevelXp: number;
    progress: number;
  };
  stats: {
    answers: number;
    correct: number;
    winRate: number | null;
    streak: number;
    daysPractised: number;
    trackedMetas: number;
    runs: number;
    openSessions: number;
  };
  weakestCountries: Array<{ countryCode: string; misses: number; winRate: number }>;
  recentRuns: AdminUserRun[];
  achievements: Array<{
    code: string;
    tier: 'BRONZE' | 'SILVER' | 'GOLD';
    threshold: number;
    current: number;
    unlocked: boolean;
  }>;
  signInMethods: Array<{ providerId: string; createdAt: string }>;
}

export interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  createdAt: string;
  actor: { id: string; name: string; email: string } | null;
}

export interface AdminOverview {
  counts: {
    metas: number;
    publishedMetas: number;
    draftMetas: number;
    illustratedMetas: number;
    /** Written up but with no picture at all: the upload queue. */
    picturelessMetas: number;
    countries: number;
    decks: number;
    users: number;
    admins: number;
    answers: number;
    activeToday: number;
  };
  hardestMetas: Array<{
    id: string;
    slug: string;
    countryCode: string;
    category: MetaCategory;
    answers: number;
    winRate: number;
  }>;
  activity: Array<{ day: string; reviews: number; players: number }>;
}

export interface Profile extends Me {
  createdAt: string;
  trackedMetas: number;
  totalAnswers: number;
  firstAnswerAt: string | null;
}

export interface Page<T> {
  items: T[];
  total: number;
}

interface UploadTicket {
  key: string;
  uploadUrl: string;
  publicUrl: string;
}

function query(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const rendered = search.toString();
  return rendered ? `?${rendered}` : '';
}

export const fetchMe = () => apiFetch<Me>('/me');
export const fetchOverview = () => apiFetch<AdminOverview>('/admin/overview');

export const fetchAdminMetas = (params: {
  search?: string;
  category?: string;
  countryCode?: string;
  isPublished?: boolean;
  imageSource?: string;
  /** 'false' lists the cards still waiting for a picture. */
  hasImage?: string;
  take?: number;
  skip?: number;
}) => apiFetch<Page<AdminMeta>>(`/admin/metas${query(params)}`);

export const fetchAdminMeta = (id: string) => apiFetch<AdminMetaDetail>(`/admin/metas/${id}`);

export type MetaInput = Omit<
  AdminMeta,
  'id' | 'createdAt' | 'updatedAt' | 'country' | '_count' | 'imageKey'
> & { imageKey?: string | null };

export const createAdminMeta = (body: MetaInput) =>
  apiFetch<AdminMeta>('/admin/metas', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const updateAdminMeta = (id: string, body: MetaInput) =>
  apiFetch<AdminMeta>(`/admin/metas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const deleteAdminMeta = (id: string) =>
  apiFetch<{ id: string }>(`/admin/metas/${id}`, { method: 'DELETE' });

export const fetchAdminDecks = (params: { take?: number; skip?: number } = {}) =>
  apiFetch<Page<AdminDeck>>(`/admin/decks${query(params)}`);

export const fetchAdminDeck = (id: string) => apiFetch<AdminDeckDetail>(`/admin/decks/${id}`);

export type DeckInput = Omit<
  AdminDeck,
  'id' | 'updatedAt' | '_count' | 'coverImageKey' | 'coverImageUrl' | 'startsAt' | 'endsAt'
> & {
  coverImageUrl?: string | null;
  coverImageKey?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
};

export const createAdminDeck = (body: DeckInput) =>
  apiFetch<AdminDeck>('/admin/decks', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const updateAdminDeck = (id: string, body: DeckInput) =>
  apiFetch<AdminDeck>(`/admin/decks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const setDeckMetas = (id: string, metaIds: string[]) =>
  apiFetch<AdminDeckDetail>(`/admin/decks/${id}/metas`, {
    method: 'PUT',
    body: JSON.stringify({ metaIds }),
  });

export const deleteAdminDeck = (id: string) =>
  apiFetch<{ id: string }>(`/admin/decks/${id}`, { method: 'DELETE' });

export const fetchAdminCountries = () => apiFetch<AdminCountry[]>('/admin/countries');

export const createAdminCountry = (body: Omit<AdminCountry, '_count'>) =>
  apiFetch<AdminCountry>('/admin/countries', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const updateAdminCountry = (code: string, body: Omit<AdminCountry, '_count'>) =>
  apiFetch<AdminCountry>(`/admin/countries/${code}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const deleteAdminCountry = (code: string) =>
  apiFetch<{ code: string }>(`/admin/countries/${code}`, { method: 'DELETE' });

export const fetchAdminUsers = (params: {
  search?: string;
  role?: string;
  status?: string;
  take?: number;
  skip?: number;
}) => apiFetch<Page<AdminUser>>(`/admin/users${query(params)}`);

export const fetchAdminUser = (id: string) => apiFetch<AdminUserDetail>(`/admin/users/${id}`);

export const updateAdminUser = (id: string, body: { name: string }) =>
  apiFetch<AdminUser>(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

export const setUserStatus = (id: string, status: UserStatus, reason?: string) =>
  apiFetch<AdminUser>(`/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  });

export const signOutUserEverywhere = (id: string) =>
  apiFetch<{ revoked: number }>(`/admin/users/${id}/sign-out`, { method: 'POST' });

export const deleteAdminUser = (id: string) =>
  apiFetch<{ id: string }>(`/admin/users/${id}`, { method: 'DELETE' });

export const setUserRole = (id: string, role: 'USER' | 'ADMIN') =>
  apiFetch<AdminUser>(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });

export const fetchAuditLog = (params: { take?: number; skip?: number }) =>
  apiFetch<Page<AuditEntry>>(`/admin/audit${query(params)}`);

export const fetchStorageStatus = () =>
  apiFetch<{ configured: boolean; maxUploadBytes: number }>('/storage');

export const fetchProfile = () => apiFetch<Profile>('/profile');

export const updateProfile = (body: { name?: string; image?: string }) =>
  apiFetch<Me>('/profile', { method: 'PATCH', body: JSON.stringify(body) });

/**
 * Uploads straight to R2 with a presigned URL. The API only signs the request,
 * so the file never travels through it.
 */
export async function uploadImage(
  file: File,
  prefix: 'metas' | 'decks' | 'avatars',
): Promise<{ url: string; key: string }> {
  const signPath = prefix === 'avatars' ? '/profile/avatar-upload' : '/admin/uploads/sign';

  const ticket = await apiFetch<UploadTicket>(signPath, {
    method: 'POST',
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      size: file.size,
      prefix,
    }),
  });

  const response = await fetch(ticket.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  if (!response.ok) {
    throw new Error(`Storage rejected the upload (${response.status})`);
  }

  return { url: ticket.publicUrl, key: ticket.key };
}

// -- Blog, footer pages and search engine settings ---------------------------

export type ContentStatus = 'DRAFT' | 'PUBLISHED';

export interface AdminPost {
  id: string;
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  readingTime: number;
  publishedAt: string | null;
  status: ContentStatus;
  updatedAt: string;
  viewCount: number;
}

export interface AdminPostDetail extends AdminPost {
  content: string;
  coverImageKey: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string;
  canonicalUrl: string | null;
  robotsMeta: string;
  ogImageUrl: string | null;
  wordCount: number;
  author: { id: string; name: string; email: string } | null;
}

export type PostInput = {
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  coverImageKey: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  robotsMeta: string;
  ogImageUrl: string;
  status: ContentStatus;
};

export const fetchAdminPosts = (params: {
  locale?: string;
  status?: string;
  search?: string;
  take?: number;
  skip?: number;
}) => apiFetch<Page<AdminPost>>(`/admin/posts${query(params)}`);

export const fetchAdminPost = (id: string) => apiFetch<AdminPostDetail>(`/admin/posts/${id}`);

export const createAdminPost = (body: PostInput) =>
  apiFetch<AdminPostDetail>('/admin/posts', { method: 'POST', body: JSON.stringify(body) });

export const updateAdminPost = (id: string, body: PostInput) =>
  apiFetch<AdminPostDetail>(`/admin/posts/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteAdminPost = (id: string) =>
  apiFetch<{ id: string }>(`/admin/posts/${id}`, { method: 'DELETE' });

export interface AdminPage {
  id: string;
  locale: string;
  slug: string;
  title: string;
  status: ContentStatus;
  includeInSitemap: boolean;
  footerOrder: number;
  updatedAt: string;
}

export interface AdminPageDetail extends AdminPage {
  excerpt: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  robotsMeta: string;
}

export type PageInput = {
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  robotsMeta: string;
  status: ContentStatus;
  includeInSitemap: boolean;
  footerOrder: number;
};

export const fetchAdminPages = (params: { locale?: string; status?: string } = {}) =>
  apiFetch<Page<AdminPage>>(`/admin/pages${query(params)}`);

export const fetchAdminPage = (id: string) => apiFetch<AdminPageDetail>(`/admin/pages/${id}`);

export const createAdminPage = (body: PageInput) =>
  apiFetch<AdminPageDetail>('/admin/pages', { method: 'POST', body: JSON.stringify(body) });

export const updateAdminPage = (id: string, body: PageInput) =>
  apiFetch<AdminPageDetail>(`/admin/pages/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteAdminPage = (id: string) =>
  apiFetch<{ id: string }>(`/admin/pages/${id}`, { method: 'DELETE' });

export interface SeoSettings {
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultKeywords: string;
  defaultOgImageUrl: string | null;
  robotsTxt: string | null;
  defaultRobotsMeta: string;
  blockIndexingOutsideProduction: boolean;
  sitemapEnabled: boolean;
  googleSiteVerification: string | null;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
  bingSiteVerification: string | null;
  twitterSite: string | null;
  organisationName: string;
  organisationLogo: string | null;
  contactEmail: string | null;
  updatedAt: string;
}

export const fetchSeoSettings = () => apiFetch<SeoSettings>('/admin/seo');

/** What the editor sends back: the settings, without the row's timestamp. */
export type SeoSettingsInput = Omit<SeoSettings, 'updatedAt'>;

export const updateSeoSettings = (body: SeoSettingsInput) =>
  apiFetch<SeoSettings>('/admin/seo', { method: 'PUT', body: JSON.stringify(body) });

// -- Guides ------------------------------------------------------------------

export interface AdminGuideTopic {
  id: string;
  locale: string;
  slug: string;
  title: string;
  summary: string;
  icon: string;
  coverImageUrl: string | null;
  coverImageKey: string | null;
  category: MetaCategory | null;
  position: number;
  status: ContentStatus;
  updatedAt: string;
  _count: { entries: number };
}

export interface AdminGuideEntry {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  countryCode: string | null;
  readingTime: number;
  position: number;
  status: ContentStatus;
  updatedAt: string;
  viewCount: number;
}

export interface AdminGuideTopicDetail extends Omit<AdminGuideTopic, '_count'> {
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string;
  canonicalUrl: string | null;
  robotsMeta: string;
  entries: AdminGuideEntry[];
}

export interface AdminGuideEntryDetail extends AdminGuideEntry {
  content: string;
  coverImageKey: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string;
  canonicalUrl: string | null;
  robotsMeta: string;
  topic: { id: string; locale: string; slug: string; title: string };
}

export type GuideTopicInput = {
  locale: string;
  slug: string;
  title: string;
  summary: string;
  icon: string;
  coverImageUrl: string;
  coverImageKey: string;
  category: MetaCategory | '';
  position: number;
  status: ContentStatus;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  robotsMeta: string;
};

export type GuideEntryInput = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  coverImageKey: string;
  countryCode: string;
  position: number;
  status: ContentStatus;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  robotsMeta: string;
};

export const fetchAdminGuides = (params: {
  locale?: string;
  status?: string;
  search?: string;
} = {}) => apiFetch<Page<AdminGuideTopic>>(`/admin/guides${query(params)}`);

export const fetchAdminGuide = (id: string) =>
  apiFetch<AdminGuideTopicDetail>(`/admin/guides/${id}`);

export const createAdminGuide = (body: GuideTopicInput) =>
  apiFetch<AdminGuideTopicDetail>('/admin/guides', { method: 'POST', body: JSON.stringify(body) });

export const updateAdminGuide = (id: string, body: GuideTopicInput) =>
  apiFetch<AdminGuideTopicDetail>(`/admin/guides/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const deleteAdminGuide = (id: string) =>
  apiFetch<{ id: string }>(`/admin/guides/${id}`, { method: 'DELETE' });

export const fetchAdminGuideEntry = (id: string) =>
  apiFetch<AdminGuideEntryDetail>(`/admin/guide-entries/${id}`);

export const createAdminGuideEntry = (topicId: string, body: GuideEntryInput) =>
  apiFetch<AdminGuideEntryDetail>(`/admin/guides/${topicId}/entries`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const updateAdminGuideEntry = (id: string, body: GuideEntryInput) =>
  apiFetch<AdminGuideEntryDetail>(`/admin/guide-entries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const deleteAdminGuideEntry = (id: string) =>
  apiFetch<{ id: string }>(`/admin/guide-entries/${id}`, { method: 'DELETE' });
