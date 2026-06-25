import { z } from "zod";

/**
 * Register
 */
export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username cannot exceed 30 characters."),

  email: z.string().trim().email("Invalid email address."),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    ),
});

/**
 * Login
 */
export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required."),

  password: z.string().min(1, "Password is required."),
});

/**
 * Forgot Password
 */
export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email address."),
});

/**
 * Reset Password
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required."),

  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password cannot exceed 100 characters."),
});
