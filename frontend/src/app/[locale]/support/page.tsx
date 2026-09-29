import { Coffee, Heart } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { fetchSiteSeo, fetchSupporters } from '@/lib/content-api';
import { sectionMetadata } from '@/lib/page-metadata';
import { supportHref } from '@/lib/support-link';

export const generateMetadata = sectionMetadata('/support', 'support');

/**
 * Why the site asks for money, where to give it, and who already has.
 *
 * Giving is voluntary and changes nothing on the site, and the page says so:
 * nothing here is sold, and nothing is locked behind a donation.
 */
export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [site, supporters, t] = await Promise.all([
    fetchSiteSeo(),
    fetchSupporters(),
    getTranslations('support'),
  ]);
  const href = supportHref(site.supportUrl);
  if (!href) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <p className="eyebrow">{t('eyebrow')}</p>
      <h1 className="mt-2 font-display text-4xl font-900 leading-tight tracking-tight">
        {t('title')}
      </h1>

      <div className="mt-6 space-y-4 text-base leading-relaxed text-ink">
        <p>{t('free')}</p>
        <p>{t('costs')}</p>
        <p className="font-800">{t('voluntary')}</p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn-paint">
          <Coffee className="size-5" aria-hidden />
          {t('cta')}
        </a>
        <p className="max-w-xs text-xs text-muted">{t('ctaNote')}</p>
      </div>

      <section className="mt-16" aria-labelledby="supporters-title">
        <h2
          id="supporters-title"
          className="flex items-center gap-2 font-display text-2xl font-900 tracking-tight"
        >
          <Heart className="size-5 text-stop" aria-hidden />
          {t('supportersTitle')}
        </h2>
        <p className="mt-2 text-sm text-muted">{t('supportersIntro')}</p>

        {supporters.length === 0 ? (
          <p className="card-raised mt-6 px-5 py-8 text-center text-sm text-muted">
            {t('supportersEmpty')}
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {supporters.map((supporter) => (
              <li key={supporter.id} className="card-raised px-5 py-4">
                <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="font-900">{supporter.name ?? t('anonymous')}</span>
                  <span className="text-muted">{t('coffees', { count: supporter.coffees })}</span>
                  {supporter.createdAt && (
                    <span className="ml-auto text-xs text-muted">
                      {new Date(supporter.createdAt).toLocaleDateString(locale)}
                    </span>
                  )}
                </p>
                {/* Someone else's words, printed as text and never as markup. */}
                {supporter.note && (
                  <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed">
                    {supporter.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
