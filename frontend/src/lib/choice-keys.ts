/**
 * Which answer a key press picked, or null when it picked none.
 *
 * The buttons are numbered from one because that is how they are counted out
 * loud; zero names no button, so it is left alone rather than wrapped round.
 */
export function choiceForKey(key: string, count: number): number | null {
  if (!/^[1-9]$/.test(key)) return null;

  const index = Number(key) - 1;

  return index < count ? index : null;
}
