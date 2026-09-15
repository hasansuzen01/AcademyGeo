import { Layers } from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/lib/cn';
import type { Collection } from '@/lib/decks-api';

/**
 * The picture at the top of a collection, with its name set over the road in
 * it. A collection with no photograph yet gets a painted centre line instead
 * of an empty grey box. Holds no hooks, so a server page and the client hub
 * can both draw it.
 */
export function CollectionCover({
  collection,
  name,
  count,
  sizes,
  className,
}: {
  collection: Collection;
  name: string;
  count: string;
  sizes: string;
  className?: string;
}) {
  return (
    <span className={cn('relative block aspect-[16/9] overflow-hidden bg-go-wash', className)}>
      {collection.cover ? (
        <Image
          src={collection.cover.url}
          alt=""
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="centre-line absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 opacity-70" />
          <Layers className="relative size-10 text-go-deep" />
        </span>
      )}

      <span
        className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent"
        aria-hidden
      />

      <span className="absolute top-3 right-3 rounded-full bg-paper/95 px-2.5 py-1 text-[0.6875rem] font-800 text-ink">
        {count}
      </span>

      <span className="absolute inset-x-4 bottom-3 font-display text-xl font-900 tracking-tight text-paper">
        {name}
      </span>
    </span>
  );
}
