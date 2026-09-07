/**
 * The API address for calls made on the server.
 *
 * Inside Docker the API answers on an internal hostname the browser cannot
 * reach, so that one wins when it is set; otherwise the browser's own address
 * works for both.
 */
export const SERVER_API_URL =
  process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/**
 * Reads something public from the API, answering null rather than throwing.
 *
 * A page that cannot reach the API should render what it can, and the image is
 * built before anything is running, so a read that insists on an answer cannot
 * be built at all.
 */
export async function readPublic<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const response = await fetch(`${SERVER_API_URL}/api${path}`, { next: { revalidate } });

    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}
