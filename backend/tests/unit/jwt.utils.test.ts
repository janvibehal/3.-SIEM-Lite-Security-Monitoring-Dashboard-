import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../src/utils/jwt.utils";

describe("JWT Utility Functions", () => {
  const payload = {
    id: "123",
    email: "test@example.com",
    role: "ADMIN",
    organizationId: "org-123",
  };

  beforeAll(() => {
    process.env.JWT_SECRET = "test-access-secret";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
  });

  describe("Access Token", () => {
    it("should generate an access token", () => {
      const token = signAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should verify a valid access token", () => {
      const token = signAccessToken(payload);

      const decoded = verifyAccessToken(token);

      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
      expect(decoded.organizationId).toBe(payload.organizationId);
    });

    it("should throw an error for an invalid access token", () => {
      expect(() => {
        verifyAccessToken("invalid.token.here");
      }).toThrow();
    });
  });

  describe("Refresh Token", () => {
    it("should generate a refresh token", () => {
      const token = signRefreshToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should verify a valid refresh token", () => {
      const token = signRefreshToken(payload);

      const decoded = verifyRefreshToken(token);

      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
      expect(decoded.organizationId).toBe(payload.organizationId);
    });

    it("should throw an error for an invalid refresh token", () => {
      expect(() => {
        verifyRefreshToken("invalid.token.here");
      }).toThrow();
    });
  });
});