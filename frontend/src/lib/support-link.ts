/**
 * The address the support button opens, or null when there should be no
 * button at all.
 *
 * It is typed into the admin panel and ends up in an href, so only a plain
 * https page is let through: an empty setting hides the button, and anything
 * else would be a button that goes nowhere or somewhere it should not.
 */
export function supportHref(value: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed).protocol === 'https:' ? trimmed : null;
  } catch {
    return null;
  }
}
