'use client';

import { Field, Input, Panel, Select, Textarea } from './ui';

/** The five search-engine fields every guide address carries. */
export interface SeoValues {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  robotsMeta: string;
}

/**
 * The search-engine panel, shared by the guide editors.
 *
 * Each editor keeps its own translation namespace, using the same key names,
 * so the labels stay editable per screen while the fields themselves are
 * written once.
 */
export function SeoFields<T extends SeoValues>({
  values,
  titlePlaceholder,
  t,
  onChange,
}: {
  values: T;
  /** Shown greyed in the title box: what the page is called if nothing is set. */
  titlePlaceholder: string;
  t: (key: string) => string;
  onChange: <K extends keyof SeoValues>(key: K, value: SeoValues[K]) => void;
}) {
  return (
    <Panel title={t('sectionSeo')}>
      <div className="space-y-4 px-5 py-5">
        <Field label={t('metaTitle')} hint={t('metaTitleHint')}>
          <Input
            value={values.metaTitle}
            placeholder={titlePlaceholder}
            onChange={(event) => onChange('metaTitle', event.target.value)}
          />
        </Field>
        <Field label={t('metaDescription')}>
          <Textarea
            rows={3}
            value={values.metaDescription}
            onChange={(event) => onChange('metaDescription', event.target.value)}
          />
        </Field>
        <Field label={t('keywords')}>
          <Input
            value={values.keywords}
            onChange={(event) => onChange('keywords', event.target.value)}
          />
        </Field>
        <Field label={t('canonical')}>
          <Input
            value={values.canonicalUrl}
            onChange={(event) => onChange('canonicalUrl', event.target.value)}
          />
        </Field>
        <Field label={t('robots')}>
          <Select
            value={values.robotsMeta}
            onChange={(event) => onChange('robotsMeta', event.target.value)}
          >
            <option value="index,follow">{t('robotsIndex')}</option>
            <option value="noindex,follow">{t('robotsNoindex')}</option>
            <option value="noindex,nofollow">{t('robotsNone')}</option>
          </Select>
        </Field>
      </div>
    </Panel>
  );
}
