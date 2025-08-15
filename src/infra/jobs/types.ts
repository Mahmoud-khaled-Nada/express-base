export type Backoff =
  | { type: "fixed"; delayMs: number }
  | { type: "exponential"; baseMs: number; factor?: number; maxMs?: number };

export type JobOptions = {
  delayMs?: number;           // enqueue delay
  attempts?: number;          // total tries including first
  backoff?: Backoff;          // retry strategy
  priority?: number;          // adapter-specific (BullMQ)
  idempotencyKey?: string;    // de-dupe within a window
};

export type JobEnvelope<T = unknown> = {
  name: string;           // job name (registry key)
  data: T;                // payload
  enqueuedAt: number;     // epoch ms
  idempotencyKey?: string;
  attempts?: number;      // remaining attempts (decrement on retry)
  attemptCount?: number;  // how many times tried so far
  backoff?: Backoff;
};

export interface JobHandler<T = any> {
  name: string;
  concurrency?: number;
  // return void OR throw to retry
  handle(data: T): Promise<void> | void;
}

export interface JobRegistry {
  [name: string]: JobHandler;
}