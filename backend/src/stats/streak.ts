const DAY_MS = 24 * 60 * 60 * 1000;

/** Counts consecutive practice days, in UTC, ending today or yesterday. */
export function calculateStreak(activeDays: string[], today: Date): number {
  const active = new Set(activeDays);
  let cursor = startOfUtcDay(today);

  if (!active.has(toUtcDay(cursor))) {
    cursor = new Date(cursor.getTime() - DAY_MS);
    if (!active.has(toUtcDay(cursor))) return 0;
  }

  let streak = 0;
  while (active.has(toUtcDay(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }

  return streak;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function toUtcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}
