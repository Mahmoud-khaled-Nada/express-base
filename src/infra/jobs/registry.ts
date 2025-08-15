import { JobHandler } from "./types.js";

const handlers = new Map<string, JobHandler<any>>();

export function registerJob<T>(handler: JobHandler<T>) {
  if (handlers.has(handler.name)) throw new Error(`Job already registered: ${handler.name}`);
  handlers.set(handler.name, handler);
}

export function getJob(name: string) {
  const h = handlers.get(name);
  if (!h) throw new Error(`Unknown job: ${name}`);
  return h;
}

export function listJobs() {
  return Array.from(handlers.values());
}

export function clearJobs() {
  handlers.clear();
}