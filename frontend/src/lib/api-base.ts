/**
 * The API address for calls made on the server.
 *
 * Inside Docker the API answers on an internal hostname the browser cannot
 * reach, so that one wins when it is set; otherwise the browser's own address
 * works for both.
 */
export const SERVER_API_URL =
  process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
