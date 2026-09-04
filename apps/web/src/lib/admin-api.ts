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

export interface AdminCountry {
  code: string;
  nameEn: string;
  nameTr: string;
  region: Region;
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

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  _count?: { reviewLogs: number; reviewCards: number };
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
    method: 'PATCH',
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
    method: 'PATCH',
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
    method: 'PATCH',
    body: JSON.stringify(body),
  });

export const deleteAdminCountry = (code: string) =>
  apiFetch<{ code: string }>(`/admin/countries/${code}`, { method: 'DELETE' });

export const fetchAdminUsers = (params: {
  search?: string;
  role?: string;
  take?: number;
  skip?: number;
}) => apiFetch<Page<AdminUser>>(`/admin/users${query(params)}`);

export const setUserRole = (id: string, role: 'USER' | 'ADMIN') =>
  apiFetch<AdminUser>(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });

export const fetchAuditLog = (params: { take?: number; skip?: number }) =>
  apiFetch<Page<AuditEntry>>(`/admin/audit${query(params)}`);

export const fetchStorageStatus = () =>
  apiFetch<{ configured: boolean; maxUploadBytes: number }>('/admin/storage');

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
