import { randomUUID } from 'node:crypto';

export interface ObjectKeyInput {
  prefix: string;
  filename: string;
  contentType: string;
  /**
   * Fixes the name inside the prefix instead of generating a unique one, so a
   * second upload replaces the first. Used for avatars, where one object per
   * account is all that should ever exist.
   */
  name?: string;
}

/**
 * SVG is deliberately absent: an SVG served from the media domain can carry
 * script, and these files are uploaded by admins but rendered for everyone.
 */
const ALLOWED_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
]);

/** The same list, for the upload DTO to reject anything else with a 400. */
export const IMAGE_CONTENT_TYPES = [...ALLOWED_TYPES.keys()];

export function buildObjectKey({ prefix, filename, contentType, name }: ObjectKeyInput): string {
  const extension = ALLOWED_TYPES.get(contentType);
  if (!extension) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  if (name) {
    return `${prefix}/${slugify(name)}.${extension}`;
  }

  // The stem is only there to keep the bucket readable. Uniqueness comes from
  // the suffix, so re-uploading the same filename never overwrites a live card.
  const stem = slugify(filename.replace(/\.[^.]+$/, '')) || 'upload';
  const suffix = randomUUID().slice(0, 8);

  return `${prefix}/${stem}-${suffix}.${extension}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
