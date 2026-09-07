'use client';

import { Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { uploadImage } from '@/lib/admin-api';

import { Button, Input } from './ui';

interface ImageFieldProps {
  value: string;
  prefix: 'metas' | 'decks' | 'avatars';
  storageReady: boolean;
  onChange: (next: { url: string; key: string | null }) => void;
}

/**
 * Picture for a card. The file goes straight to R2 with a presigned URL; the
 * path box stays editable so the generated illustrations can still be used.
 */
export function ImageField({ value, prefix, storageReady, onChange }: ImageFieldProps) {
  const t = useTranslations('admin.image');
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(file: File | undefined) {
    if (!file) return;

    setBusy(true);
    setError(null);
    try {
      const uploaded = await uploadImage(file, prefix);
      onChange({ url: uploaded.url, key: uploaded.key });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('failed'));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        <span className="relative block h-24 w-36 shrink-0 overflow-hidden rounded-lg border border-line bg-canvas">
          {value ? (
            <Image src={value} alt="" fill sizes="144px" className="object-contain" unoptimized />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-muted">
              {t('none')}
            </span>
          )}
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <Input
            value={value}
            placeholder="/metas/tr-plate.svg"
            onChange={(event) => onChange({ url: event.target.value, key: null })}
          />
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={input}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="hidden"
              onChange={(event) => void pick(event.target.files?.[0])}
            />
            <Button
              type="button"
              variant="ghost"
              disabled={busy || !storageReady}
              onClick={() => input.current?.click()}
            >
              <Upload className="size-3.5" aria-hidden />
              {busy ? t('uploading') : t('upload')}
            </Button>
            <span className="text-xs text-muted">
              {storageReady ? t('hint') : t('storageMissing')}
            </span>
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-stop-deep">{error}</p>}
    </div>
  );
}
