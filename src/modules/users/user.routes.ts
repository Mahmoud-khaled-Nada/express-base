import { Router } from "express";
import { customRateLimit } from "@/middlewares/rate-limit";
import { register } from "./user.controller";
import { validateRequest } from "@/core/validator";
import { registerRequestSchema } from "./user.schema";
// import {
//   register,
//   login,
//   logout,
//   refreshToken,
//   getProfile,
//   updateProfile,
//   changePassword,
//   getUsers,
//   getUserById,
//   updateUser,
//   deleteUser,
//   validateRegister,
//   validateLogin,
//   validateUpdateUser,
//   validateChangePassword,
//   validateUserQuery,
// } from "./user-controllers";

const router = Router();

// -------------------
// Authentication Middleware
// -------------------

// Rate limiting for auth endpoints

const authRateLimit = customRateLimit(60 * 1000, 5, "Too many authentication attempts, try again later");
export const validateRegister = validateRequest(registerRequestSchema);
// export const validateLogin = validateRequest(loginRequestSchema);
// -------------------
// Public Routes (No Authentication Required)
// -------------------

// Authentication endpoints
router.post("/register", authRateLimit, validateRegister, register);
// router.post("/login", authRateLimit, validateLogin, login);

// -------------------
// Protected Routes (Authentication Required)
// -------------------

// User profile endpoints
// router.get('/profile', authenticateToken, getProfile);
// router.put('/profile', authenticateToken, validateUpdateUser, updateProfile);
// router.post('/change-password', authenticateToken, validateChangePassword, changePassword);
// router.post('/refresh-token', authenticateToken, refreshToken);
// router.post('/logout', authenticateToken, logout);

// -------------------
// Admin Routes (Admin Authentication Required)
// -------------------

// User management endpoints
// router.get('/users', authenticateToken, requireAdmin, generalRateLimit, validateUserQuery, getUsers);
// router.get('/users/:id', authenticateToken, getUserById);
// router.put('/users/:id', authenticateToken, requireAdmin, validateUpdateUser, updateUser);
// router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);

// -------------------
// Additional Utility Routes
// -------------------

// Check if email exists (for registration validation)
// router.post('/check-email', authRateLimit, async (req: Request, res: Response) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json(
//         createApiResponse(false, "Email is required")
//       );
//     }

//     const user = await User.findOne({ email: email.toLowerCase(), deleted: false });

//     return res.status(200).json(
//       createApiResponse(true, "Email check completed", {
//         exists: !!user,
//         available: !user
//       })
//     );

//   } catch (error: any) {
//     console.error("Check email error:", error);
//     return res.status(500).json(
//       createApiResponse(false, "Failed to check email", null, [error.message])
//     );
//   }
// });

// Get available roles (for admin use)
// router.get('/roles', authenticateToken, requireAdmin, (req: Request, res: Response) => {
//   const { USER_ROLES } = require('./user-types');

//   return res.status(200).json(
//     createApiResponse(true, "Roles retrieved successfully", Object.values(USER_ROLES))
//   );
// });

// User statistics (for admin dashboard)
// router.get('/stats', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
//   try {
//     const [
//       totalUsers,
//       activeUsers,
//       suspendedUsers,
//       adminUsers,
//       recentUsers
//     ] = await Promise.all([
//       User.countDocuments({ deleted: false }),
//       User.countDocuments({ deleted: false, suspended: false }),
//       User.countDocuments({ deleted: false, suspended: true }),
//       User.countDocuments({ deleted: false, is_admin: true }),
//       User.countDocuments({
//         deleted: false,
//         createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
//       })
//     ]);

//     const stats = {
//       totalUsers,
//       activeUsers,
//       suspendedUsers,
//       adminUsers,
//       recentUsers,
//       deletedUsers: await User.countDocuments({ deleted: true }),
//     };

//     return res.status(200).json(
//       createApiResponse(true, "User statistics retrieved successfully", stats)
//     );

//   } catch (error: any) {
//     console.error("Get stats error:", error);
//     return res.status(500).json(
//       createApiResponse(false, "Failed to retrieve statistics", null, [error.message])
//     );
//   }
// });

export default router;
