export class NotificationRepository {
  constructor(private sqlDataSource: any) {}

  Notification = "notification_table";

  async create(data: {
    userId: string;
    channel: string;
    subject?: string;
    message: string;
    status?: string;
  }) {
    const repo = this.sqlDataSource!.getRepository(this.Notification);
    const notification = repo.create({
      user_id: data.userId,
      channel: data.channel,
      subject: data.subject,
      message: data.message,
      status: data.status || "pending",
    });
    return await repo.save(notification);
  }
}
