/**
 * authService.js
 * Matches EXACT backend endpoints, request payloads, and response shapes.
 * Based on: backend/src/routes/auth.routes.ts
 *
 * Base URL: /api/v1/auth  (server.ts: app.use("/api/v1/auth", authRoutes))
 */

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  throw new Error("VITE_API_URL is not configured");
}

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
    const err = new Error(data.message || "Request failed");
    err.statusCode = data.statusCode || res.status;
    err.error = data.error || "UnknownError";
    throw err;
  }

  return data;
}

/**
 * POST /api/v1/auth/register
 * Request: { email, username, password }
 * Success 201: { success: true, data: { id, email, username, role } }
 */
export async function register({ email, username, password }) {
  return apiFetch(`${AUTH_BASE}/register`, {
    method: "POST",
    body: JSON.stringify({ email, username, password }),
  });
}

/**
 * POST /api/v1/auth/login
 * Request: { username, password }
 * Success 200: { accessToken, user: { id, email, username, role } }
 * Cookie set: siem_refresh_token (httpOnly)
 */
export async function login({ username, password }) {
  return apiFetch(`${AUTH_BASE}/login`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

/**
 * POST /api/v1/auth/logout
 * No body — reads siem_refresh_token from httpOnly cookie.
 */
export async function logout() {
  return apiFetch(`${AUTH_BASE}/logout`, { method: "POST" });
}

/**
 * POST /api/v1/auth/refresh
 * No body — reads siem_refresh_token from httpOnly cookie.
 * Success 200: { accessToken }
 */
export async function refreshToken() {
  return apiFetch(`${AUTH_BASE}/refresh`, { method: "POST" });
}

/**
 * GET /api/v1/auth/me
 * Requires Authorization: Bearer <accessToken>
 * Success 200: { data: { id, email, role, organizationId, ...rest } }
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
 * Request: { email }
 * Success 200 (always — timing-safe):
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
 * Request: { token, newPassword }
 * Success 200: { message: "Password reset successful" }
 */
export async function resetPassword({ token, newPassword }) {
  return apiFetch(`${AUTH_BASE}/reset-password`, {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

/**
 * GET /api/v1/auth/verify-email?token=<token>
 * Success 200: { message: "Email verified successfully" }
 */
export async function verifyEmail(token) {
  return apiFetch(`${AUTH_BASE}/verify-email?token=${encodeURIComponent(token)}`);
}