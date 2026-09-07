/**
 * The counter one caller shares for one route over one stretch of time.
 *
 * A fixed window rather than a sliding one: the count lives in Redis under
 * this key with the window as its expiry, so nothing has to be swept up and a
 * Redis outage costs the limit rather than the request.
 */
export function windowKey(route: string, caller: string, now: number, windowMs: number): string {
  return `rate:${route}:${caller}:${Math.floor(now / windowMs)}`;
}
