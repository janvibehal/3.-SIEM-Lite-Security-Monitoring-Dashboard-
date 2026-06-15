/**
 * authService.js
 * Matches EXACT backend endpoints, request payloads, and response shapes.
 * Based on: backend/src/routes/auth.routes.ts + controllers/auth.controller.ts + services/auth.service.ts
 *
 * Base URL: /api/v1/auth  (server.ts: app.use("/api/v1/auth", authRoutes))
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const AUTH_BASE = `${BASE_URL}/api/v1/auth`;

/**
 * Generic fetch wrapper that normalises error shapes from errorHandler.middleware.ts
 * Error shape: { success: false, error: string, message: string, statusCode: number }
 */
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include", // required for httpOnly siem_refresh_token cookie
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    // Use backend message directly — it is user-safe per error definitions
    const err = new Error(data.message || "Request failed");
    err.statusCode = data.statusCode || res.status;
    err.error = data.error || "UnknownError";
    throw err;
  }

  return data;
}

/**
 * POST /api/v1/auth/register
 *
 * Request body (auth.validator.ts — registerSchema):
 *   { email: string, username: string, password: string }
 *
 * Password rules (from Zod schema):
 *   min 8 chars, must have [A-Z], [a-z], [0-9], [special char]
 *
 * Success 201:
 *   { success: true, data: { id, email, username, role } }
 *
 * Error shapes (from auth.service.ts):
 *   409 ConflictError  → "Email already exists" | "Username already exists"
 */
export async function register({ email, username, password }) {
  return apiFetch(`${AUTH_BASE}/register`, {
    method: "POST",
    body: JSON.stringify({ email, username, password }),
  });
}

/**
 * POST /api/v1/auth/login
 *
 * Request body (auth.validator.ts — loginSchema):
 *   { username: string, password: string }
 *   NOTE: login uses USERNAME not email — confirmed in auth.service.ts line:
 *   "const user = await this.userRepository.findByUsername(data.username)"
 *
 * Success 200:
 *   { accessToken: string, user: { id, email, username, role } }
 *   Cookie set: siem_refresh_token (httpOnly, secure, sameSite: strict)
 *
 * Error shapes:
 *   401 UnauthorizedError → "Invalid credentials"
 *   423 LockedError       → "Account is temporarily locked"
 */
export async function login({ username, password }) {
  return apiFetch(`${AUTH_BASE}/login`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

/**
 * POST /api/v1/auth/logout
 *
 * No request body — reads siem_refresh_token from httpOnly cookie.
 *
 * Success 200:
 *   { message: "Logged out successfully" }
 */
export async function logout() {
  return apiFetch(`${AUTH_BASE}/logout`, { method: "POST" });
}

/**
 * POST /api/v1/auth/refresh
 *
 * No request body — reads siem_refresh_token from httpOnly cookie.
 *
 * Success 200:
 *   { accessToken: string }
 *   New siem_refresh_token cookie set.
 */
export async function refreshToken() {
  return apiFetch(`${AUTH_BASE}/refresh`, { method: "POST" });
}

/**
 * GET /api/v1/auth/me
 *
 * Requires Authorization: Bearer <accessToken> header.
 *
 * Success 200:
 *   { data: { id, email, role, organizationId } }   (from JWT payload in req.user)
 */
export async function getMe(accessToken) {
  return apiFetch(`${AUTH_BASE}/me`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/**
 * POST /api/v1/auth/forgot-password
 *
 * Request body:
 *   { email: string }
 *
 * Success 200 (always — timing-safe, never reveals if email exists):
 *   { message: "If this email is registered, you will receive a reset link." }
 */
export async function forgotPassword({ email }) {
  return apiFetch(`${AUTH_BASE}/forgot-password`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * POST /api/v1/auth/reset-password
 *
 * Request body (resetPasswordSchema — same password rules as register):
 *   { token: string, newPassword: string }
 *
 * Success 200:
 *   { message: "Password reset successful" }
 */
export async function resetPassword({ token, newPassword }) {
  return apiFetch(`${AUTH_BASE}/reset-password`, {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}
