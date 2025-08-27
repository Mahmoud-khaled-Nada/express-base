import express from "express";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { Env } from "../config/env";

export const createHttp = () => {
  const app = express();
  // app.set("trust proxy", true);
   app.set('trust proxy', false);
  app.use(helmet());
  app.use(cors({ origin: Env.corsOrigin, credentials: true }));
  app.use(hpp());
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(rateLimit({ windowMs: Env.rateWindowMs, max: Env.rateMax }));
  app.use(morgan("tiny"));
  return app;
};
