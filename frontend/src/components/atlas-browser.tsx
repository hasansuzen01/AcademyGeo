'use client';

import { Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Link } from '@/i18n/navigation';
import type { AtlasCountry } from '@/lib/atlas-api';
import { cn } from '@/lib/cn';

const REGIONS = [
  'EUROPE',
  'ASIA',
  'AFRICA',
  'NORTH_AMERICA',
  'SOUTH_AMERICA',
  'OCEANIA',
] as const;

/**
 * The reference index. A player who has just lost a round on Norway wants to
 * be reading about Norway two keystrokes later, so search comes before
 * browsing and the region filter is secondary.
 */
export function AtlasBrowser({ countries }: { countries: AtlasCountry[] }) {
  const t = useTranslations('atlas');
  const regions = useTranslations('regions');
  const locale = useLocale();

  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<string | null>(null);

  const name = (country: AtlasCountry) => (locale === 'tr' ? country.nameTr : country.nameEn);

  const shown = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale);

    return countries.filter((country) => {
      if (region && country.region !== region) return false;
      if (!needle) return true;

      return (
        country.nameEn.toLocaleLowerCase(locale).includes(needle) ||
        country.nameTr.toLocaleLowerCase(locale).includes(needle) ||
        country.code.toLocaleLowerCase(locale).includes(needle)
      );
    });
  }, [countries, locale, query, region]);

  return (
    <div>
      <h2 className="mb-3 font-display text-lg font-900 tracking-tight">{t('listTitle')}</h2>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          className="w-full rounded-2xl border-2 border-line bg-paper py-3 pr-4 pl-11 text-sm font-700 text-ink placeholder:font-600 placeholder:text-muted"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Chip active={region === null} onClick={() => setRegion(null)}>
          {t('allRegions')}
        </Chip>
        {REGIONS.map((option) => (
          <Chip
            key={option}
            active={region === option}
            onClick={() => setRegion(region === option ? null : option)}
          >
            {regions(option)}
          </Chip>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="card-raised px-6 py-12 text-center text-muted">{t('noMatches')}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((country) => (
            <li key={country.code}>
              <Link
                href={`/atlas/${country.code.toLowerCase()}`}
                className="card-raised flex h-full items-start gap-3 p-4 transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
              >
                <span className="text-2xl leading-none" aria-hidden>
                  {country.flagEmoji ?? '🌍'}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display font-900 text-ink">
                    {name(country)}
                  </span>
                  <span className="mt-0.5 block text-xs font-700 text-muted">
                    {t('clueCount', { count: country.clueCount })}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-xl px-3 py-1.5 text-xs font-800 transition-colors',
        active ? 'bg-ink text-paper' : 'bg-paper text-muted hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}
