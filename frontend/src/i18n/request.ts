import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';

import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    // Practice days, streaks and the daily challenge are all counted in UTC,
    // so a date on screen has to be read in the same zone the score was.
    timeZone: 'UTC',
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
