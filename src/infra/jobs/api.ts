import { JobEnvelope, JobOptions } from "./types.js";
import { createQueue } from "./factory.js";

const queue = await createQueue(); // singleton-ish; factory handles backend

export async function dispatch<T>(name: string, data: T, opts: JobOptions = {}) {
  const env: JobEnvelope<T> = {
    name,
    data,
    enqueuedAt: Date.now(),
    idempotencyKey: opts.idempotencyKey,
    attempts: opts.attempts ?? parseInt(process.env.JOB_DEFAULT_ATTEMPTS || "5"),
    attemptCount: 0,
    backoff: opts.backoff ?? { type: "fixed", delayMs: parseInt(process.env.JOB_DEFAULT_BACKOFF_MS || "2000") }
  };
  await queue.enqueue(env, opts);
}

// Worker bootstrap (run in ROLE=worker or both)
export async function runWorker() {
  await queue.startWorker();
}

export async function stopWorker() {
  await queue.stopWorker();
}
