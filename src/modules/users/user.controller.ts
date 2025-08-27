import { Request, Response, NextFunction } from "express";
import { Env } from "@/config/env";
import { User } from "./user.model";
import { createApiResponse } from "@/shared/util";
import { transformUserToResponse, USER_ROLES } from "./user.schema";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    // At this point, validation has already been done by middleware
    // The request body is guaranteed to be valid according to the schema
    const { email, password, name, title, photo, roles, registration_token } = req.body;

    console.log( req.body)

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      deleted: false,
    });

    if (existingUser) {
      return res.status(409).json(createApiResponse(false, "User with this email already exists"));
    }

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save hook
      title,
      photo,
      roles: roles || [USER_ROLES.USER],
      is_admin: roles[0].code == 1 ? true : false,
      deleted: false,
      suspended: false,
      registration_token,
      last_op: new Date(),
    });

    // Save user (password will be hashed automatically)
    await newUser.save();

    // Generate JWT token
    await newUser.generateToken();

    // Transform user data for response (removes password and sensitive fields)
    const userResponse = transformUserToResponse(newUser);

    return res.status(201).json(
      createApiResponse(true, "User registered successfully", {
        user: userResponse,
        token: newUser.token,
        expiresIn: Number(Env.tokenExpirationTimeInSeconds),
      })
    );
  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      return res.status(409).json(createApiResponse(false, `${field} already exists`));
    }

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json(createApiResponse(false, "Validation failed", null, errors));
    }

    // Handle other errors
    return res.status(500).json(createApiResponse(false, "Registration failed", null, [error.message]));
  }
}
