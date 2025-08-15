import { notificationConfig } from "../../config/notification";
import twilio from "twilio";

export class SmsService {
  private client;

  constructor() {
    if (notificationConfig.sms.provider === "twilio") {
      this.client = twilio(
        notificationConfig.sms.twilioAccountSid,
        notificationConfig.sms.twilioAuthToken
      );
    }
  }

  async sendSms(to: string, message: string) {
    if (notificationConfig.sms.provider === "twilio") {
      await this.client.messages.create({
        body: message,
        from: notificationConfig.sms.from,
        to,
      });
    } else {
      throw new Error("SMS provider not implemented");
    }
  }
}
