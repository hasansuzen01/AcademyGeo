/** Turkish letters have no place in a URL, but dropping them mangles the word. */
const TRANSLITERATIONS: Record<string, string> = {
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
};

/** A readable address for a title, in either language. */
export function toSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[çğıöşü]/g, (letter) => TRANSLITERATIONS[letter] ?? letter)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'post'
  );
}
