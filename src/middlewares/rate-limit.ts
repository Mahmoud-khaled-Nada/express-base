import rateLimit from "express-rate-limit";
import { createApiResponse } from "@/shared/util";

export const customRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs: windowMs,
    max: max,
    message: {
      success: false,
      message: message,
      timestamp: new Date(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json(createApiResponse(false, message));
    },
  });
};

// Too many authentication attempts, try again later
