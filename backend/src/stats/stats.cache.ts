export const STATS_CACHE_TTL_SECONDS = 60;

export function statsCacheKey(userId: string): string {
  return `stats:dashboard:${userId}`;
}
