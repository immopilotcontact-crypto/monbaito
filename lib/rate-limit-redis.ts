import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
const limiters = new Map<string, Ratelimit>();

function getRedis(): Redis | null {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

function getLimiter(requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;
  const key = `${requests}:${window}`;
  if (!limiters.has(key)) {
    limiters.set(
      key,
      new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(requests, window) })
    );
  }
  return limiters.get(key)!;
}

export async function checkRedisRateLimit(
  identifier: string,
  requests = 10,
  window: `${number} ${"s" | "m" | "h" | "d"}` = "1 m"
): Promise<{ allowed: boolean; remaining: number }> {
  const limiter = getLimiter(requests, window);
  if (!limiter) return { allowed: true, remaining: requests };
  const result = await limiter.limit(identifier);
  return { allowed: result.success, remaining: result.remaining };
}
