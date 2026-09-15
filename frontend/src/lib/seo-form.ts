import type { SeoSettings, SeoSettingsInput } from './admin-api';

/**
 * The fields the SEO editor sends back, copied by name like every other
 * editor's form. The row the API returns also carries its id and when it was
 * saved, and the API refuses any field it does not accept, so a spread of the
 * row failed every save.
 */
export function toSeoForm(settings: SeoSettings): SeoSettingsInput {
  return {
    siteName: settings.siteName,
    siteUrl: settings.siteUrl,
    siteDescription: settings.siteDescription,
    defaultMetaTitle: settings.defaultMetaTitle,
    defaultMetaDescription: settings.defaultMetaDescription,
    defaultKeywords: settings.defaultKeywords,
    defaultOgImageUrl: settings.defaultOgImageUrl,
    robotsTxt: settings.robotsTxt,
    defaultRobotsMeta: settings.defaultRobotsMeta,
    blockIndexingOutsideProduction: settings.blockIndexingOutsideProduction,
    sitemapEnabled: settings.sitemapEnabled,
    googleSiteVerification: settings.googleSiteVerification,
    googleAnalyticsId: settings.googleAnalyticsId,
    googleTagManagerId: settings.googleTagManagerId,
    bingSiteVerification: settings.bingSiteVerification,
    twitterSite: settings.twitterSite,
    organisationName: settings.organisationName,
    organisationLogo: settings.organisationLogo,
    contactEmail: settings.contactEmail,
  };
}
