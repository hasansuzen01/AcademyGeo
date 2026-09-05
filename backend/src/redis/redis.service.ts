import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

/**
 * Thin cache wrapper. Every read degrades to a miss when Redis is unavailable,
 * so a Redis outage slows the dashboard down instead of taking it offline.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(config: ConfigService) {
    this.client = new Redis(config.getOrThrow<string>('REDIS_URL'), {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
    });
    this.client.on('error', (error: Error) => this.logger.warn(`Redis: ${error.message}`));
    void this.client.connect().catch(() => undefined);
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // Cache writes are best effort.
    }
  }

  async invalidate(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch {
      // Cache writes are best effort.
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit().catch(() => undefined);
  }
}
