import { Env } from "./config/env.js";
import { logger } from "./core/logger.js";
import { startHttp, stopHttp } from "./server.js";
import { connectMongo, disconnectMongo } from "./infra/database/mongoose.js";
import { connectPrisma, disconnectPrisma, prisma } from "./infra/database/prisma.js";
import { redis, disconnectRedis } from "./infra/database/redis.js";
import { kafkaConnect, kafkaDisconnect, kafkaConsume } from "./infra/mq/kafka.js";
import { rabbitConnect, rabbitDisconnect, rabbitConsume } from "./infra/mq/rabbitmq.js";
import { bridgeSocketIO } from "./events/bridges/socket.bridge.js";
import { bridgeNotifications } from "./events/bridges/notification.bridge.js";
import { NotificationRepository } from "./infra/notifications/database.js";
import { EventEnvelope } from "./infra/events/event.types.js";
import { EventBus } from "./infra/events/eventBus.js";
import { runWorker, stopWorker } from "./infra/jobs/api.js";
import { registerAllJobs } from "./index.js";






let httpServer: ReturnType<typeof startHttp> | null = null;

async function start() {
  // databases
  await connectPrisma();
  await connectMongo();

  // redis
  if (redis) redis.on("connect", () => logger.info("Redis connected"));

  // events
  bridgeSocketIO();
  bridgeNotifications(
    new NotificationRepository(
      process.env.DB_TYPE === "mongo" ? "mongo" : "sql",
    )
  );

  // await kafkaConnect();
  // await rabbitConnect();

  // Bridge incoming Kafka messages into EventBus
  await kafkaConsume(async (msg) => {
    // Expecting messages shaped like EventEnvelope
    const e = msg as EventEnvelope;
    if (!e?.channel || !e?.payload) return;
    EventBus.emit(e.channel as any, e.payload as any, { id: e.id, ts: e.ts, key: e.key });
  });

  // Bridge incoming Rabbit messages into EventBus
  await rabbitConsume(async (msg) => {
    const e = msg as EventEnvelope;
    if (!e?.channel || !e?.payload) return;
    EventBus.emit(e.channel as any, e.payload as any, { id: e.id, ts: e.ts, key: e.key });
  });

  // Register consumers (microservice mode)
  if (Env.role === "worker" || Env.role === "both") {
    await kafkaConsume(async (msg) => {
      logger.info({ msg }, "Kafka message");
      // handle...
    });
    await rabbitConsume(async (msg) => {
      logger.info({ msg }, "Rabbit message");
      // handle...
    });

    await runWorker();
  }


    // Register all job handlers before starting any workers
  registerAllJobs();

  // Start HTTP if needed
  if (Env.role === "http" || Env.role === "both") {
    httpServer = startHttp();
  }
}

async function stop() {
  // Stop HTTP if needed
  //stopHttp(); // ws

  httpServer?.close();
  await rabbitDisconnect();
  await kafkaDisconnect();
  await disconnectRedis();
  await disconnectMongo();
  await disconnectPrisma();
   await stopWorker();
  logger.info("Graceful shutdown complete");
}

process.on("SIGINT", () => stop().finally(() => process.exit(0)));
process.on("SIGTERM", () => stop().finally(() => process.exit(0)));

start().catch((e) => {
  logger.error({ e }, "Startup failed");
  process.exit(1);
});

logger.info("Startup complete");
