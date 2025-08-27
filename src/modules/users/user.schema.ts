import { z } from "zod";
import { Request, Response } from "express";
import { IRole, IUser } from "./user.model";

// -------------------
// Validation Schemas
// -------------------

// Role validation
const roleSchema = z.object({
  code: z.number().int().positive("Role code must be a positive integer"),
  name: z.string().min(1, "Role name is required").max(50, "Role name too long"),
  const: z.string().min(1, "Role constant is required").max(20, "Role constant too long"),
});

// Registration request
export const registerRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").trim(),
  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase()
    .transform((val) => val.trim()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase, one lowercase, and one number"
    ),
  title: z.string().max(100, "Title too long").optional(),
  photo: z.string().url("Invalid photo URL").optional(),
  roles: z.array(roleSchema).min(1, "At least one role is required"),
  registration_token: z
    .object({
      token: z.string().optional(),
      platform: z.string().max(50, "Platform name too long").optional(),
    })
    .optional(),
});

// Login request
export const loginRequestSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

// Update user request
export const updateUserRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  email: z.string().email("Invalid email format").toLowerCase().optional(),
  title: z.string().max(100, "Title too long").optional(),
  photo: z.string().url("Invalid photo URL").optional(),
  roles: z.array(roleSchema).optional(),
  is_admin: z.boolean().optional(),
  suspended: z.boolean().optional(),
});

// Change password request
export const changePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(50, "New password too long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "New password must contain at least one uppercase, one lowercase, and one number"
      ),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Forgot password request
export const forgotPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase(),
});

// Reset password request
export const resetPasswordRequestSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password too long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase, one lowercase, and one number"
      ),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// User query/filter request
export const userQueryRequestSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((val) => val > 0)
    .optional()
    .default("1"),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((val) => val > 0 && val <= 100)
    .optional()
    .default("10"),
  search: z.string().max(100, "Search term too long").optional(),
  role: z.string().max(20, "Role filter too long").optional(),
  is_admin: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  suspended: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  deleted: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  sort_by: z.enum(["name", "email", "createdAt", "updatedAt", "last_op"]).optional().default("createdAt"),
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
});

// -------------------
// Request Types
// -------------------
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
export type UserQueryRequest = z.infer<typeof userQueryRequestSchema>;

// -------------------
// Response Types
// -------------------
export interface UserResponse {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  title?: string;
  roles: IRole[];
  is_admin: boolean;
  last_op?: Date;
  suspended: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Note: password and token are excluded for security
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
  expiresIn: number;
}

export interface UserListResponse {
  users: UserResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: {
    search?: string;
    role?: string;
    is_admin?: boolean;
    suspended?: boolean;
    deleted?: boolean;
  };
}

// -------------------
// Express Request Extensions
// -------------------
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// Specific request interfaces
export interface RegisterRequestBody extends Request {
  body: RegisterRequest;
}

export interface LoginRequestBody extends Request {
  body: LoginRequest;
}

export interface UpdateUserRequestBody extends AuthenticatedRequest {
  body: UpdateUserRequest;
}

export interface ChangePasswordRequestBody extends AuthenticatedRequest {
  body: ChangePasswordRequest;
}

export interface ForgotPasswordRequestBody extends Request {
  body: ForgotPasswordRequest;
}

export interface ResetPasswordRequestBody extends Request {
  body: ResetPasswordRequest;
}

// export interface UserQueryRequestQuery extends AuthenticatedRequest {
//   query: UserQueryRequest;
// }

// -------------------
// Utility Functions
// -------------------

// Transform user document to response format
export const transformUserToResponse = (user: IUser): UserResponse => {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    photo: user.photo,
    title: user.title,
    roles: user.roles,
    is_admin: user.is_admin,
    last_op: user.last_op,
    suspended: user.suspended,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

// Validation middleware factory

// -------------------
// Common Role Constants
// -------------------
export const USER_ROLES = {
  SUPER_ADMIN: { code: 1, name: "Super Admin", const: "SUPER_ADMIN" },
  ADMIN: { code: 2, name: "Admin", const: "ADMIN" },
  MODERATOR: { code: 3, name: "Moderator", const: "MODERATOR" },
  USER: { code: 4, name: "User", const: "USER" },
  GUEST: { code: 5, name: "Guest", const: "GUEST" },
} as const;

// Permission helper
export const hasRole = (user: IUser, roleConst: string): boolean => {
  return user.roles.some((role: IRole) => role.const === roleConst);
};

export const hasAnyRole = (user: IUser, roleConsts: string[]): boolean => {
  return user.roles.some((role: IRole) => roleConsts.includes(role.const));
};

export const isAdminOrOwner = (user: IUser, targetUserId: string): boolean => {
  return user.is_admin || user._id.toString() === targetUserId;
};
