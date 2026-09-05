'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useSound } from '@/lib/sound';

/** Turns the game's noises off. Remembered in this browser. */
export function SoundToggle() {
  const t = useTranslations('nav');
  const { enabled, toggle } = useSound();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? t('soundOff') : t('soundOn')}
      title={enabled ? t('soundOff') : t('soundOn')}
      className="rounded-xl p-2 text-muted transition-colors hover:bg-canvas hover:text-ink"
    >
      {enabled ? (
        <Volume2 className="size-4" aria-hidden />
      ) : (
        <VolumeX className="size-4" aria-hidden />
      )}
    </button>
  );
}
