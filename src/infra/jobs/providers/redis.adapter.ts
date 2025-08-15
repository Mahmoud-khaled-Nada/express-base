import { IQueueAdapter } from "../queue.js";
import { JobEnvelope, JobOptions } from "../types.js";
import { Queue, Worker, JobsOptions, QueueEvents } from "bullmq";
import Redis from "ioredis";
import { listJobs, getJob } from "../registry.js";
import { logger } from "../../../core/logger.js";

export class RedisAdapter implements IQueueAdapter {
  private conn = new Redis(process.env.REDIS_URL!);
  private queue = new Queue<JobEnvelope>(process.env.JOB_REDIS_PREFIX || "jobs", { connection: this.conn });
  private worker: Worker<JobEnvelope> | null = null;
  private events = new QueueEvents(process.env.JOB_REDIS_PREFIX || "jobs", { connection: this.conn });

  async enqueue<T>(env: JobEnvelope<T>, opts: JobOptions) {
    const bullOpts: JobsOptions = {
      delay: opts.delayMs,
      attempts: env.attempts,
      backoff: mapBackoff(env.backoff),
      priority: opts.priority,
      jobId: env.idempotencyKey // dedupe
    };
    await this.queue.add(env.name, env, bullOpts);
  }

  async startWorker() {
    const concurrency = parseInt(process.env.JOB_CONCURRENCY || "10");
    this.worker = new Worker<JobEnvelope>(this.queue.name, async (job) => {
      const handler = getJob(job.name);
      await handler.handle(job.data.data); // pass inner payload
    }, { connection: this.conn, concurrency });

    this.worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err }, "Job failed"));
    this.worker.on("completed", (job) => logger.info({ jobId: job.id, name: job.name }, "Job completed"));
  }

  async stopWorker() {
    await this.worker?.close();
    await this.events.close();
    await this.queue.close();
    await this.conn.quit();
  }
}

function mapBackoff(b?: any) {
  if (!b) return undefined;
  if (b.type === "fixed") return { type: "fixed", delay: b.delayMs };
  if (b.type === "exponential") return { type: "exponential", delay: b.baseMs };
  return undefined;
}
