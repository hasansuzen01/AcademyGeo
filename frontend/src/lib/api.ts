import type { ImageSource } from './card-image';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Every call carries the session cookie, so the API can be on another host. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}/api${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    // The API explains refusals in a message field. Showing it beats a generic
    // failure when an admin has, say, reused a slug.
    const detail = await response
      .json()
      .then((body: { message?: string | string[] }) =>
        Array.isArray(body.message) ? body.message.join(', ') : body.message,
      )
      .catch(() => undefined);

    throw new ApiError(detail ?? `Request failed: ${path}`, response.status);
  }

  // An endpoint with nothing to return answers with no body at all, and
  // reading that as JSON throws "Unexpected end of JSON input". Asking for the
  // text first turns "nothing" into null, which is what the caller expects.
  const body = await response.text();

  return (body === '' ? null : JSON.parse(body)) as T;
}

export interface QueueCard {
  metaId: string;
  category: string;
  imageUrl: string;
  imageSource: ImageSource;
  difficulty: number;
  /** How long the picture stays up before it is covered. Null means it stays. */
  revealMs: number | null;
  choices: Array<{ code: string; nameEn: string; nameTr: string }>;
}

export interface AnswerResult {
  correct: boolean;
  country: { code: string; nameEn: string; nameTr: string };
  explanation: {
    titleEn: string;
    titleTr: string;
    descriptionEn: string;
    descriptionTr: string;
  };
  nextDueAt: string;
  intervalDays: number;
}

export interface DashboardStats {
  totalReviews: number;
  correctReviews: number;
  winRate: number;
  streak: number;
  dueNow: number;
  learnedMetas: number;
  trackedMetas: number;
  confusions: Array<{ actual: string; guessed: string; count: number }>;
  categories: Array<{ category: string; total: number; winRate: number }>;
  activity: Array<{ day: string; reviews: number; correct: number }>;
}

export function fetchQueue(filter: { category?: string; deckSlug?: string } = {}) {
  const query = new URLSearchParams();
  if (filter.category) query.set('category', filter.category);
  if (filter.deckSlug) query.set('deckSlug', filter.deckSlug);

  const suffix = query.size === 0 ? '' : `?${query.toString()}`;

  return apiFetch<{ cards: QueueCard[]; generatedAt: string }>(`/review/queue${suffix}`);
}

export function submitAnswer(body: {
  metaId: string;
  guessedCountryCode: string;
  responseMs: number;
}) {
  return apiFetch<AnswerResult>('/review/answer', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function fetchDashboard() {
  return apiFetch<DashboardStats>('/stats/dashboard');
}

export interface Country {
  code: string;
  nameEn: string;
  nameTr: string;
  region: string;
}

export function fetchCountries() {
  return apiFetch<Country[]>('/metas/countries');
}
