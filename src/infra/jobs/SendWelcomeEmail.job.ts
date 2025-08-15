import { JobHandler } from "../infra/jobs/types.js";
import { NotificationService } from "../services/notifications/notification.service.js";
import { NotificationRepository } from "../infra/notifications/database.js";

type Payload = { userId: string; email: string; name: string };

export const SendWelcomeEmail: JobHandler<Payload> = {
  name: "SendWelcomeEmail",
  concurrency: 5,
  async handle({ userId, email, name }) {
    const repo = new NotificationRepository(process.env.DB_TYPE === "mongo" ? "mongo" : "sql");
    const svc = new NotificationService(repo);
    await svc.sendEmail(userId, email, `Welcome, ${name}!`, `<h1>Hello ${name}</h1>`);
  }
};