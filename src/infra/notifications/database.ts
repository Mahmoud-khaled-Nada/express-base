// sql/Notification.ts
// import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

// @Entity("notifications")
// export class Notification {
//   @PrimaryGeneratedColumn("uuid")
//   id!: string;

//   @Column()
//   user_id!: string;

//   @Column()
//   channel!: string;

//   @Column({ nullable: true })
//   subject?: string;

//   @Column("text")
//   message!: string;

//   @Column({ default: "pending" })
//   status!: string;

//   @CreateDateColumn()
//   created_at!: Date;
// }

// =======================================================================

// src/models/mongo/notification.model.ts
// import mongoose, { Schema, Document } from "mongoose";

// export interface INotification extends Document {
//   userId: string;
//   channel: string;
//   subject?: string;
//   message: string;
//   status: string;
//   createdAt: Date;
// }

// const NotificationSchema = new Schema<INotification>({
//   userId: { type: String, required: true },
//   channel: { type: String, required: true },
//   subject: { type: String },
//   message: { type: String, required: true },
//   status: { type: String, default: "pending" },
//   createdAt: { type: Date, default: Date.now }
// });

// export const NotificationModel = mongoose.model<INotification>(
//   "Notification",
//   NotificationSchema
// );




import { Notification } from "../models/sql/Notification";
import { NotificationModel } from "../models/mongo/notification.model";
import { DataSource } from "typeorm";
import { notificationConfig } from "../config/notification";

export class NotificationRepository {
  constructor(private dbType: "sql" | "mongo", private sqlDataSource?: DataSource) {}

  async create(data: {
    userId: string;
    channel: string;
    subject?: string;
    message: string;
    status?: string;
  }) {
    if (this.dbType === "sql") {
      const repo = this.sqlDataSource!.getRepository(Notification);
      const notification = repo.create({
        user_id: data.userId,
        channel: data.channel,
        subject: data.subject,
        message: data.message,
        status: data.status || "pending",
      });
      return await repo.save(notification);
    } else {
      const notification = new NotificationModel({
        userId: data.userId,
        channel: data.channel,
        subject: data.subject,
        message: data.message,
        status: data.status || "pending",
      });
      return await notification.save();
    }
  }
}
