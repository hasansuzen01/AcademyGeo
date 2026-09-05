import { getLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';

import { Link } from '@/i18n/navigation';
import type { AtlasCountryDetail } from '@/lib/atlas-api';
import { imageFitClass } from '@/lib/card-image';

/**
 * One country, read the way a player works through a scene: the facts that
 * settle it in a glance first, then the clue pictures grouped from the car in
 * front outwards to the horizon.
 */
export async function CountryPage({ country }: { country: AtlasCountryDetail }) {
  const t = await getTranslations('atlas');
  const categories = await getTranslations('categories');
  const regions = await getTranslations('regions');
  const locale = await getLocale();

  const name = locale === 'tr' ? country.nameTr : country.nameEn;
  const summary = locale === 'tr' ? country.summaryTr : country.summaryEn;

  const facts = [
    country.drivingSide && {
      label: t('facts.drivingSide'),
      value: t(`drivingSide.${country.drivingSide}`),
    },
    country.languages.length > 0 && {
      label: t('facts.languages'),
      value: country.languages.join(', '),
    },
    country.ccTld && { label: t('facts.ccTld'), value: country.ccTld },
    country.phonePrefix && { label: t('facts.phonePrefix'), value: country.phonePrefix },
    country.currency && { label: t('facts.currency'), value: country.currency },
    country.cameraGens.length > 0 && {
      label: t('facts.cameraGens'),
      value: country.cameraGens.join(', '),
    },
  ].flatMap((fact) => (fact ? [fact] : []));

  return (
    <article className="mx-auto w-full max-w-4xl px-5 py-12">
      <Link href="/atlas" className="text-sm font-800 text-muted hover:text-ink">
        {t('backToIndex')}
      </Link>

      <header className="mt-4 flex items-start gap-4">
        <span className="text-5xl leading-none" aria-hidden>
          {country.flagEmoji ?? '🌍'}
        </span>

        <div className="min-w-0">
          <h1 className="font-display text-3xl font-900 tracking-tight sm:text-4xl">{name}</h1>
          <p className="mt-1 text-sm font-800 text-muted">
            {regions(country.region)} · {t('clueCount', { count: country.clueCount })}
          </p>
        </div>
      </header>

      {summary && <p className="prose-card mt-6 max-w-none">{summary}</p>}

      {facts.length > 0 && (
        <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="card px-4 py-3">
              <dt className="eyebrow">{fact.label}</dt>
              <dd className="mt-1 font-display font-900 text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {country.groups.length === 0 ? (
        <p className="card-raised mt-10 px-6 py-12 text-center text-muted">{t('noClues')}</p>
      ) : (
        country.groups.map((group) => (
          <section key={group.category} className="mt-10">
            <h2 className="mb-4 font-display text-xl font-900 tracking-tight">
              {categories(group.category)}
            </h2>

            <ul className="grid gap-4 sm:grid-cols-2">
              {group.clues.map((clue) => (
                <li key={clue.id} className="card-raised overflow-hidden">
                  <div className="relative aspect-[8/5] w-full bg-canvas">
                    <Image
                      src={clue.imageUrl}
                      alt={locale === 'tr' ? clue.titleTr : clue.titleEn}
                      fill
                      sizes="(max-width: 640px) 100vw, 380px"
                      className={imageFitClass(clue.imageSource)}
                    />
                  </div>

                  <div className="px-4 py-3">
                    <h3 className="font-display font-900 text-ink">
                      {locale === 'tr' ? clue.titleTr : clue.titleEn}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {locale === 'tr' ? clue.descriptionTr : clue.descriptionEn}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Link href="/play/drill" className="btn btn-go">
          {t('drillCta')}
        </Link>
        <Link href="/atlas" className="btn btn-quiet">
          {t('backToIndex')}
        </Link>
      </div>
    </article>
  );
}
