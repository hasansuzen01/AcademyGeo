export interface ActivityDay {
  key: string;
  reviews: number;
}

/**
 * Fills a fixed run of days from sparse activity rows, so a chart with one
 * busy day renders as one bar rather than a single stretched block.
 */
export function buildActivityWindow(
  activity: Array<{ day: string; reviews: number }>,
  days: number,
): ActivityDay[] {
  const byDay = new Map(activity.map((entry) => [entry.day, entry.reviews]));

  return Array.from({ length: days }, (_, offset) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (days - 1 - offset));
    const key = date.toISOString().slice(0, 10);

    return { key, reviews: byDay.get(key) ?? 0 };
  });
}
