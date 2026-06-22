import { AccessTokenPayload }
  from "../utils/jwt.utils";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}