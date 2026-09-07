import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PlaySession } from '@/components/play-session';
import { META_CATEGORIES, type MetaCategory } from '@/lib/admin-api';

/** The query arrives from a link, so it is checked rather than trusted. */
function readCategory(value: string | undefined): MetaCategory | undefined {
  return META_CATEGORIES.find((category) => category === value);
}

export default async function PracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ deck?: string; category?: string }>;
}) {
  const [{ locale }, { deck, category }] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const [t, categories] = await Promise.all([
    getTranslations('play'),
    getTranslations('categories'),
  ]);

  const filter = readCategory(category);

  return (
    <div className="page-shell px-5 py-12">
      <header className="mb-8 text-center">
        <h1 className="font-display text-3xl font-900 tracking-tight">{t('title')}</h1>
        {/* A guide sends the reader here with one clue type in mind, so the
            page has to say which one it is dealing. */}
        {filter && <p className="eyebrow mt-2">{categories(filter)}</p>}
      </header>

      <PlaySession deckSlug={deck} category={filter} />
    </div>
  );
}
