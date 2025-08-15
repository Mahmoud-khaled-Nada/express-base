import { IQueueAdapter } from "../queue.js";
import { JobEnvelope, JobOptions } from "../types.js";
import { rabbitPublish, rabbitConsume, rabbitConnect } from "../../mq/rabbitmq.js";
import { getJob } from "../registry.js";

const QUEUE = process.env.JOB_RABBIT_QUEUE || "jobs";

export class RabbitAdapter implements IQueueAdapter {
  async enqueue<T>(env: JobEnvelope<T>, _opts: JobOptions) {
    await rabbitPublish({ kind: "job", queue: QUEUE, ...env });
  }

  async startWorker() {
    await rabbitConnect();
    await rabbitConsume(async (msg) => {
      if (msg?.kind !== "job" || msg.name == null) return;
      const h = getJob(msg.name);
      // naive retry/backoff: let broker requeue or implement DLQ strategy
      await h.handle(msg.data);
    });
  }

  async stopWorker() { /* rabbitDisconnect happens in your global stop */ }
}
