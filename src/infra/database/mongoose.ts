import mongoose from "mongoose";
import { Env } from "@config/env";
import { logger } from "@core/logger";

export async function connectMongo() {
  if (!Env.mongoUri) return;
  await mongoose.connect(Env.mongoUri);
  logger.info("Mongo connected");
}
export async function disconnectMongo() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info("Mongo disconnected");
  }
}
