import crypto from "crypto";

import { UserRepository } from "../repositories/user.repository";
import { RefreshTokenRepository } from "../repositories/refreshToken.repository";
import { PasswordResetRepository } from "../repositories/passwordReset.repository";

import { hashPassword, comparePassword } from "../utils/password.utils";

import { signAccessToken, signRefreshToken } from "../utils/jwt.utils";

import { generateOrganizationId } from "../utils/organization.utils";

import { verifyRefreshToken } from "../utils/jwt.utils";

import { EmailVerificationRepository } from "../repositories/emailVerification.repository";

import { sendVerificationEmail } from "./email.service";

import { sendPasswordResetEmail } from "./email.service";

import { AuditService } from "./audit.service";

import {
  ConflictError,
  UnauthorizedError,
  LockedError,
  NotFoundError,
} from "../common/errors";

import {
  MAX_LOGIN_ATTEMPTS,
  LOCK_DURATION_MINUTES,
  DUMMY_BCRYPT_HASH,
} from "../constants/auth.constants";

//Class Skeleton
export class AuthService {
  constructor(
    private userRepository = new UserRepository(),
    private refreshTokenRepository = new RefreshTokenRepository(),
    private passwordResetRepository = new PasswordResetRepository(),
    private emailVerificationRepository = new EmailVerificationRepository(),
    private auditService = new AuditService(),
  ) {}

  //Method 1: generateTokenPair()
  private async generateTokenPair(user: {
    id: string;
    email: string;
    role: string;
    organizationId: string;
  }) {
    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    const refreshToken = signRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  //Method 2: checkAccountLockout()
  // 5 failed attempts
  // lock account
  // return 423 Locked

  private checkAccountLockout(user: { lockUntil: Date | null }) {
    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new LockedError("Account is temporarily locked");
    }
  }

  //Method 3: incrementFailedAttempts()
  private async incrementFailedAttempts(user: {
    id: string;
    loginAttempts: number;
  }) {
    const attempts = user.loginAttempts + 1;

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      const lockUntil = new Date();

      lockUntil.setMinutes(lockUntil.getMinutes() + LOCK_DURATION_MINUTES);

      await this.userRepository.update(user.id, {
        loginAttempts: attempts,
        lockUntil,
      });

      return;
    }

