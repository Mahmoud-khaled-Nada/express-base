// src/infra/jobs/providers/db.mongo.model.ts
import { Schema, model } from "mongoose";
const JobSchema = new Schema({
  name: String,
  payload: Schema.Types.Mixed,
  status: { type: String, default: "queued" },
  runAt: { type: Date, default: Date.now },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 5 },
  idempotencyKey: { type: String, unique: true, sparse: true }
}, { timestamps: true });
export const JobDoc = model("JobQueue", JobSchema);
export type JobDoc = typeof JobDoc;