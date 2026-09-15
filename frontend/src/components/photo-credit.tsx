import { cn } from '@/lib/cn';
import type { ImageCredit } from '@/lib/photo-credit';

/**
 * The line a licensed photograph owes whoever took it: their name, the licence,
 * and a link to where it came from so the licence can be checked.
 *
 * Draws nothing for a picture that credits nobody, such as the project's own
 * diagrams. Holds no hooks, so a server page and a client card can both use it.
 */
export function PhotoCredit({
  credit,
  label,
  className,
}: {
  credit: ImageCredit | null;
  label: string;
  className?: string;
}) {
  if (!credit) return null;

  const parts = [credit.author, credit.license].filter(Boolean).join(' · ');
  const text = parts ? `${label}: ${parts}` : label;

  return (
    <p className={cn('text-[0.6875rem] leading-snug text-muted', className)}>
      {credit.sourceUrl ? (
        <a
          href={credit.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-ink"
        >
          {text}
        </a>
      ) : (
        text
      )}
    </p>
  );
}
