import amqplib, { Connection, Channel, ConsumeMessage } from "amqplib";
import { Env } from "../../config/env.js";
import { logger } from "../../core/logger.js";

let conn: Connection | null = null;
let ch: Channel | null = null;

export async function rabbitConnect() {
  if (!Env.rabbitUrl) return;
  conn = await amqplib.connect(Env.rabbitUrl!); // ✅ assign to outer variable
  ch = await conn.createChannel();
  await ch.assertQueue(Env.rabbitQueue, { durable: true });
  logger.info("RabbitMQ connected & queue asserted");
}

export async function rabbitPublish(msg: unknown) {
  if (!ch) return;
  ch.sendToQueue(
    Env.rabbitQueue,
    Buffer.from(JSON.stringify(msg)),
    { persistent: true }
  );
}

export async function rabbitConsume(handler: (m: any) => Promise<void>) {
  if (!ch) return;
  await ch.consume(Env.rabbitQueue, async (msg: ConsumeMessage | null) => {
    if (!msg) return;
    try {
      const data = JSON.parse(msg.content.toString());
      await handler(data);
      ch!.ack(msg);
    } catch (e) {
      logger.error({ e }, "Rabbit handler failed");
      ch!.nack(msg, false, false); // DLQ in real setups
    }
  });
}

export async function rabbitDisconnect() {
  if (ch) {
    await ch.close();
  }
  if (conn) {
    await conn?.close(); // ✅ now TypeScript knows conn is a Connection
  }
  ch = null;
  conn = null;
  logger.info("RabbitMQ disconnected");
}
