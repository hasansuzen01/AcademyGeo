'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { ImageField } from '@/components/admin/image-field';
import { Badge, Button, Field, Input, Panel } from '@/components/admin/ui';
import { SignInPrompt } from '@/components/sign-in-prompt';
import { Link } from '@/i18n/navigation';
import { type Profile, fetchProfile, updateProfile } from '@/lib/admin-api';
import { useSession } from '@/lib/auth-client';
import { useStorageReady } from '@/lib/use-storage-ready';

export function ProfileView() {
  const t = useTranslations('profile');
  const errors = useTranslations('errors');
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const storageReady = useStorageReady();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPending || !userId) return;

    fetchProfile()
      .then((data) => {
        setProfile(data);
        setName(data.name);
        setImage(data.image ?? '');
      })
      .catch(() => setError(errors('generic')));
  }, [errors, isPending, userId]);

  if (isPending) return null;
  if (!userId) return <SignInPrompt reason="progress" />;
  if (!profile) {
    return error ? (
      <p className="card-raised px-5 py-8 text-sm text-stop-deep">{error}</p>
    ) : (
      <div className="card-raised h-64 animate-pulse" />
    );
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await updateProfile({ name, image: image || undefined });
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : errors('generic'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Panel title={t('detailsTitle')}>
        <div className="space-y-5 px-5 py-5">
          <Field label={t('name')}>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </Field>

          <Field label={t('avatar')} hint={t('avatarHint')}>
            <ImageField
              value={image}
              prefix="avatars"
              storageReady={storageReady}
              onChange={({ url }) => setImage(url)}
            />
          </Field>

          <Field label={t('email')} hint={t('emailHint')}>
            <Input value={profile.email} disabled />
          </Field>

          {error && <p className="text-sm text-stop-deep">{error}</p>}
          {saved && <p className="text-sm text-go-deep">{t('saved')}</p>}

          <Button type="button" disabled={saving} onClick={() => void save()}>
            {saving ? t('saving') : t('save')}
          </Button>
        </div>
      </Panel>

      <div className="space-y-6">
        <Panel title={t('accountTitle')}>
          <dl className="space-y-3 px-5 py-5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">{t('role')}</dt>
              <dd>
                <Badge tone={profile.role === 'ADMIN' ? 'good' : 'neutral'}>
                  {profile.role === 'ADMIN' ? t('roleAdmin') : t('roleUser')}
                </Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">{t('joined')}</dt>
              <dd className="font-mono text-xs">
                {new Date(profile.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">{t('trackedCards')}</dt>
              <dd className="font-mono tabular-nums">{profile.trackedMetas}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">{t('answers')}</dt>
              <dd className="font-mono tabular-nums">{profile.totalAnswers}</dd>
            </div>
          </dl>

          {profile.role === 'ADMIN' && (
            <div className="border-t border-line px-5 py-4">
              <Link href="/admin" className="text-sm text-paint-deep hover:underline">
                {t('openAdmin')}
              </Link>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
