/** How long a timed run has left, or null when nothing is counting down. */
export function remainingMs(endsAt: string | null, now: number): number | null {
  if (!endsAt) return null;

  return Math.max(0, new Date(endsAt).getTime() - now);
}

/**
 * A countdown, rounded up: half a second left still reads 0:01, so the clock
 * only shows zero at the moment the run is actually over.
 */
export function formatClock(ms: number): string {
  const seconds = Math.ceil(Math.max(0, ms) / 1000);
  const minutes = Math.floor(seconds / 60);

  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

/** How long a finished run took, written the way a person would say it. */
export function formatDuration(ms: number): string {
  const seconds = Math.round(Math.max(0, ms) / 1000);
  const minutes = Math.floor(seconds / 60);

  return minutes === 0 ? `${seconds}s` : `${minutes}m ${seconds % 60}s`;
}
