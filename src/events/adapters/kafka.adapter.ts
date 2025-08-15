import { Observable } from "rxjs";
import { EventEnvelope } from "../../infra/events/event.types";
import { kafkaPublish } from "../../infra/mq/kafka";
import { logger } from "../../core/logger";

export function kafkaSource(): Observable<EventEnvelope<unknown>> {
  // We'll bridge from your existing kafkaConsume in index.ts
  // so this file only provides a helper publisher.
  return new Observable(subscriber => {
    // no-op source by default; you can wire it in index.ts if you want
    subscriber.complete();
  });
}

export async function kafkaSink(envelope: EventEnvelope) {
  try {
    await kafkaPublish(envelope);
  } catch (err) {
    logger.error({ err, ch: envelope.channel }, "Kafka publish failed");
  }
}
