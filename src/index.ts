import { Env } from "@config/env";
import { logger } from "@core/logger";
import { startHttp } from "./server";
import { connectMongo, disconnectMongo } from "@infra/database/mongoose";
import { redis, disconnectRedis } from "@infra/database/redis";

let httpServer: ReturnType<typeof startHttp> | null = null;

async function start() {
  // databases
  await connectMongo();

  // redis
  if (redis) redis.on("connect", () => logger.info("Redis connected"));

  // Start HTTP if needed
  if (Env.role === "http" || Env.role === "both") {
    httpServer = startHttp();
  }
}

async function stop() {
  // Stop HTTP if needed
  //stopHttp(); // ws

  httpServer?.close();

  // databases
  await disconnectRedis();
  await disconnectMongo();
  logger.info("Graceful shutdown complete");
}

process.on("SIGINT", () => stop().finally(() => process.exit(0)));
process.on("SIGTERM", () => stop().finally(() => process.exit(0)));

start().catch((e) => {
  logger.error({ e }, "Startup failed");
  process.exit(1);
});

logger.info("Startup complete");
