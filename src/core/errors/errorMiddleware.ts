import { NextFunction, Request, Response } from "express";
import { AppError } from "./AppError.js";
import { logger } from "../logger.js";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(AppError.notFound("Route not found"));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const isAppErr = err instanceof AppError;
  const status = isAppErr ? err.statusCode : 500;
  const payload = {
    ok: false,
    code: isAppErr ? err.code : "ERR_INTERNAL",
    message: isAppErr ? err.message : "Internal Server Error"
  };
  if (!isAppErr) {
    logger.error({ err }, "Unhandled error");
  }
  res.status(status).json(payload);
}
