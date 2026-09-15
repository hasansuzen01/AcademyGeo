import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';

import { CollectionCover } from '@/components/collection-cover';
import { PhotoCredit } from '@/components/photo-credit';
import { Link } from '@/i18n/navigation';
import { fetchCollections } from '@/lib/decks-api';
import { sectionMetadata } from '@/lib/page-metadata';

export const generateMetadata = sectionMetadata('/collections', 'collections');

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, play, collections] = await Promise.all([
    getTranslations('collections'),
    getTranslations('play'),
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
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection, index) => (
            <li
              key={collection.slug}
              className="rise-in flex flex-col"
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <article className="card-raised group flex flex-1 flex-col overflow-hidden">
                <Link href={`/play/practice?deck=${collection.slug}`} tabIndex={-1} aria-hidden>
                  <CollectionCover
                    collection={collection}
                    name={current === 'tr' ? collection.nameTr : collection.nameEn}
                    count={t('cardCount', { count: collection.cardCount })}
                    sizes="(min-width: 1280px) 30vw, (min-width: 640px) 50vw, 100vw"
                  />
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-sm leading-relaxed text-muted">
                    {current === 'tr' ? collection.descriptionTr : collection.descriptionEn}
                  </p>

                  {/* Three ways into the same set: study it, race it, or risk it. */}
                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
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
                </div>
              </article>

              <PhotoCredit
                credit={collection.cover?.credit ?? null}
                label={play('photoCredit')}
                className="mt-1.5 px-1"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
