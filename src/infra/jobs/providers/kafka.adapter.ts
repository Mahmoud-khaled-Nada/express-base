import { IQueueAdapter } from "../queue.js";
import { JobEnvelope, JobOptions } from "../types.js";
import { kafkaPublish, kafkaConsume, kafkaConnect } from "../../mq/kafka.js";
import { getJob } from "../registry.js";

const TOPIC = process.env.JOB_KAFKA_TOPIC || "jobs";

export class KafkaAdapter implements IQueueAdapter {
  async enqueue<T>(env: JobEnvelope<T>, _opts: JobOptions) {
    await kafkaPublish({ kind: "job", topic: TOPIC, ...env });
  }

  async startWorker() {
    await kafkaConnect();
    await kafkaConsume(async (msg) => {
      if (msg?.kind !== "job" || !msg.name) return;
      const h = getJob(msg.name);
      await h.handle(msg.data);
    });
  }

  async stopWorker() { /* kafkaDisconnect handled globally */ }
}
