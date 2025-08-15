import { z } from "zod";

// 1) Define event “channels” (topics/queues/subjects)
export const Channels = {
  USER_CREATED: "user.created",
  NOTIFY_SEND:  "notify.send",
  CHAT_MESSAGE: "chat.message",
} as const;
export type Channel = typeof Channels[keyof typeof Channels];

// 2) Schemas per event for runtime validation
export const UserCreatedSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  name: z.string(),
  at: z.number().int() // epoch ms
});
export type UserCreatedPayload = z.infer<typeof UserCreatedSchema>;

export const NotifySendSchema = z.object({
  userId: z.string(),
  channel: z.enum(["email","sms"]),
  subject: z.string().optional(),
  message: z.string(),
  to: z.string(),
});
export type NotifySendPayload = z.infer<typeof NotifySendSchema>;

export const ChatMessageSchema = z.object({
  room: z.string(),
  fromUserId: z.string(),
  text: z.string(),
  at: z.number().int()
});
export type ChatMessagePayload = z.infer<typeof ChatMessageSchema>;

// 3) Central registry to map channel -> schema
export const EventSchemas: Record<Channel, z.ZodTypeAny> = {
  [Channels.USER_CREATED]: UserCreatedSchema,
  [Channels.NOTIFY_SEND]: NotifySendSchema,
  [Channels.CHAT_MESSAGE]: ChatMessageSchema,
};

export type EventEnvelope<T = unknown> = {
  channel: Channel;
  payload: T;
  // tracing-friendly metadata
  id?: string;
  ts?: number;  // produced at
  key?: string; // partition key, optional
};
