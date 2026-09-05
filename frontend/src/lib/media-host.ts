export interface MediaPattern {
  protocol: 'http' | 'https';
  hostname: string;
  port?: string;
}

/**
 * Reads NEXT_PUBLIC_MEDIA_HOST into the pattern next/image matches against.
 *
 * Cloudflare shows the bucket as a full URL, so that is what ends up in the
 * env file, but next/image matches on the parts rather than the address. Every
 * mismatch here fails the same silent way: the picture just never loads. So a
 * bare hostname and a full URL are both accepted, and the scheme and port come
 * from the value instead of being assumed.
 */
export function parseMediaPattern(raw: string | undefined): MediaPattern | undefined {
  const value = raw?.trim();
  if (!value) return undefined;

  // A bare hostname is not a URL, so give it a scheme first. Both spellings
  // then go through the same parser.
  const asUrl = value.includes('://') ? value : `https://${value}`;

  let url: URL;
  try {
    url = new URL(asUrl);
  } catch {
    return undefined;
  }

  if (!url.hostname) return undefined;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;

  return {
    protocol: url.protocol === 'http:' ? 'http' : 'https',
    hostname: url.hostname,
    ...(url.port ? { port: url.port } : {}),
  };
}
