import { getTranslations } from 'next-intl/server';

import { BrandMark } from '@/components/brand-mark';
import { Link } from '@/i18n/navigation';
import { fetchFooterLinks, fetchSiteSeo } from '@/lib/content-api';

/**
 * The standing pages and the disclaimer.
 *
 * The links come from the database, so an admin can add a page and have it
 * appear here without a deploy.
 */
export async function SiteFooter({ locale }: { locale: string }) {
  const [links, site, t] = await Promise.all([
    fetchFooterLinks(locale),
    fetchSiteSeo(),
    getTranslations({ locale, namespace: 'footer' }),
  ]);

  return (
    <footer className="mt-20 border-t-2 border-line bg-paper">
      <div className="page-shell flex flex-col gap-6 px-5 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandMark className="size-10" />
            <div>
              <p className="font-display text-lg font-900 tracking-tight">{site.siteName}</p>
              <p className="mt-1 max-w-md text-sm text-muted">{t('tagline')}</p>
            </div>
          </div>

          <nav aria-label={t('linksLabel')} className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href="/guides" className="text-muted transition-colors hover:text-ink">
              {t('guides')}
            </Link>
            <Link href="/blog" className="text-muted transition-colors hover:text-ink">
              {t('blog')}
            </Link>
            {links.map((link) => (
              <Link
                key={link.slug}
                href={`/${link.slug}`}
                className="text-muted transition-colors hover:text-ink"
              >
                {link.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-line pt-5 text-xs leading-relaxed text-muted">
          <p>{t('disclaimer')}</p>
          <p className="mt-2">
            {t('copyright', { year: new Date().getFullYear(), name: site.siteName })}
            {site.contactEmail ? ` · ${site.contactEmail}` : ''}
          </p>
        </div>
      </div>
    </footer>
  );
}
