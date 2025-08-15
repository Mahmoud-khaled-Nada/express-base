import { z } from "zod";

export const CreateUser = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});
export type CreateUserInput = z.infer<typeof CreateUser>;

export const UpdateUser = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2).optional(),
});
export type UpdateUserInput = z.infer<typeof UpdateUser>;