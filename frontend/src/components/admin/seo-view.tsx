'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { type SeoSettingsInput, fetchSeoSettings, updateSeoSettings } from '@/lib/admin-api';
import { toSeoForm } from '@/lib/seo-form';
import { useLoad } from '@/lib/use-load';

import { Button, Field, Input, Panel, Select, Textarea } from './ui';

/** Site-wide search engine settings. One row, edited in one place. */
export function SeoView() {
  const t = useTranslations('admin.seo');
  const errors = useTranslations('errors');

  const [form, setForm] = useState<SeoSettingsInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setForm(toSeoForm(await fetchSeoSettings()));
    } catch {
      setError(errors('generic'));
    }
  }, [errors]);

  useLoad(load);

  function set<K extends keyof SeoSettingsInput>(key: K, value: SeoSettingsInput[K]) {
    setSaved(false);
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function save() {
    if (!form) return;

    setSaving(true);
    setError(null);
    try {
      setForm(toSeoForm(await updateSeoSettings(form)));
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : errors('generic'));
    } finally {
      setSaving(false);
    }
  }

  if (!form) {
    return error ? (
      <p className="card-raised px-5 py-8 text-sm text-stop-deep">{error}</p>
    ) : (
      <div className="card-raised h-96 animate-pulse" />
    );
  }

  const text = (key: keyof SeoSettingsInput) => (form[key] as string | null) ?? '';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-900 tracking-tight">{t('title')}</h1>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-go-deep">{t('saved')}</span>}
          <Button type="button" disabled={saving} onClick={() => void save()}>
            {saving ? t('saving') : t('save')}
          </Button>
        </div>
      </div>

      {error && <p className="card-raised px-5 py-3 text-sm text-stop-deep">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={t('sectionIdentity')}>
          <div className="space-y-4 px-5 py-5">
            <Field label={t('siteName')}>
              <Input value={form.siteName} onChange={(e) => set('siteName', e.target.value)} />
            </Field>
            <Field label={t('siteUrl')} hint={t('siteUrlHint')}>
              <Input value={form.siteUrl} onChange={(e) => set('siteUrl', e.target.value)} />
            </Field>
            <Field label={t('siteDescription')}>
              <Textarea
                rows={3}
                value={form.siteDescription}
                onChange={(e) => set('siteDescription', e.target.value)}
              />
            </Field>
            <Field label={t('organisationName')}>
              <Input
                value={form.organisationName}
                onChange={(e) => set('organisationName', e.target.value)}
              />
            </Field>
            <Field label={t('contactEmail')} hint={t('contactEmailHint')}>
              <Input
                value={text('contactEmail')}
                onChange={(e) => set('contactEmail', e.target.value)}
              />
            </Field>
            <Field label={t('supportUrl')} hint={t('supportUrlHint')}>
              <Input
                value={text('supportUrl')}
                placeholder="https://buymeacoffee.com/academygeo"
                onChange={(e) => set('supportUrl', e.target.value.trim())}
              />
            </Field>
          </div>
        </Panel>

        <Panel title={t('sectionDefaults')}>
          <div className="space-y-4 px-5 py-5">
            <Field label={t('defaultMetaTitle')} hint={t('defaultMetaTitleHint')}>
              <Input
                value={form.defaultMetaTitle}
                onChange={(e) => set('defaultMetaTitle', e.target.value)}
              />
            </Field>
            <Field label={t('defaultMetaDescription')} hint={t('defaultMetaDescriptionHint')}>
              <Textarea
                rows={3}
                value={form.defaultMetaDescription}
                onChange={(e) => set('defaultMetaDescription', e.target.value)}
              />
            </Field>
            <Field label={t('defaultKeywords')}>
              <Input
                value={form.defaultKeywords}
                onChange={(e) => set('defaultKeywords', e.target.value)}
              />
            </Field>
            <Field label={t('defaultOgImage')} hint={t('defaultOgImageHint')}>
              <Input
                value={text('defaultOgImageUrl')}
                onChange={(e) => set('defaultOgImageUrl', e.target.value)}
              />
            </Field>
            <Field label={t('twitterSite')}>
              <Input
                value={text('twitterSite')}
                placeholder="@academygeo"
                onChange={(e) => set('twitterSite', e.target.value)}
              />
            </Field>
          </div>
        </Panel>

        <Panel title={t('sectionCrawling')}>
          <div className="space-y-4 px-5 py-5">
            <Field label={t('defaultRobots')} hint={t('defaultRobotsHint')}>
              <Select
                value={form.defaultRobotsMeta}
                onChange={(e) => set('defaultRobotsMeta', e.target.value)}
              >
                <option value="index,follow">{t('robotsIndex')}</option>
                <option value="noindex,follow">{t('robotsNoindex')}</option>
                <option value="noindex,nofollow">{t('robotsNone')}</option>
              </Select>
            </Field>

            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.blockIndexingOutsideProduction}
                onChange={(e) => set('blockIndexingOutsideProduction', e.target.checked)}
                className="mt-1 size-4 accent-[var(--color-go)]"
              />
              <span>
                <span className="block font-600">{t('blockOutsideProduction')}</span>
                <span className="block text-xs text-muted">{t('blockOutsideProductionHint')}</span>
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.sitemapEnabled}
                onChange={(e) => set('sitemapEnabled', e.target.checked)}
                className="mt-1 size-4 accent-[var(--color-go)]"
              />
              <span>
                <span className="block font-600">{t('sitemapEnabled')}</span>
                <span className="block text-xs text-muted">{t('sitemapEnabledHint')}</span>
              </span>
            </label>

            <Field label={t('robotsTxt')} hint={t('robotsTxtHint')}>
              <Textarea
                rows={8}
                className="font-mono text-xs"
                value={text('robotsTxt')}
                onChange={(e) => set('robotsTxt', e.target.value)}
              />
            </Field>
          </div>
        </Panel>

        <Panel title={t('sectionServices')}>
          <div className="space-y-4 px-5 py-5">
            <Field label={t('googleSiteVerification')} hint={t('googleSiteVerificationHint')}>
              <Input
                value={text('googleSiteVerification')}
                onChange={(e) => set('googleSiteVerification', e.target.value)}
              />
            </Field>
            <Field label={t('googleAnalyticsId')} hint={t('googleAnalyticsIdHint')}>
              <Input
                value={text('googleAnalyticsId')}
                placeholder="G-XXXXXXXXXX"
                onChange={(e) => set('googleAnalyticsId', e.target.value)}
              />
            </Field>
            <Field label={t('googleTagManagerId')} hint={t('googleTagManagerIdHint')}>
              <Input
                value={text('googleTagManagerId')}
                placeholder="GTM-XXXXXXX"
                onChange={(e) => set('googleTagManagerId', e.target.value)}
              />
            </Field>
            <Field label={t('bingSiteVerification')}>
              <Input
                value={text('bingSiteVerification')}
                onChange={(e) => set('bingSiteVerification', e.target.value)}
              />
            </Field>
          </div>
        </Panel>
      </div>
    </div>
  );
}
