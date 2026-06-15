/**
 * AuthContext.jsx
 * Manages accessToken in memory (NOT localStorage — security best practice).
 * Refresh token lives in httpOnly cookie (set by backend automatically).
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { refreshToken, logout as apiLogout } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  // Access token expires in 15 minutes (JWT_ACCESS_TOKEN_EXPIRY in backend)
  // Refresh 2 minutes before expiry
  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const data = await refreshToken();
        setAccessToken(data.accessToken);
        scheduleRefresh();
      } catch {
        // Refresh token expired or revoked — log out silently
        setAccessToken(null);
        setUser(null);
      }
    }, 13 * 60 * 1000); // 13 minutes
  }, []);

  // On mount: try silent refresh to restore session from httpOnly cookie
  useEffect(() => {
    (async () => {
      try {
        const data = await refreshToken();
        setAccessToken(data.accessToken);
        scheduleRefresh();
      } catch {
        // No valid session — that is fine
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [scheduleRefresh]);

  const login = useCallback((token, userData) => {
    setAccessToken(token);
    setUser(userData);
    scheduleRefresh();
  }, [scheduleRefresh]);

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    setAccessToken(null);
    setUser(null);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  }, []);

  return (
    <AuthContext.Provider value={{ accessToken, user, setUser, login, logout, loading, isAuthenticated: !!accessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
