import "dotenv/config";

const required = (name: string, value?: string) => {
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
};

export const Env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  role: (process.env.ROLE ?? "http") as "http" | "worker" | "both",
  port: Number(process.env.PORT ?? 3000),

  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  rateWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  rateMax: Number(process.env.RATE_LIMIT_MAX ?? 100),

  mongoUri: process.env.MONGO_URI,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,

  rabbitUrl: process.env.RABBITMQ_URL,
  rabbitQueue: process.env.RABBITMQ_QUEUE ?? "events",

  kafkaBrokers: (process.env.KAFKA_BROKERS ?? "").split(",").filter(Boolean),
  kafkaClientId: process.env.KAFKA_CLIENT_ID ?? "app",
  kafkaGroupId: process.env.KAFKA_GROUP_ID ?? "app-consumer",
  kafkaTopic: process.env.KAFKA_TOPIC ?? "events",
};

export const isProd = Env.nodeEnv === "production";
