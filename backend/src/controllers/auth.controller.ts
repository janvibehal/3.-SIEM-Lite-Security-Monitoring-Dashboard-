import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("BODY:", req.body);

      const user = await this.authService.register(req.body);

      return res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);

      res.cookie("siem_refresh_token", result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
      });

      return res.status(200).json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authService.logout(req.cookies.siem_refresh_token);

      res.clearCookie("siem_refresh_token");

      return res.status(200).json({
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.cookies);
    console.log(req.cookies.siem_refresh_token);

    const token = req.cookies.siem_refresh_token;

    const result = await this.authService.refresh(token);

    res.cookie("siem_refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    return res.status(200).json({
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authService.forgotPassword(req.body.email);

      return res.status(200).json({
        message: "If this email is registered, you will receive a reset link.",
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authService.resetPassword(
        req.body.token,
        req.body.newPassword,
      );

      return res.status(200).json({
        message: "Password reset successful",
      });
    } catch (error) {
      next(error);
    }
  };

  logoutAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authService.logoutAll(req.user.id);

      res.clearCookie("siem_refresh_token");

      return res.status(200).json({
        message: "Logged out from all devices",
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.query.token as string;

      await this.authService.verifyEmail(token);

      return res.status(200).json({
        message: "Email verified successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(200).json({
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  };
}
