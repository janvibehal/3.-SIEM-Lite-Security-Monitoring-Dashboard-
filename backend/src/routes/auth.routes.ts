import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";

const router = Router();

const authService = new AuthService();
const authController = new AuthController(authService);

router.post("/register", validate(registerSchema), authController.register);

router.post("/login", validate(loginSchema), authController.login);

router.post("/logout", authController.logout);

router.post("/refresh", authController.refresh);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword
);
 // New route for logging out from all sessions
router.post(
  "/logout-all",
  authenticate, // Ensure the user is authenticated before allowing logout from all sessions
  authController.logoutAll,
);

router.get(
  "/verify-email",
  authController.verifyEmail,
);

router.get(
  "/me",
  authenticate, // Ensure the user is authenticated before accessing their profile
  authController.me,
);

export default router;