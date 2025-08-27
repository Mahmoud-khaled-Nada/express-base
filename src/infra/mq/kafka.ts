import { Kafka, Consumer, Producer, EachMessagePayload } from "kafkajs";
import { Env } from "../../config/env";
import { logger } from "../../core/logger";

interface KafkaClient {
  kafka: Kafka | null;
  producer: Producer | null;
  consumer: Consumer | null;
  isConnected: boolean;
  isProducerConnected: boolean;
  isConsumerConnected: boolean;
}

class KafkaService {
  private client: KafkaClient = {
    kafka: null,
    producer: null,
    consumer: null,
    isConnected: false,
    isProducerConnected: false,
    isConsumerConnected: false
  };

  async connect(): Promise<void> {
    if (!Env.kafkaBrokers?.length) {
      logger.warn("Kafka brokers not configured");
      return;
    }

    if (this.client.isConnected) {
      logger.info("Kafka already connected");
      return;
    }

    try {
      this.client.kafka = new Kafka({
        clientId: Env.kafkaClientId,
        brokers: Env.kafkaBrokers,
        retry: {
          initialRetryTime: 100,
          retries: 8
        }
      });

      // Initialize producer
      this.client.producer = this.client.kafka.producer({
        maxInFlightRequests: 1,
        idempotent: true,
        transactionTimeout: 30000
      });

      // Initialize consumer
      this.client.consumer = this.client.kafka.consumer({
        groupId: Env.kafkaGroupId,
        sessionTimeout: 30000,
        heartbeatInterval: 3000
      });

      await Promise.all([
        this.connectProducer(),
        this.connectConsumer()
      ]);

      this.client.isConnected = true;
      logger.info("Kafka connected successfully");

    } catch (error) {
      logger.error({ error }, "Failed to connect to Kafka");
      await this.cleanup();
      throw error;
    }
  }

  private async connectProducer(): Promise<void> {
    if (!this.client.producer) return;

    try {
      await this.client.producer.connect();
      this.client.isProducerConnected = true;
      logger.debug("Kafka producer connected");

      // Handle producer events
      this.client.producer.on("producer.connect", () => {
        logger.debug("Producer connected");
        this.client.isProducerConnected = true;
      });

      this.client.producer.on("producer.disconnect", () => {
        logger.warn("Producer disconnected");
        this.client.isProducerConnected = false;
      });

      this.client.producer.on("producer.network.request_timeout", (payload) => {
        logger.error({ payload }, "Producer network timeout");
      });

    } catch (error) {
      logger.error({ error }, "Failed to connect producer");
      throw error;
    }
  }

  private async connectConsumer(): Promise<void> {
    if (!this.client.consumer) return;

    try {
      await this.client.consumer.connect();
      await this.client.consumer.subscribe({
        topic: Env.kafkaTopic,
        fromBeginning: false
      });

      this.client.isConsumerConnected = true;
      logger.debug("Kafka consumer connected and subscribed");

      // Handle consumer events
      this.client.consumer.on("consumer.connect", () => {
        logger.debug("Consumer connected");
        this.client.isConsumerConnected = true;
      });

      this.client.consumer.on("consumer.disconnect", () => {
        logger.warn("Consumer disconnected");
        this.client.isConsumerConnected = false;
      });

      this.client.consumer.on("consumer.crash", ({ error }) => {
        logger.error({ error }, "Consumer crashed");
        this.client.isConsumerConnected = false;
      });

    } catch (error) {
      logger.error({ error }, "Failed to connect consumer");
      throw error;
    }
  }

  async publish(message: unknown, options?: { key?: string; partition?: number }): Promise<boolean> {
    if (!this.isProducerReady()) {
      logger.error("Kafka producer not connected - cannot publish");
      return false;
    }

    try {
      const result = await this.client.producer!.send({
        topic: Env.kafkaTopic,
        messages: [{
          key: options?.key,
          value: JSON.stringify(message),
          partition: options?.partition,
          timestamp: Date.now().toString()
        }]
      });

      logger.debug({ result }, "Message published successfully");
      return true;

    } catch (error) {
      logger.error({ error, message }, "Failed to publish message");
      return false;
    }
  }

  async consume(handler: (data: any, metadata?: MessageMetadata) => Promise<void>): Promise<void> {
    if (!this.isConsumerReady()) {
      logger.error("Kafka consumer not connected - cannot start consuming");
      return;
    }

    try {
      await this.client.consumer!.run({
        eachMessage: async ({ topic, partition, message, heartbeat }: EachMessagePayload) => {
          const messageValue = message.value?.toString();
          if (!messageValue) {
            logger.warn("Received empty message");
            return;
          }

          try {
            const data = JSON.parse(messageValue);
            const metadata: MessageMetadata = {
              topic,
              partition,
              offset: message.offset,
              timestamp: message.timestamp,
              key: message.key?.toString()
            };

            await handler(data, metadata);
            
            // Call heartbeat to keep the consumer alive during long processing
            await heartbeat();
            
            logger.debug({ topic, partition, offset: message.offset }, "Message processed successfully");

          } catch (error) {
            logger.error({ 
              error, 
              topic, 
              partition, 
              offset: message.offset,
              messageValue: messageValue.substring(0, 100) + "..." 
            }, "Message handler failed");
            
            // In a real scenario, you might want to send failed messages to a DLQ
            // For now, we just continue processing
          }
        }
      });

      logger.info("Kafka consumer started");

    } catch (error) {
      logger.error({ error }, "Failed to start consuming");
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    logger.info("Disconnecting Kafka...");
    await this.cleanup();
  }

  private async cleanup(): Promise<void> {
    const disconnectPromises = [];

    if (this.client.producer && this.client.isProducerConnected) {
      disconnectPromises.push(
        this.client.producer.disconnect().catch((error) => 
          logger.error({ error }, "Error disconnecting producer")
        )
      );
    }

    if (this.client.consumer && this.client.isConsumerConnected) {
      disconnectPromises.push(
        this.client.consumer.disconnect().catch((error) => 
          logger.error({ error }, "Error disconnecting consumer")
        )
      );
    }

    await Promise.allSettled(disconnectPromises);

    this.client.producer = null;
    this.client.consumer = null;
    this.client.kafka = null;
    this.client.isConnected = false;
    this.client.isProducerConnected = false;
    this.client.isConsumerConnected = false;

    logger.info("Kafka disconnected");
  }

  private isProducerReady(): boolean {
    return this.client.isConnected && 
           this.client.isProducerConnected && 
           this.client.producer !== null;
  }

  private isConsumerReady(): boolean {
    return this.client.isConnected && 
           this.client.isConsumerConnected && 
           this.client.consumer !== null;
  }

  get connected(): boolean {
    return this.client.isConnected;
  }

  get producerConnected(): boolean {
    return this.client.isProducerConnected;
  }

  get consumerConnected(): boolean {
    return this.client.isConsumerConnected;
  }
}

interface MessageMetadata {
  topic: string;
  partition: number;
  offset: string;
  timestamp: string | null;
  key?: string;
}

// Singleton instance
const kafkaService = new KafkaService();

// Export functions for backward compatibility
export const kafkaConnect = () => kafkaService.connect();
export const kafkaPublish = (msg: unknown, options?: { key?: string; partition?: number }) => 
  kafkaService.publish(msg, options);
export const kafkaConsume = (handler: (data: any, metadata?: MessageMetadata) => Promise<void>) => 
  kafkaService.consume(handler);
export const kafkaDisconnect = () => kafkaService.disconnect();

// Export the service instance and types for advanced usage
export { kafkaService, MessageMetadata };
export default kafkaService;