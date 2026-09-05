import Script from 'next/script';

import { fetchSiteSeo } from '@/lib/content-api';
import { toJsonLd } from '@/lib/json-ld';

/**
 * Measurement scripts and the site's own structured data.
 *
 * Nothing loads unless an id has been entered in the admin panel: an empty
 * field means the visitor's browser fetches nothing at all, rather than
 * fetching a tag that reports to nobody.
 */
export async function SearchEngineTags() {
  const site = await fetchSiteSeo();

  const organisation = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.organisationName,
    url: site.siteUrl,
    ...(site.organisationLogo ? { logo: site.organisationLogo } : {}),
    ...(site.siteDescription ? { description: site.siteDescription } : {}),
    ...(site.contactEmail ? { email: site.contactEmail } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(organisation) }}
      />

      {site.googleTagManagerId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${site.googleTagManagerId}');`}
        </Script>
      )}

      {site.googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${site.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${site.googleAnalyticsId}');`}
          </Script>
        </>
      )}
    </>
  );
}
