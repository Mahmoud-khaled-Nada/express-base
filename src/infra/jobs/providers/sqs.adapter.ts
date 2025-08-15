import { IQueueAdapter } from "../queue.js";
import { JobEnvelope, JobOptions } from "../types.js";
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand, ChangeMessageVisibilityCommand } from "@aws-sdk/client-sqs";
import { getJob } from "../registry.js";

const QUEUE_URL = process.env.JOB_SQS_URL!;
const sqs = new SQSClient({ region: process.env.AWS_REGION });

export class SqsAdapter implements IQueueAdapter {
  private running = false;

  async enqueue<T>(env: JobEnvelope<T>, opts: JobOptions) {
    const DelaySeconds = Math.floor((opts.delayMs ?? 0) / 1000);
    await sqs.send(new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(env),
      MessageGroupId: "default", // for FIFO queues (remove for standard)
      MessageDeduplicationId: env.idempotencyKey, // FIFO only
      DelaySeconds
    }));
  }

  async startWorker() {
    this.running = true;
    void this.loop();
  }

  async stopWorker() {
    this.running = false;
  }

  private async loop() {
    while (this.running) {
      const res = await sqs.send(new ReceiveMessageCommand({
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
        VisibilityTimeout: 30
      }));
      if (!res.Messages?.length) continue;
      await Promise.all(res.Messages.map(async (m: any) => {
        if (!m.ReceiptHandle || !m.Body) return;
        const env = JSON.parse(m.Body) as JobEnvelope;
        try {
          const h = getJob(env.name);
          await h.handle(env.data);
          await sqs.send(new DeleteMessageCommand({ QueueUrl: QUEUE_URL, ReceiptHandle: m.ReceiptHandle }));
        } catch (e) {
          // simple retry by extending visibility; a real impl would track attempts
          await sqs.send(new ChangeMessageVisibilityCommand({
            QueueUrl: QUEUE_URL, ReceiptHandle: m.ReceiptHandle, VisibilityTimeout: 60
          }));
        }
      }));
    }
  }
}
