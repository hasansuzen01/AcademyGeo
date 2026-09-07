'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useRouter } from '@/i18n/navigation';
import {
  type ContentStatus,
  type PostInput,
  createAdminPost,
  deleteAdminPost,
  fetchAdminPost,
  updateAdminPost,
} from '@/lib/admin-api';
import { toSlug } from '@/lib/slug';
import { useStorageReady } from '@/lib/use-storage-ready';

import { ImageField } from './image-field';
import { RichTextEditor } from './rich-text-editor';
import { Button, Field, Input, Panel, Select, Textarea } from './ui';

const BLANK: PostInput = {
  locale: 'tr',
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  coverImageKey: '',
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  canonicalUrl: '',
  robotsMeta: 'index,follow',
  ogImageUrl: '',
  status: 'DRAFT',
};

export function PostEditor({ postId }: { postId?: string }) {
  const t = useTranslations('admin.postEditor');
  const router = useRouter();
  const storageReady = useStorageReady();

  const [form, setForm] = useState<PostInput>(BLANK);
  const [slugTouched, setSlugTouched] = useState(Boolean(postId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(postId));

  useEffect(() => {
    if (!postId) return;

    fetchAdminPost(postId)
      .then((post) => {
        setForm({
          locale: post.locale,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImageUrl: post.coverImageUrl ?? '',
          coverImageKey: post.coverImageKey ?? '',
          metaTitle: post.metaTitle ?? '',
          metaDescription: post.metaDescription ?? '',
          keywords: post.keywords,
          canonicalUrl: post.canonicalUrl ?? '',
          robotsMeta: post.robotsMeta,
          ogImageUrl: post.ogImageUrl ?? '',
          status: post.status,
        });
      })
      .catch(() => setError(t('loadFailed')))
      .finally(() => setLoading(false));
  }, [postId, t]);

  function set<K extends keyof PostInput>(key: K, value: PostInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  // Typing a title fills the address until the author edits it themselves.
  function setTitle(title: string) {
    setForm((current) => ({
      ...current,
      title,
      slug: slugTouched ? current.slug : toSlug(title),
    }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const saved = postId ? await updateAdminPost(postId, form) : await createAdminPost(form);
      router.push(`/admin/posts/${saved.id}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!postId || !window.confirm(t('confirmDelete'))) return;

    try {
      await deleteAdminPost(postId);
      router.push('/admin/posts');
    } catch {
      setError(t('saveFailed'));
    }
  }

  if (loading) return <div className="card-raised h-96 animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-900 tracking-tight">
          {postId ? t('editTitle') : t('createTitle')}
        </h1>
        <div className="flex gap-2">
          {postId && (
            <Button variant="danger" type="button" onClick={() => void remove()}>
              <Trash2 className="size-3.5" aria-hidden />
              {t('delete')}
            </Button>
          )}
          <Button type="button" disabled={saving} onClick={() => void save()}>
            {saving ? t('saving') : t('save')}
          </Button>
        </div>
      </div>

      {error && <p className="card-raised px-5 py-3 text-sm text-stop-deep">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <Panel title={t('sectionContent')}>
            <div className="space-y-4 px-5 py-5">
              <Field label={t('postTitle')}>
                <Input value={form.title} onChange={(event) => setTitle(event.target.value)} />
              </Field>
              <Field label={t('excerpt')} hint={t('excerptHint')}>
                <Textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(event) => set('excerpt', event.target.value)}
                />
              </Field>
            </div>
          </Panel>

          <RichTextEditor
            value={form.content}
            storageReady={storageReady}
            onChange={(html) => set('content', html)}
          />

          <Panel title={t('sectionSeo')}>
            <div className="space-y-4 px-5 py-5">
              <Field label={t('metaTitle')} hint={t('metaTitleHint')}>
                <Input
                  value={form.metaTitle}
                  placeholder={form.title}
                  onChange={(event) => set('metaTitle', event.target.value)}
                />
              </Field>
              <Field label={t('metaDescription')} hint={t('metaDescriptionHint')}>
                <Textarea
                  rows={3}
                  value={form.metaDescription}
                  onChange={(event) => set('metaDescription', event.target.value)}
                />
              </Field>
              <Field label={t('keywords')} hint={t('keywordsHint')}>
                <Input
                  value={form.keywords}
                  onChange={(event) => set('keywords', event.target.value)}
                />
              </Field>
              <Field label={t('canonical')} hint={t('canonicalHint')}>
                <Input
                  value={form.canonicalUrl}
                  onChange={(event) => set('canonicalUrl', event.target.value)}
                />
              </Field>
              <Field label={t('robots')} hint={t('robotsHint')}>
                <Select
                  value={form.robotsMeta}
                  onChange={(event) => set('robotsMeta', event.target.value)}
                >
                  <option value="index,follow">{t('robotsIndex')}</option>
                  <option value="noindex,follow">{t('robotsNoindex')}</option>
                  <option value="noindex,nofollow">{t('robotsNone')}</option>
                </Select>
              </Field>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title={t('sectionPublishing')}>
            <div className="space-y-4 px-5 py-5">
              <Field label={t('locale')} hint={t('localeHint')}>
                <Select value={form.locale} onChange={(event) => set('locale', event.target.value)}>
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </Select>
              </Field>
              <Field label={t('slug')} hint={t('slugHint')}>
                <Input
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    set('slug', event.target.value);
                  }}
                />
              </Field>
              <Field label={t('status')}>
                <Select
                  value={form.status}
                  onChange={(event) => set('status', event.target.value as ContentStatus)}
                >
                  <option value="DRAFT">{t('draft')}</option>
                  <option value="PUBLISHED">{t('published')}</option>
                </Select>
              </Field>
            </div>
          </Panel>

          <Panel title={t('sectionCover')}>
            <div className="px-5 py-5">
              <ImageField
                value={form.coverImageUrl}
                prefix="decks"
                storageReady={storageReady}
                onChange={({ url, key }) => {
                  set('coverImageUrl', url);
                  set('coverImageKey', key ?? '');
                }}
              />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
