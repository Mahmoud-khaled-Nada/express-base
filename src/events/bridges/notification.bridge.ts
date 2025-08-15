import { Channels, EventEnvelope } from "../../infra/events/event.types";
import { EventBus, subscribeWithRetry } from "../../infra/events/eventBus";
import { NotificationService } from "../../infra/notifications";
import { NotificationRepository } from "../../infra/notifications/database";

export function bridgeNotifications(repo: NotificationRepository) {
  const svc = new NotificationService(repo);

  // Whenever NOTIFY_SEND event arrives, actually send (email/sms) and store status
  subscribeWithRetry(EventBus.of(Channels.NOTIFY_SEND), async (e: EventEnvelope<{
    userId: string; channel: "email"|"sms"; subject?: string; message: string; to: string;
  }>) => {
    const { channel, to, subject, message, userId } = e.payload;
    if (channel === "email") {
      await svc.sendEmail(userId, to, subject ?? "[No subject]", message);
    } else {
      await svc.sendSms(userId, to, message);
    }
  });
}
