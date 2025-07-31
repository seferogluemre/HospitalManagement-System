import { createClient, type RedisClientType } from 'redis';
import type { Primitive } from 'type-fest';

class NotConnectedError extends Error {
  constructor() {
    super('Redis client is not connected');
  }
}

class Cache {
  private readonly client?: RedisClientType;
  private isConnected = false;
  private readonly prefix: string = '';

  constructor() {
    if (!process.env.REDIS_URL) {
      console.warn('REDIS_URL is not set, cache will not be used');
      return;
    }

    this.prefix = process.env.APP_SLUG ? `${process.env.APP_SLUG}:` : '';

    this.client = createClient({
      url: process.env.REDIS_URL,
    });

    this.client.on('error', (err: Error) => console.error('Redis Client Error', err));
    this.client.on('connect', () => {
      this.isConnected = true;
    });
    this.client.on('end', () => {
      console.info('Redis Client Disconnected');
      this.isConnected = false;
    });
  }

  async initialize() {
    await this.connect();
  }

  private async connect() {
    if (!this.isConnected) {
      await this.client?.connect();
    }
  }

  private checkConnection() {
    if (!this.client || !this.isConnected) {
      throw new NotConnectedError();
    }
  }

  private getKeyWithPrefix(key: string): string {
    return `${this.prefix}${key}`;
  }

  async getPrimitive<T extends string>(key: T): Promise<Primitive> {
    const value = await this.get<Primitive>(key);
    return value;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      this.checkConnection();
      const value = await this.client?.get(this.getKeyWithPrefix(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      if (!(error instanceof NotConnectedError)) {
        console.error('Cache get error:', error);
      }
      return null;
    }
  }

  async set(key: string, value: unknown, ttl?: number) {
    try {
      this.checkConnection();
      const stringValue = JSON.stringify(value);
      const prefixedKey = this.getKeyWithPrefix(key);
      if (ttl) {
        await this.client!.setEx(prefixedKey, ttl, stringValue);
      } else {
        await this.client!.set(prefixedKey, stringValue);
      }
    } catch (error) {
      if (!(error instanceof NotConnectedError)) {
        console.error('Cache set error:', error);
      }
    }
  }

  private hasWildcardPattern(str: string): boolean {
    return /[*?[\]]/.test(str);
  }

  async del(keys: string | string[]): Promise<number> {
    try {
      this.checkConnection();

      const keyList = Array.isArray(keys) ? keys : [keys];
      let totalDeleted = 0;

      const directKeys = keyList.filter((key) => !this.hasWildcardPattern(key));
      const patterns = keyList.filter((key) => this.hasWildcardPattern(key));

      // Delete direct keys in batch
      if (directKeys.length > 0) {
        const prefixedKeys = directKeys.map((key) => this.getKeyWithPrefix(key));
        totalDeleted += await this.client!.del(prefixedKeys);
      }

      // Delete pattern-matched keys
      for (const pattern of patterns) {
        const matchedKeys = await this.client!.keys(this.getKeyWithPrefix(pattern));
        if (matchedKeys.length > 0) {
          await this.client!.del(matchedKeys);
          totalDeleted += matchedKeys.length;
        }
      }

      return totalDeleted;
    } catch (error) {
      if (!(error instanceof NotConnectedError)) {
        console.error('Cache del error:', error);
      }
      return 0;
    }
  }

  async keys(pattern: string) {
    try {
      this.checkConnection();
      return await this.client!.keys(this.getKeyWithPrefix(pattern));
    } catch (error) {
      if (!(error instanceof NotConnectedError)) {
        console.error('Cache keys error:', error);
      }
      return [];
    }
  }

  async flushAll() {
    try {
      this.checkConnection();

      if (this.prefix) {
        const pattern = `${this.prefix}*`;
        const keys = await this.client!.keys(pattern);

        if (keys.length > 0) {
          await this.client!.del(keys);
          console.info(
            `Redis cache flushed successfully: ${keys.length} keys with prefix '${this.prefix}' deleted`,
          );
        } else {
          console.info(`No Redis keys found with prefix '${this.prefix}'`);
        }
      } else {
        await this.client!.flushAll();
        console.info('Redis cache flushed successfully (entire database)');
      }
    } catch (error) {
      if (error instanceof NotConnectedError) {
        console.warn('Redis is not connected, cache flush skipped');
        return;
      } else {
        console.error('Cache flush error:', error);
        throw error;
      }
    }
  }
}

export const cache = new Cache();

// Initialize cache connection
cache.initialize().catch(console.error);
