/**
 * AuthContext.jsx
 * Manages accessToken in memory (NOT localStorage — security best practice).
 * Refresh token lives in httpOnly cookie (set by backend automatically).
 *
 * On mount: silent refresh → if successful, call /auth/me to populate user.
 * On login: token + user are set directly from the login response.
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { refreshToken, logout as apiLogout, getMe } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const data = await refreshToken();
        setAccessToken(data.accessToken);
        // Re-hydrate user profile on each silent refresh
        try {
          const me = await getMe(data.accessToken);
          setUser(me.data);
        } catch {
          // Keep existing user if /me fails — token is still valid
        }
        scheduleRefresh();
      } catch {
        setAccessToken(null);
        setUser(null);
      }
    }, 13 * 60 * 1000); // 13 minutes — refresh 2 min before expiry
  }, []);

  // On mount: try silent refresh from httpOnly cookie
  useEffect(() => {
    (async () => {
      try {
        const data = await refreshToken();
        setAccessToken(data.accessToken);
        // Hydrate user from /auth/me — source of truth for profile data
        try {
          const me = await getMe(data.accessToken);
          setUser(me.data);
        } catch {
          // Token valid but /me failed — continue without user object
        }
        scheduleRefresh();
      } catch {
        // No valid session — fine
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [scheduleRefresh]);

  const login = useCallback(
    (token, userData) => {
      setAccessToken(token);
      setUser(userData);
      scheduleRefresh();
    },
    [scheduleRefresh]
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      /* ignore */
    }
    setAccessToken(null);
    setUser(null);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        setUser,
        login,
        logout,
        loading,
        isAuthenticated: !!accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}