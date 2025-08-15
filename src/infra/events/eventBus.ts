import { Subject, Observable, filter, map, merge, retry, tap } from "rxjs";

import { EventEnvelope, Channel, EventSchemas } from "./event.types.js";
import { logger } from "../../core/logger.js";
import { z } from 'zod';

class RxEventBus {
  private subject = new Subject<EventEnvelope>();

  emit<T extends Channel>(channel: T, payload: z.infer<typeof EventSchemas[T]>, meta?: Partial<EventEnvelope>) {
    // validate at the edge
    const schema = EventSchemas[channel];
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      logger.error({ channel, err: parsed.error.format() }, "Event validation failed");
      return;
    }
    const envelope: EventEnvelope = { channel, payload: parsed.data, ts: Date.now(), ...meta };
    this.subject.next(envelope);
  }

  // Stream all events
  stream(): Observable<EventEnvelope> {
    return this.subject.asObservable();
  }

  // Stream only one channel with type safety
  of<T extends Channel>(channel: T) {
    type P = z.infer<typeof EventSchemas[T]>;
    return this.subject.asObservable().pipe(
      filter(e => e.channel === channel),
      map(e => e as EventEnvelope<P>)
    );
  }
}

// Singleton
export const EventBus = new RxEventBus();

// Helper to wire multiple sources (adapters) into the bus
export function mergeSources(...sources: Observable<EventEnvelope<unknown>>[]) {
  const merged = merge(...sources);
  merged.subscribe({
    next: (e) => EventBus.emit(e.channel as any, e.payload as any, { id: e.id, ts: e.ts, key: e.key }),
    error: (err) => logger.error({ err }, "Event source error"),
  });
}

// Utility for subscribers with logging & retries
export function subscribeWithRetry<T>(
  obs: Observable<EventEnvelope<T>>,
  handler: (e: EventEnvelope<T>) => Promise<void> | void,
  attempts = 5
) {
  return obs.pipe(
    tap((e) => logger.debug({ ch: e.channel }, "Event received")),
    retry({ count: attempts, delay: 500 })
  ).subscribe({
    next: (e) => void handler(e),
    error: (err) => logger.error({ err }, "Event stream exhausted"),
  });
}
