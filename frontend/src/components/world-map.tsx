import { getLocale, getTranslations } from 'next-intl/server';

import { MapViewport } from '@/components/map-viewport';
import { getPathname } from '@/i18n/navigation';
import type { AtlasCountry } from '@/lib/atlas-api';
import { cn } from '@/lib/cn';
import { WORLD, buildMapCountries } from '@/lib/world-map';

/**
 * The atlas as a map rather than a list.
 *
 * The borders are Natural Earth shapes, projected at build time into one file
 * of SVG paths, so the page draws a map without fetching one and without a
 * geometry library in the bundle.
 *
 * It renders on the server and ships no JavaScript at all. Hover is a class,
 * the name is a native <title>, and a country you can open is a real link, so
 * it can be middle-clicked, opened in a new tab, and used with the keyboard
 * without any of that being written by hand. Countries the deck does not cover
 * are still drawn, because a map with holes in it reads as broken rather than
 * as unfinished.
 */
export async function WorldMap({ countries }: { countries: AtlasCountry[] }) {
  const [t, locale] = await Promise.all([getTranslations('atlas'), getLocale()]);
  const shown = buildMapCountries(WORLD.shapes, countries, locale);

  return (
    <div className="card-raised overflow-hidden px-3 py-3 sm:px-5 sm:py-5">
      <MapViewport world={WORLD} label={t('mapLabel')}>
        {shown.map((country) => {
          const shape = (
            <path
              d={country.d}
              className={cn(
                'stroke-paper transition-colors duration-150 [stroke-width:0.7]',
                country.open ? 'fill-go/45 hover:fill-go group-focus-visible:fill-go' : 'fill-edge',
              )}
            />
          );

          if (!country.open) {
            return (
              <g key={country.code}>
                <title>{`${country.name} — ${t('mapNoClues')}`}</title>
                {shape}
              </g>
            );
          }

          return (
            <a
              key={country.code}
              href={getPathname({
                href: `/atlas/${country.code.toLowerCase()}`,
                locale,
              })}
              className="group cursor-pointer"
            >
              <title>{`${country.name} — ${t('clueCount', { count: country.clueCount })}`}</title>
              {shape}
            </a>
          );
        })}
      </MapViewport>

      <p className="mt-2 text-center text-sm font-700 text-muted">{t('mapHint')}</p>
    </div>
  );
}
