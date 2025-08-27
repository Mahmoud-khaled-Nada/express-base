import { Router } from "express";
import { register } from "../observability/metrics";
import { Env } from "@/config/env";

export const health = Router();
health.get("/healthz", (_req, res) => res.json({ ok: true }));
health.get("/readyz", (_req, res) => res.json({ ok: true }));
health.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});
