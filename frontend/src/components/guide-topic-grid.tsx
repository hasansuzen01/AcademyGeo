import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { GuideIcon } from '@/lib/guide-icons';
import type { GuideTopicCard } from '@/lib/guides-api';

/**
 * The headings, as a set of pressable cards.
 *
 * Server-rendered: nothing here changes after it is drawn, so the entry
 * animation is the CSS one and no JavaScript is sent for the grid.
 */
export async function GuideTopicGrid({ topics }: { topics: GuideTopicCard[] }) {
  const t = await getTranslations('guides');

  // A heading with no articles yet can still hold photos, and those are worth
  // opening, so "being written" is kept for a heading with neither.
  const tally = (topic: GuideTopicCard) => {
    const parts: string[] = [];
    if (topic.entryCount > 0) {
      parts.push(t('entryCount', { count: topic.entryCount }));
      parts.push(t('readingTime', { minutes: topic.readingTime }));
    }
    if (topic.exampleCount > 0) parts.push(t('exampleCount', { count: topic.exampleCount }));

    return parts.length > 0 ? parts.join(' · ') : t('comingSoon');
  };

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {topics.map((topic, index) => (
        <li key={topic.id} className="rise-in" style={{ animationDelay: `${index * 45}ms` }}>
          <Link
            href={`/guides/${topic.slug}`}
            className="card-raised card-lift flex h-full flex-col gap-4 p-5"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-paint/25 text-paint-deep">
              <GuideIcon name={topic.icon} className="size-6" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block font-display text-lg font-900 tracking-tight">
                {topic.title}
              </span>
              {topic.summary && (
                <span className="mt-2 block text-sm leading-relaxed text-muted">
                  {topic.summary}
                </span>
              )}
            </span>

            <span className="eyebrow">{tally(topic)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
