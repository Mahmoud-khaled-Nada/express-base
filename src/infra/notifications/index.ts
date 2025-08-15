import { EmailService } from "./email";
import { SmsService } from "./sms";
import { NotificationRepository } from "./database";

export class NotificationService {
  private emailService: EmailService;
  private smsService: SmsService;
  private repo: NotificationRepository;

  constructor(repo: NotificationRepository) {
    this.emailService = new EmailService();
    this.smsService = new SmsService();
    this.repo = repo;
  }

  async sendEmail(userId: string, to: string, subject: string, html: string) {
    const record = await this.repo.create({
      userId,
      channel: "email",
      subject,
      message: html,
    });

    try {
      await this.emailService.sendEmail(to, subject, html);
      record.status = "sent";
    } catch (err) {
      record.status = "failed";
    }
    await this.repo.create(record); // update in db
  }

  async sendSms(userId: string, to: string, message: string) {
    const record = await this.repo.create({
      userId,
      channel: "sms",
      message,
    });

    try {
      await this.smsService.sendSms(to, message);
      record.status = "sent";
    } catch (err) {
      record.status = "failed";
    }
    await this.repo.create(record); // update in db
  }
}



// 

// const repo = new NotificationRepository(Env.dbType as "sql" | "mongo", sqlDataSource);
// const notificationService = new NotificationService(repo);