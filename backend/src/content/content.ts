import sanitizeHtml from 'sanitize-html';

const WORDS_PER_MINUTE = 200;

/** Turkish letters have no place in a URL, but dropping them mangles the word. */
const TRANSLITERATIONS: Record<string, string> = {
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  İ: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
};

/** A readable address for a title, in either language. */
export function toSlug(title: string): string {
  const slug = title
    .replace(
      /[çğıİöşü]/gi,
      (letter) => TRANSLITERATIONS[letter] ?? TRANSLITERATIONS[letter.toLowerCase()] ?? letter,
    )
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'post';
}

/**
 * How long the post is, worked out when it is saved.
 *
 * The list response carries no body, so this cannot be counted at read time,
 * and leaving it to the browser would let a one-line post claim five minutes.
 */
export function measureContent(html: string): { wordCount: number; readingTime: number } {
  const wordCount = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return { wordCount, readingTime: Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)) };
}

/**
 * Cleans editor HTML before it is stored.
 *
 * Only admins write posts, but everyone reads them, so a script that reaches
 * the database runs in every reader's browser. Cleaning on the way in means
 * the stored content is safe for anything that renders it later.
 */
export function sanitiseContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p',
      'br',
      'h2',
      'h3',
      'h4',
      'strong',
      'em',
      'u',
      's',
      'code',
      'pre',
      'ul',
      'ol',
      'li',
      'blockquote',
      'hr',
      'a',
      'img',
      'figure',
      'figcaption',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      '*': ['style'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedStyles: { '*': { 'text-align': [/^left$|^right$|^center$|^justify$/] } },
    transformTags: {
      // An outbound link opened in a new tab can reach back through
      // window.opener without this.
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
  });
}

/**
 * When the post went live.
 *
 * Written once. Re-stamping it on every save would push edited posts back to
 * the top of the feed and change the date already given to search engines.
 */
export function resolvePublishedAt({
  existing,
  status,
  now,
}: {
  existing: Date | null;
  status: 'DRAFT' | 'PUBLISHED';
  now: Date;
}): Date | null {
  if (existing) return existing;

  return status === 'PUBLISHED' ? now : null;
}
