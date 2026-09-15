import { cn } from '@/lib/cn';

/**
 * The AcademyGeo mark: a road running up to the pin it is trying to name.
 *
 * It is drawn from the same road palette as the rest of the interface, and it
 * sits on the same thick bottom edge as a button. The favicon and app icons
 * are rendered from these shapes by scripts/generate-icons.mjs, so a change
 * here belongs there too.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('shrink-0', className)} aria-hidden>
      <rect width="64" height="64" rx="14" fill="var(--color-go-deep)" />
      <rect width="64" height="60" rx="14" fill="var(--color-go)" />
      <path d="M14 64h36L35 24h-6z" fill="var(--color-ink)" />
      <path
        d="M29.8 59h4.4l-.5-10h-3.4zM30.5 44.5h3l-.3-6.5h-2.4z"
        fill="var(--color-paint)"
      />
      <path
        d="M32 33c-5-7-9-11-9-16a9 9 0 0 1 18 0c0 5-4 9-9 16z"
        fill="var(--color-stop)"
      />
      <circle cx="32" cy="17" r="3.6" fill="var(--color-paper)" />
    </svg>
  );
}
