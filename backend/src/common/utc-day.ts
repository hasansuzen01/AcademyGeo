/** Calendar-day helpers. Practice days are counted in UTC everywhere. */
export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function toUtcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}
