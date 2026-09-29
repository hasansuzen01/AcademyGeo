import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ConfigService } from '@nestjs/config';
import type { RedisService } from '../redis/redis.service.js';
import { SupportersService } from './supporters.service.js';

const API = 'https://developers.buymeacoffee.com/api/v1/supporters';

function setup(token = 'secret') {
  const store = new Map<string, unknown>();
  const redis = {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    set: vi.fn(async (key: string, value: unknown) => void store.set(key, value)),
  } as unknown as RedisService;
  const config = { get: () => token } as unknown as ConfigService;

  return { service: new SupportersService(config, redis), store };
}

const page = (ids: number[], next: string | null) =>
  new Response(
    JSON.stringify({
      data: ids.map((id) => ({ support_id: id, supporter_name: `S${id}`, support_coffees: 1 })),
      next_page_url: next,
    }),
  );

describe('SupportersService', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('asks nothing of the API when no token is set', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);

    expect(await setup('').service.list()).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('reads every page and keeps the result', async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(page([1, 2], `${API}?page=2`))
      .mockResolvedValueOnce(page([3], null));
    vi.stubGlobal('fetch', fetch);
    const { service, store } = setup();

    const listed = service.list();
    await vi.runAllTimersAsync();
    vi.useRealTimers();

    expect((await listed).map((s) => s.id)).toEqual([1, 2, 3]);
    expect(fetch.mock.calls[0]?.[1]?.headers.Authorization).toBe('Bearer secret');
    expect(store.get('supporters:fresh')).toHaveLength(3);
  });

  // The token travels with every request, so a next page pointing anywhere
  // else is not followed.
  it('does not follow a next page on another host', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(page([1], 'https://evil.example/steal?page=2'));
    vi.stubGlobal('fetch', fetch);

    expect(await setup().service.list()).toHaveLength(1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('falls back to the last good list when the API refuses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 403 })));
    const { service, store } = setup();
    store.set('supporters:last-good', [{ id: 9 }]);

    expect(await service.list()).toEqual([{ id: 9 }]);
  });

  it('answers an empty list when the API refuses and nothing was kept', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 403 })));

    expect(await setup().service.list()).toEqual([]);
  });
});
