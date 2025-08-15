import { JobEnvelope, JobOptions, JobHandler } from "./types.js";

export interface IQueueAdapter {
  enqueue<T>(env: JobEnvelope<T>, opts: JobOptions): Promise<void>;
  startWorker(): Promise<void>;
  stopWorker(): Promise<void>;
  // Adapters pull registry handlers themselves on start
}
