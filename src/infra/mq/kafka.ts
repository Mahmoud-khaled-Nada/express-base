import { Kafka, Consumer, Producer } from "kafkajs";
import { Env } from "../../config/env.js";
import { logger } from "../../core/logger.js";

let kafka: Kafka | null = null;
let producer: Producer | null = null;
let consumer: Consumer | null = null;

export async function kafkaConnect() {
  if (!Env.kafkaBrokers.length) return;
  kafka = new Kafka({ clientId: Env.kafkaClientId, brokers: Env.kafkaBrokers });
  producer = kafka.producer();
  consumer = kafka.consumer({ groupId: Env.kafkaGroupId });
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: Env.kafkaTopic, fromBeginning: false });
  logger.info("Kafka connected");
}

export async function kafkaPublish(msg: unknown) {
  if (!producer) return;
  await producer.send({ topic: Env.kafkaTopic, messages: [{ value: JSON.stringify(msg) }] });
}

export async function kafkaConsume(handler: (m: any) => Promise<void>) {
  if (!consumer) return;
  await consumer.run({
    eachMessage: async ({ message }) => {
      const raw = message.value?.toString();
      if (!raw) return;
      try { await handler(JSON.parse(raw)); } catch (e) { logger.error({ e }, "Kafka handler failed"); }
    }
  });
}

export async function kafkaDisconnect() {
  await producer?.disconnect();
  await consumer?.disconnect();
  producer = null; consumer = null; kafka = null;
  logger.info("Kafka disconnected");
}
