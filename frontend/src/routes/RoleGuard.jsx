/**
 * src/routes/RoleGuard.jsx
 *
 * Restricts access to routes by role.
 * Must be nested inside ProtectedRoute (authentication is a prerequisite).
 *
 * Backend roles: ADMIN | ANALYST | OPERATOR | VIEWER
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>
 *     <Route element={<RoleGuard allowed={["ADMIN"]} />}>
 *       <Route path="/admin" element={<AdminPage />} />
 *     </Route>
 *   </Route>
 *
 * Behaviour:
 *   - Loading → show spinner (user not yet hydrated)
 *   - Role in allowed list → render children via <Outlet />
 *   - Role not in allowed list → redirect to /403
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleGuard({ allowed, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <RoleCheckingScreen />;
  }

  // user?.role comes from AuthContext (hydrated from /auth/me or login response)
  if (!user?.role || !allowed.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}

function RoleCheckingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center animate-pulse">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
            stroke="#22d3ee"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M9 12l2 2 4-4" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
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
        Checking permissions…
      </p>
    </div>
  );
}