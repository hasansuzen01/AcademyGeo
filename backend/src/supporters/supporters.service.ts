import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RedisService } from '../redis/redis.service.js';
import { type BmcSupport, type PublicSupporter, toPublicSupporters } from './supporters.js';

const API = 'https://developers.buymeacoffee.com/api/v1/supporters';
const FRESH_KEY = 'supporters:fresh';
const LAST_GOOD_KEY = 'supporters:last-good';
const FRESH_SECONDS = 15 * 60;
const LAST_GOOD_SECONDS = 30 * 24 * 60 * 60;
/** The API sends five supports a page and the size cannot be changed. */
const MAX_PAGES = 10;
const PAGE_GAP_MS = 1000;

interface BmcPage {
  data?: BmcSupport[];
  next_page_url?: string | null;
}

/**
 * The public supporters list, read from Buy Me a Coffee.
 *
 * The API is slow to page through and not ours to lean on, so a read is kept
 * for fifteen minutes, and a reader never waits for a refresh while an older
 * list is at hand: they get the older list and the refresh runs behind them.
 * With no token set, or with the API refusing, the list is simply empty.
 */
@Injectable()
export class SupportersService implements OnModuleInit {
  private readonly logger = new Logger(SupportersService.name);
  private refreshing: Promise<PublicSupporter[]> | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Says at start-up whether a token was found, never the token itself: an
   * empty list is otherwise the same whether nobody has given yet or the
   * token never reached the container.
   */
  onModuleInit() {
    this.logger.log(
      this.config.get<string>('BMC_TOKEN')
        ? 'Buy Me a Coffee token found, the supporters list is on'
        : 'No BMC_TOKEN set, the supporters list stays empty',
    );
  }

  async list(): Promise<PublicSupporter[]> {
    const token = this.config.get<string>('BMC_TOKEN');
    if (!token) return [];

    const fresh = await this.redis.get<PublicSupporter[]>(FRESH_KEY);
    if (fresh) return fresh;

    const lastGood = await this.redis.get<PublicSupporter[]>(LAST_GOOD_KEY);
    const refresh = this.refresh(token);

    return lastGood ?? refresh;
  }

  /** One refresh at a time, however many readers arrive while it runs. */
  private refresh(token: string): Promise<PublicSupporter[]> {
    this.refreshing ??= this.fetchAll(token)
      .then(async (supporters) => {
        await this.redis.set(FRESH_KEY, supporters, FRESH_SECONDS);
        await this.redis.set(LAST_GOOD_KEY, supporters, LAST_GOOD_SECONDS);
        this.logger.log(`Buy Me a Coffee: read ${supporters.length} public supporters`);
        return supporters;
      })
      .catch(async (error: unknown) => {
        this.logger.warn(`Buy Me a Coffee: ${error instanceof Error ? error.message : error}`);
        return (await this.redis.get<PublicSupporter[]>(LAST_GOOD_KEY)) ?? [];
      })
      .finally(() => {
        this.refreshing = null;
      });

    return this.refreshing;
  }

  private async fetchAll(token: string): Promise<PublicSupporter[]> {
    const rows: BmcSupport[] = [];
    let url: string | null = API;

    for (let page = 0; url && page < MAX_PAGES; page += 1) {
      if (page > 0) await new Promise((resolve) => setTimeout(resolve, PAGE_GAP_MS));

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          // The API sits behind a firewall that turns away clients that do not
          // look like a browser, with a 403 that reads like a bad token.
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
        },
        redirect: 'error',
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const body = (await response.json()) as BmcPage;
      rows.push(...(body.data ?? []));

      // The token goes with every page, so a next page is only followed on
      // the same address.
      const next: string | null = body.next_page_url ?? null;
      url = next?.startsWith(`${API}?`) ? next : null;
    }

    return toPublicSupporters(rows);
  }
}
