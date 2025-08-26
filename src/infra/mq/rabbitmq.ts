import amqplib, { Connection, Channel, ConsumeMessage } from "amqplib";
import { Env } from "../../config/env.js";
import { logger } from "../../core/logger.js";

interface RabbitMQClient {
  connection: Connection | null;
  channel: Channel | null;
  isConnected: boolean;
}

class RabbitMQ {
  private client: RabbitMQClient = {
    connection: null,
    channel: null,
    isConnected: false
  };

  async connect(): Promise<void> {
    if (!Env.rabbitUrl) {
      logger.warn("RabbitMQ URL not configured");
      return;
    }

    if (this.client.isConnected) {
      logger.info("RabbitMQ already connected");
      return;
    }

    try {
      this.client.connection = await amqplib.connect(Env.rabbitUrl);
      this.client.channel = await this.client.connection.createChannel();
      
      await this.client.channel.assertQueue(Env.rabbitQueue, { durable: true });
      
      this.client.isConnected = true;
      logger.info("RabbitMQ connected & queue asserted");

      // Handle connection events
      this.client.connection.on("error", (err) => {
        logger.error({ err }, "RabbitMQ connection error");
        this.client.isConnected = false;
      });

      this.client.connection.on("close", () => {
        logger.info("RabbitMQ connection closed");
        this.client.isConnected = false;
      });

    } catch (error) {
      logger.error({ error }, "Failed to connect to RabbitMQ");
      this.client.isConnected = false;
      throw error;
    }
  }

  async publish(message: unknown): Promise<boolean> {
    if (!this.isReady()) {
      logger.error("RabbitMQ not connected - cannot publish");
      return false;
    }

    try {
      const result = this.client.channel!.sendToQueue(
        Env.rabbitQueue,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );

      if (!result) {
        logger.warn("Message may not have been queued (channel buffer full)");
      }

      return result;
    } catch (error) {
      logger.error({ error }, "Failed to publish message");
      return false;
    }
  }

  async consume(handler: (data: any) => Promise<void>): Promise<void> {
    if (!this.isReady()) {
      logger.error("RabbitMQ not connected - cannot start consuming");
      return;
    }

    try {
      await this.client.channel!.consume(
        Env.rabbitQueue,
        async (msg: ConsumeMessage | null) => {
          if (!msg) return;

          try {
            const data = JSON.parse(msg.content.toString());
            await handler(data);
            this.client.channel!.ack(msg);
            logger.debug("Message processed successfully");
          } catch (error) {
            logger.error({ error }, "Message handler failed");
            // Reject and don't requeue - sends to DLQ if configured
            this.client.channel!.nack(msg, false, false);
          }
        },
        { noAck: false }
      );

      logger.info("RabbitMQ consumer started");
    } catch (error) {
      logger.error({ error }, "Failed to start consuming");
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client.channel) {
        await this.client.channel.close();
        this.client.channel = null;
      }

      if (this.client.connection) {
        await this.client.connection.close();
        this.client.connection = null;
      }

      this.client.isConnected = false;
      logger.info("RabbitMQ disconnected");
    } catch (error) {
      logger.error({ error }, "Error during RabbitMQ disconnect");
    }
  }

  private isReady(): boolean {
    return this.client.isConnected && 
           this.client.connection !== null && 
           this.client.channel !== null;
  }

  get connected(): boolean {
    return this.client.isConnected;
  }
}

// Singleton instance
const rabbitMQ = new RabbitMQ();

// Export functions for backward compatibility
export const rabbitConnect = () => rabbitMQ.connect();
export const rabbitPublish = (msg: unknown) => rabbitMQ.publish(msg);
export const rabbitConsume = (handler: (data: any) => Promise<void>) => rabbitMQ.consume(handler);
export const rabbitDisconnect = () => rabbitMQ.disconnect();

// Export the class instance for more advanced usage
export { rabbitMQ };
export default rabbitMQ;