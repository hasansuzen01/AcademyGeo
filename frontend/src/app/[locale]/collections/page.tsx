import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { fetchCollections } from '@/lib/decks-api';

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, collections] = await Promise.all([
    getTranslations('collections'),
    fetchCollections(),
  ]);
  const current = await getLocale();

  return (
    <div className="page-shell px-5 py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-900 tracking-tight sm:text-4xl">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted">{t('subtitle')}</p>
      </header>

      {collections.length === 0 ? (
        <p className="card-raised px-6 py-12 text-center text-muted">{t('empty')}</p>
      ) : (
        <ul className="space-y-4">
          {collections.map((collection) => (
            <li key={collection.slug} className="card-raised p-5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="font-display text-lg font-900 tracking-tight text-ink">
                  {current === 'tr' ? collection.nameTr : collection.nameEn}
                </h2>
                <span className="rounded-full bg-canvas px-2.5 py-0.5 text-[0.6875rem] font-800 text-muted">
                  {t('cardCount', { count: collection.cardCount })}
                </span>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-muted">
                {current === 'tr' ? collection.descriptionTr : collection.descriptionEn}
              </p>

              {/* Three ways into the same set: study it, race it, or risk it. */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/play/practice?deck=${collection.slug}`}
                  className="btn btn-go px-4 py-2 text-sm"
                >
                  {t('practise')}
                </Link>
                <Link
                  href={`/play/rush?deck=${collection.slug}`}
                  className="btn btn-quiet px-4 py-2 text-sm text-ink"
                >
                  {t('rush')}
                </Link>
                <Link
                  href={`/play/survival?deck=${collection.slug}`}
                  className="btn btn-quiet px-4 py-2 text-sm text-ink"
                >
                  {t('survival')}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
