import { cookies } from 'next/headers';

import type { Me } from './admin-api';

// Server-side calls can take an internal hostname when the API sits on the
// same Docker network; the browser value is the fallback.
const API_URL =
  process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/**
 * The signed-in account, resolved on the server by forwarding the request's
 * cookies. Returns null for anyone the API does not recognise.
 */
export async function fetchViewer(): Promise<Me | null> {
  const cookieHeader = (await cookies()).toString();
  if (!cookieHeader) return null;

  try {
    const response = await fetch(`${API_URL}/api/me`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });

    return response.ok ? ((await response.json()) as Me) : null;
  } catch {
    return null;
  }
}

export interface CatalogueSummary {
  countries: number;
  cards: number;
  clueTypes: number;
}

/** Deck size for the landing page. Falls back to zeros if the API is down. */
export async function fetchCatalogueSummary(): Promise<CatalogueSummary> {
  try {
    const response = await fetch(`${API_URL}/api/metas/summary`, {
      next: { revalidate: 3600 },
    });

    return response.ok
      ? ((await response.json()) as CatalogueSummary)
      : { countries: 0, cards: 0, clueTypes: 0 };
  } catch {
    return { countries: 0, cards: 0, clueTypes: 0 };
  }
}
