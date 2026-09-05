import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 py-24 text-center">
      <span className="centre-line h-2.5 w-24 rounded-full" />
      <p className="mt-8 font-display text-7xl font-900 tracking-tight text-muted">404</p>
      <h1 className="mt-3 font-display text-2xl font-900 tracking-tight">{t('title')}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t('body')}</p>
      <Link href="/" className="btn btn-go mt-8">
        {t('home')}
      </Link>
    </div>
  );
}
