'use client';

import { useLayoutEffect, useState } from 'react';

/**
 * Measures an element, returning the ref to attach and its current height.
 *
 * The answer bar is pinned to the bottom of the window, so the page has to
 * reserve room for it. A fixed guess was not enough: a long explanation makes
 * the bar taller and it covered the answer buttons.
 *
 * The ref is a callback rather than an object because attaching a ref object
 * does not re-render, so the measurement would never run for a bar that
 * appears after the first paint. The height comes from the observer, which
 * reports the starting size as soon as it begins watching.
 */
export function useElementHeight<T extends HTMLElement>(): [(node: T | null) => void, number] {
  const [element, setElement] = useState<T | null>(null);
  const [measured, setMeasured] = useState(0);

  useLayoutEffect(() => {
    if (!element) return;

    const observer = new ResizeObserver(() => {
      setMeasured(element.getBoundingClientRect().height);
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [element]);

  // Detached elements keep no height, and the last measurement is stale.
  return [setElement, element ? measured : 0];
}
