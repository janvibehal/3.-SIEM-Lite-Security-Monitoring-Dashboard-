/**
 * src/routes/ProtectedRoute.jsx
 *
 * Guards routes that require authentication.
 *
 * Behaviour:
 *   - While AuthContext is performing silent refresh on mount → show full-screen spinner
 *   - If authenticated (accessToken in memory) → render children
 *   - If not authenticated → redirect to /login, preserving the attempted URL in location.state.from
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // AuthContext is attempting silent refresh from httpOnly cookie — do not
  // redirect yet; the user might have a valid session.
  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // Pass the attempted URL so Login can redirect back after auth
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/* ── Full-screen loading state ───────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
      {/* Animated shield / SIEM mark */}
      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center animate-pulse">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
            stroke="#22d3ee"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M9 12l2 2 4-4"
            stroke="#22d3ee"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Spinner */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="2"
        strokeLinecap="round"
        className="animate-spin opacity-60"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>

      <p className="text-xs font-mono text-slate-600 tracking-widest uppercase">
        Restoring session…
      </p>
    </div>
  );
}
