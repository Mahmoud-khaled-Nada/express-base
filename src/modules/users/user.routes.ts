import { Router } from "express";
import { createUser, listUsers } from "./user.controller.js";

export const userRouter = Router();
userRouter.get("/", listUsers);
userRouter.post("/", createUser);
