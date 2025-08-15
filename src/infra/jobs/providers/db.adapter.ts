// src/infra/jobs/providers/db.adapter.ts
import { IQueueAdapter } from "../queue.js";
import { JobEnvelope, JobOptions } from "../types.js";
import { getJob } from "../registry.js";
import { prisma } from "../../database/prisma.js";
import { JobDoc } from "./db.mongo.model.js";

const isMongo = (process.env.DB_TYPE || "sql") === "mongo";

export class DbAdapter implements IQueueAdapter {
  private running = false;

  async enqueue<T>(env: JobEnvelope<T>, opts: JobOptions) {
    const runAt = new Date(Date.now() + (opts.delayMs ?? 0));
    if (isMongo) {
      await JobDoc.create({
        name: env.name,
        payload: env.data,
        runAt,
        maxAttempts: env.attempts,
        idempotencyKey: env.idempotencyKey
      });
    } else {
      await prisma.jobQueue.create({
        data: {
          name: env.name,
          payload: env.data as any,
          runAt,
          maxAttempts: env.attempts ?? 5,
          idempotencyKey: env.idempotencyKey ?? null
        }
      });
    }
  }

  async startWorker() {
    this.running = true;
    void this.loop();
  }

  async stopWorker() { this.running = false; }

  private async loop() {
    while (this.running) {
      if (isMongo) {
        const job = await JobDoc.findOneAndUpdate(
          { status: "queued", runAt: { $lte: new Date() } },
          { $set: { status: "running" }, $inc: { attempts: 1 } },
          { sort: { runAt: 1 }, new: true }
        );
        if (job) await this.process(job._id.toString(), job.name, job.payload, job.attempts, job.maxAttempts);
      } else {
        const job = await prisma.$transaction(async (tx: any) => {
          const j = await tx.jobQueue.findFirst({
            where: { status: "queued", runAt: { lte: new Date() } },
            orderBy: { runAt: "asc" }
          });
          if (!j) return null;
          await tx.jobQueue.update({ where: { id: j.id }, data: { status: "running", attempts: { increment: 1 } } });
          return j;
        });
        if (job) await this.process(job.id, job.name, job.payload, job.attempts, job.maxAttempts);
      }
      // small poll delay to avoid hot loop
      await new Promise(r => setTimeout(r, 250));
    }
  }

  private async process(id: string, name: string, payload: any, attempts: number, maxAttempts: number) {
    try {
      const h = getJob(name);
      await h.handle(payload);
      if (isMongo) await JobDoc.findByIdAndUpdate(id, { status: "done" });
      else await prisma.jobQueue.update({ where: { id }, data: { status: "done" } });
    } catch (e) {
      const again = attempts < maxAttempts;
      if (isMongo) {
        await JobDoc.findByIdAndUpdate(id, {
          status: again ? "queued" : "failed",
          runAt: new Date(Date.now() + computeBackoff(attempts))
        });
      } else {
        await prisma.jobQueue.update({
          where: { id },
          data: {
            status: again ? "queued" : "failed",
            runAt: new Date(Date.now() + computeBackoff(attempts))
          }
        });
      }
    }
  }
}

function computeBackoff(attempt: number) {
  // exponential: 2^attempt * 1000 (capped)
  const ms = Math.min(60_000, Math.pow(2, Math.max(1, attempt)) * 1000);
  return ms;
}
