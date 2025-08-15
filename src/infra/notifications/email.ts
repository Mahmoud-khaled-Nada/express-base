import { notificationConfig } from "../../config/notification";
import sgMail from "@sendgrid/mail";

export class EmailService {
  constructor() {
    if (notificationConfig.email.provider === "sendgrid") {
      sgMail.setApiKey(notificationConfig.email.sendgridApiKey);
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (notificationConfig.email.provider === "sendgrid") {
      await sgMail.send({
        to,
        from: notificationConfig.email.from,
        subject,
        html,
      });
    } else {
      throw new Error("Email provider not implemented");
    }
  }
}
