import { Observable } from "rxjs";
import { EventEnvelope } from "../../infra/events/event.types";
import { logger } from "../../core/logger";
import { rabbitPublish } from "../../infra/mq/rabbitmq";


export function rabbitSource(): Observable<EventEnvelope<unknown>> {
  return new Observable(subscriber => {
    // same pattern as kafkaSource; wire actual consume in index.ts if desired
    subscriber.complete();
  });
}

export async function rabbitSink(envelope: EventEnvelope) {
  try {
    await rabbitPublish(envelope);
  } catch (err) {
    logger.error({ err, ch: envelope.channel }, "Rabbit publish failed");
  }
}
