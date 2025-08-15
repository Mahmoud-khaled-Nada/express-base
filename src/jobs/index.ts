import { registerJob } from "../infra/jobs/registry.js";
import { SendWelcomeEmail } from "../infra/jobs/SendWelcomeEmail.job.js";
// import { SendSmsJob } from "./SendSms.job.js";

export function registerAllJobs() {
  registerJob(SendWelcomeEmail);
  // registerJob(SendSmsJob);
}
