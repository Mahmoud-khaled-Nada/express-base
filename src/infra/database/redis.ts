import Redis from "ioredis";
import { Env } from "../../config/env.js";
import { logger } from "../../core/logger.js";

export const redis = Env.redisUrl ? new Redis(Env.redisUrl) : null;

export async function disconnectRedis() {
  if (redis) {
    await redis.quit();
    logger.info("Redis disconnected");
  }
}
