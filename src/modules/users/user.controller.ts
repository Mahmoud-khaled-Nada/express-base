import { Request, Response, NextFunction } from "express";
import { CreateUser } from "./user.schema.js";
import { UserService } from "./user.service.js";
import { AppError } from "../../core/errors/AppError.js";


// import { EventBus } from "../../infra/events/eventBus.js";
// import { Channels } from "../../infra/events/event.types.js";

// // ...after user creation:
// EventBus.emit(Channels.USER_CREATED, {
//   userId: user.id,
//   email: user.email,
//   name: user.name,
//   at: Date.now()
// });

// // Fire a notification event (the bridge will send email/SMS + store it)
// EventBus.emit(Channels.NOTIFY_SEND, {
//   userId: user.id,
//   channel: "email",
//   to: user.email,
//   subject: "Welcome!",
//   message: `<h1>Hi ${user.name}</h1><p>Welcome aboard.</p>`
// });



// import { dispatch } from "../infra/jobs/api.js";

// await dispatch("SendWelcomeEmail", { userId: user.id, email: user.email, name: user.name }, {
//   delayMs: 5000,
//   attempts: 8,
//   backoff: { type: "exponential", baseMs: 2000, factor: 2, maxMs: 60000 },
//   idempotencyKey: `welcome:${user.id}`
// });


// dispatch("SomeJob", data, { delayMs: 10_000 });

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = CreateUser.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest("Invalid user input", parsed.error.format());
    const user = await UserService.create(parsed.data);
    res.status(201).json({ ok: true, data: user });
  } catch (e) { next(e); }
}

export async function listUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await UserService.list();
    res.json({ ok: true, data: users });
  } catch (e) { next(e); }
}

export async function getUser(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await UserService.list();
    res.json({ ok: true, data: users });
  } catch (e) { next(e); }
}