    await this.userRepository.update(user.id, {
      loginAttempts: attempts,
    });
  }

  //Method 4: register()
  async register(data: { email: string; username: string; password: string }) {
    //debug logs do not use in production

    // console.log("REGISTER DATA:", data);
    // console.log("USER REPO:", this.userRepository);

    const existingEmail = await this.userRepository.findByEmail(data.email);

    if (existingEmail) {
      throw new ConflictError("Email already exists");
    }

    const existingUsername = await this.userRepository.findByUsername(
      data.username,
    );

    if (existingUsername) {
      throw new ConflictError("Username already exists");
    }

    const passwordHash = await hashPassword(data.password);

    const user = await this.userRepository.create({
      email: data.email,
      username: data.username,
      passwordHash,
      organizationId: generateOrganizationId(),
    });

    

    // Send verification email after user creation
    await this.sendEmailVerification(user.id);
    
    // Log user registration event
    // In a real application, you might want to include more details like IP address, user agent, etc.
    await this.auditService.log({
      userId: user.id,
      action: "USER_REGISTERED",
      
    });

    // Return only necessary user info to avoid exposing sensitive data
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  //Method 5: login()
  async login(data: { username: string; password: string }) {
    const user = await this.userRepository.findByUsername(data.username);

    if (!user) {
      await comparePassword(data.password, DUMMY_BCRYPT_HASH);

      throw new UnauthorizedError("Invalid credentials");
    }

    this.checkAccountLockout(user);

    const validPassword = await comparePassword(
      data.password,
      user.passwordHash,
    );

    if (!validPassword) {
      await this.incrementFailedAttempts(user);

      // Log failed login attempt
      // In a real application, you might want to include more details like IP address, user agent, etc.
      await this.auditService.log({
        userId: user.id,
        action: "LOGIN_FAILED",
      
      });

      throw new UnauthorizedError("Invalid credentials");
    }

    await this.userRepository.update(user.id, {
      loginAttempts: 0,
      lockUntil: null,
      lastLogin: new Date(),
    });

    await this.auditService.log({
      userId: user.id,
      action: "LOGIN_SUCCESS",
    });

    const tokens = await this.generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    const refreshHash = await hashPassword(tokens.refreshToken);

    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: refreshHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  //Method 6: RefreshToken()
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token required");
    }

    const payload = verifyRefreshToken(refreshToken);

    const storedTokens = await this.refreshTokenRepository.findByUserId(
      payload.id,
    );

    let matchedToken = null;

    for (const tokenRecord of storedTokens) {
      const matches = await comparePassword(
        refreshToken,
        tokenRecord.tokenHash,
      );

      if (matches) {
        matchedToken = tokenRecord;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (matchedToken.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token expired");
    }

    await this.refreshTokenRepository.revoke(matchedToken.id);

    const user = await this.userRepository.findById(payload.id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const tokens = await this.generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    const refreshHash = await hashPassword(tokens.refreshToken);

    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: refreshHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await this.auditService.log({
      userId: user.id,
      action: "TOKEN_REFRESHED",
    });

    return tokens;
  }

  //Method 7: logout()
  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token required");
    }

    const payload = verifyRefreshToken(refreshToken);

    const storedTokens = await this.refreshTokenRepository.findByUserId(
      payload.id,
    );

    let matchedToken = null;

    for (const tokenRecord of storedTokens) {
      const matches = await comparePassword(
        refreshToken,
        tokenRecord.tokenHash,
      );

      if (matches) {
        matchedToken = tokenRecord;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    await this.refreshTokenRepository.revoke(matchedToken.id);

    await this.auditService.log({
      userId: payload.id,
      action: "LOGOUT",
    });

    return {
      success: true,
    };
  }

  async logoutAll(userId: string) {
    await this.refreshTokenRepository.revokeAll(userId);

    await this.auditService.log({
      userId,
      action: "LOGOUT_ALL",
    });

    return {
      success: true,
    };
  }

  //Method 8: sendEmailVerification()
  //This Method is used to send an email verification token to the user's email address.
  // It first checks if the user exists and if their email is already verified.
  // If not, it generates a random token, hashes it, and stores it in the database with an expiration time.
  // Finally, it sends the verification email to the user.
  async sendEmailVerification(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.emailVerified) {
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = await hashPassword(token);

    await this.emailVerificationRepository.create({
      tokenId:token,
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await sendVerificationEmail(user.email, token);
  }
  //Method 9: verifyEmail()
  //This Method is used to verify the email of the user. It checks if the provided token is valid and not expired, marks it as used, and updates the user's email verification status.
  // If the token is invalid or expired, it throws an UnauthorizedError.
  async verifyEmail(token: string) {
    if (!token) {
      throw new UnauthorizedError("Verification token required");
    }

    const verificationTokens =
      await this.emailVerificationRepository.findUnusedTokens();

    for (const verificationToken of verificationTokens) {
      const matches = await comparePassword(token, verificationToken.tokenHash);

      if (!matches) {
        continue;
      }

      if (verificationToken.expiresAt < new Date()) {
        throw new UnauthorizedError("Verification token expired");
      }

      await this.emailVerificationRepository.markUsed(verificationToken.id);

      await this.userRepository.verifyEmail(verificationToken.userId);

      await this.auditService.log({
        userId: verificationToken.userId,
        action: "EMAIL_VERIFIED",
      });

      return {
        success: true,
      };
    }

    throw new UnauthorizedError("Invalid verification token");
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = await hashPassword(token);

    await this.passwordResetRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    await sendPasswordResetEmail(user.email, token);
  }

  async resetPassword(token: string, newPassword: string) {
    const resetTokens = await this.passwordResetRepository.findUnusedTokens();

    for (const resetToken of resetTokens) {
      const matches = await comparePassword(token, resetToken.tokenHash);

      if (!matches) {
        continue;
      }

      if (resetToken.expiresAt < new Date()) {
        throw new UnauthorizedError("Reset token expired");
      }

      const passwordHash = await hashPassword(newPassword);

      await this.userRepository.update(resetToken.userId, {
        passwordHash,
      });

      await this.passwordResetRepository.markUsed(resetToken.id);

      await this.refreshTokenRepository.revokeAll(resetToken.userId);

      await this.auditService.log({
        userId: resetToken.userId,
        action: "PASSWORD_RESET",
      });

      return;
    }

    throw new UnauthorizedError("Invalid reset token");
  }
}
