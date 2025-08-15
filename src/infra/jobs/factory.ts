import { IQueueAdapter } from "./queue.js";
import { RedisAdapter } from "./providers/redis.adapter.js";
import { RabbitAdapter } from "./providers/rabbit.adapter.js";
import { KafkaAdapter } from "./providers/kafka.adapter.js";
import { SqsAdapter } from "./providers/sqs.adapter.js";
import { DbAdapter } from "./providers/db.adapter.js";

let instance: IQueueAdapter | null = null;

export async function createQueue(): Promise<IQueueAdapter> {
  if (instance) return instance;
  const backend = (process.env.JOB_BACKEND || "redis").toLowerCase();

  switch (backend) {
    case "redis":  instance = new RedisAdapter(); break;
    case "rabbit": instance = new RabbitAdapter(); break;
    case "kafka":  instance = new KafkaAdapter(); break;
    case "sqs":    instance = new SqsAdapter(); break;
    case "db":     instance = new DbAdapter(); break;
    default: throw new Error(`Unknown JOB_BACKEND: ${backend}`);
  }
  return instance!;
}
