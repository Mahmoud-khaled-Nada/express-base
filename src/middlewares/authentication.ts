import { Router } from "express";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { Env } from "@/config/env";
import { createApiResponse } from "@/shared/util";
import { AuthenticatedRequest } from "@/modules/users/user.schema";
import { User } from "@/modules/users/user.model";

const router = Router();

// -------------------
// Authentication Middleware
// -------------------

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json(createApiResponse(false, "Access token is required"));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, Env.secret) as any;

    // Find user and verify token matches
    const user = await User.findById(decoded._id);

    if (!user || user.deleted || user.token !== token) {
      return res.status(401).json(createApiResponse(false, "Invalid or expired token"));
    }

    if (user.suspended) {
      return res.status(403).json(createApiResponse(false, "Account is suspended"));
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.error("Authentication error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json(createApiResponse(false, "Token has expired"));
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json(createApiResponse(false, "Invalid token"));
    }

    return res.status(500).json(createApiResponse(false, "Authentication failed"));
  }
};

// Optional authentication (won't fail if no token)
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(); // Continue without user
  }

  try {
    const decoded = jwt.verify(token, Env.secret) as any;
    const user = await User.findById(decoded._id);

    if (user && !user.deleted && !user.suspended && user.token === token) {
      req.user = user;
    }
  } catch (error) {
    // Silently fail for optional auth
    console.warn("Optional auth failed:", error);
  }

  next();
};

// Admin only middleware
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.is_admin) {
    return res.status(403).json(createApiResponse(false, "Admin privileges required"));
  }
  next();
};
