/**
 * Fisher-Yates, on a copy. The random source is a parameter so a test can pin
 * the order down instead of running the same case a hundred times and hoping.
 */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}
