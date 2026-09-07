import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';

import { LandingDemo } from '@/components/landing-demo';
import { Link } from '@/i18n/navigation';
import { fetchCatalogueSummary, fetchShowcase } from '@/lib/server-api';

/** The scored modes, in the order the hub lists them. */
const MODES = ['DAILY', 'RUSH', 'SURVIVAL', 'DRILL'] as const;

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, games, summary, showcase] = await Promise.all([
    getTranslations('landing'),
    getTranslations('games'),
    fetchCatalogueSummary(),
    fetchShowcase(),
  ]);

  const steps = [
    { title: t('steps.oneTitle'), body: t('steps.oneBody') },
    { title: t('steps.twoTitle'), body: t('steps.twoBody') },
    { title: t('steps.threeTitle'), body: t('steps.threeBody') },
  ];

  const stats = [
    { value: summary.countries, label: t('statCountries') },
    { value: summary.clueTypes, label: t('statClues') },
    { value: summary.cards, label: t('statCards') },
  ];

  return (
    <>
      <section className="page-shell grid gap-12 px-5 pt-14 pb-16 lg:grid-cols-[1.05fr_auto] lg:items-center lg:pt-20">
        <div className="rise-in">
          <span className="inline-flex items-center rounded-full bg-paint/25 px-3 py-1 text-xs font-900 tracking-wide text-paint-deep uppercase">
            {t('eyebrow')}
          </span>

          <h1 className="mt-5 max-w-2xl font-display text-4xl leading-[1.05] font-900 tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {t('title')} <span className="text-go-deep">{t('titleAccent')}</span>
          </h1>

          <p className="mt-5 max-w-lg leading-relaxed text-muted">{t('lede')}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/play" className="btn btn-go px-7 py-3.5 text-base">
              {t('primaryCta')}
            </Link>
            <a href="#how" className="btn btn-quiet px-7 py-3.5 text-base">
              {t('secondaryCta')}
            </a>
          </div>

          <dl className="mt-10 flex gap-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-3xl font-900 tabular-nums">{stat.value}</dd>
                <p className="text-xs font-800 tracking-wide text-muted uppercase">{stat.label}</p>
              </div>
            ))}
          </dl>
        </div>

        <div className="rise-in flex justify-center lg:justify-end" style={{ animationDelay: '120ms' }}>
          <LandingDemo />
        </div>
      </section>

      <section id="how" className="border-y-2 border-line bg-paper py-16">
        <div className="page-shell px-5">
          <h2 className="font-display text-3xl font-900 tracking-tight">{t('howTitle')}</h2>

          {/* The three steps sit on a painted centre line: the order matters, and
              the line is the same device the session progress bar uses. */}
          <div className="relative mt-12">
            <div
              className="centre-line absolute top-4 right-0 left-0 hidden h-2 rounded-full opacity-50 md:block"
              aria-hidden
            />
            <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map((step, position) => (
                <li key={step.title} className="relative md:pt-16">
                  <span
                    aria-hidden
                    className="absolute top-0 left-0 hidden size-10 items-center justify-center rounded-full border-4 border-paint bg-paper font-display text-sm font-900 md:flex"
                  >
                    {position + 1}
                  </span>
                  <h3 className="font-display text-xl font-900 tracking-tight">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="page-shell px-5 py-16">
        <h2 className="font-display text-3xl font-900 tracking-tight">{t('catalogueTitle')}</h2>
        <p className="mt-3 max-w-xl leading-relaxed text-muted">{t('catalogueBody')}</p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {showcase.map((card) => (
            <div key={card.id} className="card relative aspect-[8/5] overflow-hidden bg-paper">
              <Image
                src={card.imageUrl}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 240px"
                className="object-contain p-2"
              />
            </div>
          ))}
        </div>

        <Link href="/atlas" className="btn btn-quiet mt-8">
          {t('atlasCta')}
        </Link>
      </section>

      <section className="border-t-2 border-line bg-paper py-16">
        <div className="page-shell px-5">
          <h2 className="font-display text-3xl font-900 tracking-tight">{t('modesTitle')}</h2>
          <p className="mt-3 max-w-xl leading-relaxed text-muted">{t('modesBody')}</p>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODES.map((mode) => (
              <li key={mode} className="card card-lift px-4 py-4">
                <p className="eyebrow">{games(`modes.${mode}.rule`)}</p>
                <h3 className="mt-1 font-display text-lg font-900 tracking-tight">
                  {games(`modes.${mode}.name`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {games(`modes.${mode}.blurb`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t-2 border-line bg-paper py-10">
        <div className="page-shell flex items-center gap-4 px-5">
          <span className="centre-line h-2 w-14 rounded-full" />
          <p className="text-sm font-700 text-muted">{t('footer')}</p>
        </div>
      </footer>
    </>
  );
}
