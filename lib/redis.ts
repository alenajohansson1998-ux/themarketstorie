import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(REDIS_URL);
  }
  return redis;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

// Key patterns
export const REDIS_KEYS = {
  symbolLatest: (symbol: string) => `symbol:latest:${symbol}`,
  marketListItems: (slug: string) => `marketlist:${slug}:items`,
};
