/**
 * api.js
 * Central API client for all authenticated requests.
 * Mirrors the pattern in authService.js — apiFetch with credentials.
 * All endpoints match backend/server.ts route registrations.
 */

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  throw new Error("VITE_API_URL is not configured");
}

export const API = `${BASE_URL}/api/v1`;

/**
 * Authenticated fetch wrapper.
 * Pass accessToken from AuthContext for protected routes.
 */
export async function apiFetch(url, { token, ...options } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    credentials: "include",
    headers,
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

/* ── Dashboard ─────────────────────────────────────────────────────── */

export const dashboardService = {
  getOverview: (token) => apiFetch(`${API}/dashboard/overview`, { token }),
  getDeviceStats: (token) => apiFetch(`${API}/dashboard/device-stats`, { token }),
  getLogStats: (token) => apiFetch(`${API}/dashboard/log-stats`, { token }),
  getAlertStats: (token) => apiFetch(`${API}/dashboard/alert-stats`, { token }),
  getRuleStats: (token) => apiFetch(`${API}/dashboard/rule-stats`, { token }),
  getSeverityDistribution: (token) => apiFetch(`${API}/dashboard/severity-distribution`, { token }),
  getTopDevices: (token) => apiFetch(`${API}/dashboard/top-devices`, { token }),
  getRecentAlerts: (token) => apiFetch(`${API}/dashboard/recent-alerts`, { token }),
  getAttackTrend: (token) => apiFetch(`${API}/dashboard/attack-trend`, { token }),
};

/* ── Devices ───────────────────────────────────────────────────────── */

export const deviceService = {
  getAll: (token, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`${API}/devices${qs ? `?${qs}` : ""}`, { token });
  },
  getById: (token, id) => apiFetch(`${API}/devices/${id}`, { token }),
  create: (token, body) =>
    apiFetch(`${API}/devices`, { token, method: "POST", body: JSON.stringify(body) }),
  update: (token, id, body) =>
    apiFetch(`${API}/devices/${id}`, { token, method: "PATCH", body: JSON.stringify(body) }),
  delete: (token, id) =>
    apiFetch(`${API}/devices/${id}`, { token, method: "DELETE" }),
};

/* ── Logs ──────────────────────────────────────────────────────────── */

export const logService = {
  getAll: (token, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`${API}/logs${qs ? `?${qs}` : ""}`, { token });
  },
  getById: (token, id) => apiFetch(`${API}/logs/${id}`, { token }),
  ingest: (token, body) =>
    apiFetch(`${API}/logs/ingest`, { token, method: "POST", body: JSON.stringify(body) }),
};

/* ── Detection Rules ───────────────────────────────────────────────── */

export const ruleService = {
  getAll: (token, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`${API}/rules${qs ? `?${qs}` : ""}`, { token });
  },
  getById: (token, id) => apiFetch(`${API}/rules/${id}`, { token }),
  create: (token, body) =>
    apiFetch(`${API}/rules`, { token, method: "POST", body: JSON.stringify(body) }),
  update: (token, id, body) =>
    apiFetch(`${API}/rules/${id}`, { token, method: "PATCH", body: JSON.stringify(body) }),
  delete: (token, id) =>
    apiFetch(`${API}/rules/${id}`, { token, method: "DELETE" }),
};

/* ── Alerts ────────────────────────────────────────────────────────── */

export const alertService = {
  getAll: (token, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`${API}/alerts${qs ? `?${qs}` : ""}`, { token });
  },
  getById: (token, id) => apiFetch(`${API}/alerts/${id}`, { token }),
  acknowledge: (token, id) =>
    apiFetch(`${API}/alerts/${id}/acknowledge`, { token, method: "PATCH" }),
  resolve: (token, id) =>
    apiFetch(`${API}/alerts/${id}/resolve`, { token, method: "PATCH" }),
  delete: (token, id) =>
    apiFetch(`${API}/alerts/${id}`, { token, method: "DELETE" }),
};

/* ── Incidents ─────────────────────────────────────────────────────── */
// NOTE: Backend incident routes are not yet registered in server.ts.
// These calls will fail until /api/v1/incidents routes are added.
export const incidentService = {
  getAll: (token, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`${API}/incidents${qs ? `?${qs}` : ""}`, { token });
  },
  getById: (token, id) => apiFetch(`${API}/incidents/${id}`, { token }),
  create: (token, body) =>
    apiFetch(`${API}/incidents`, { token, method: "POST", body: JSON.stringify(body) }),
  update: (token, id, body) =>
    apiFetch(`${API}/incidents/${id}`, { token, method: "PATCH", body: JSON.stringify(body) }),
  assign: (token, id, assignedToId) =>
    apiFetch(`${API}/incidents/${id}/assign`, { token, method: "PATCH", body: JSON.stringify({ assignedToId }) }),
  close: (token, id) =>
    apiFetch(`${API}/incidents/${id}/close`, { token, method: "PATCH" }),
  reopen: (token, id) =>
    apiFetch(`${API}/incidents/${id}/reopen`, { token, method: "PATCH" }),
};

/* ── Audit Logs ────────────────────────────────────────────────────── */
// NOTE: Backend audit routes exist in routes/audit.routes.ts but are
// not yet registered in server.ts. Add: app.use("/api/v1/audit", auditRoutes)
export const auditService = {
  getAll: (token, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`${API}/audit${qs ? `?${qs}` : ""}`, { token });
  },
};

/* ── Users ─────────────────────────────────────────────────────────── */
// NOTE: Backend user routes exist in routes/user.routes.ts but are
// not yet registered in server.ts. Add: app.use("/api/v1/users", userRoutes)
export const userService = {
  getAll: (token, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`${API}/users${qs ? `?${qs}` : ""}`, { token });
  },
  getById: (token, id) => apiFetch(`${API}/users/${id}`, { token }),
  update: (token, id, body) =>
    apiFetch(`${API}/users/${id}`, { token, method: "PATCH", body: JSON.stringify(body) }),
  delete: (token, id) =>
    apiFetch(`${API}/users/${id}`, { token, method: "DELETE" }),
  lock: (token, id) =>
    apiFetch(`${API}/users/${id}/lock`, { token, method: "PATCH" }),
  unlock: (token, id) =>
    apiFetch(`${API}/users/${id}/unlock`, { token, method: "PATCH" }),
  resetPassword: (token, id) =>
    apiFetch(`${API}/users/${id}/reset-password`, { token, method: "POST" }),
};

/* ── Reports ────────────────────────────────────────────────────────── */
// NOTE: Backend report routes exist but controller is empty.
export const reportService = {
  generate: (token, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`${API}/reports${qs ? `?${qs}` : ""}`, { token });
  },
};