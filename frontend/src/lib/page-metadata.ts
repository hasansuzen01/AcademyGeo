import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { fetchSiteSeo } from './content-api';
import { buildMetadata } from './metadata';

/**
 * generateMetadata for a page served at the same segment under every locale,
 * titled from `metaTitle` and `metaDescription` in one translation namespace.
 *
 * The canonical address is built from the segment the page is exported with,
 * so it cannot drift from where the page actually lives.
 */
export function sectionMetadata(segment: string, namespace: string) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> {
    const { locale } = await params;
    const [site, t] = await Promise.all([fetchSiteSeo(), getTranslations({ locale, namespace })]);

    return buildMetadata({
      site,
      path: `/${locale}${segment}`,
      title: t('metaTitle'),
      description: t('metaDescription'),
    });
  };
}
