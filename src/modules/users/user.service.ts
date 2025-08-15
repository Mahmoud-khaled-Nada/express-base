import { prisma } from "../../infra/database/prisma.js";

export const UserService = {
  create: (data: { email: string; name: string }) =>
    prisma.user.create({ data }),
  list: () => prisma.user.findMany(),
};
