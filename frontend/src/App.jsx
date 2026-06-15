import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ─────────────────────────────────────────── */}
        {/* Redirect bare root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Forgot-password: minimal placeholder so Link doesn't 404 */}
        <Route path="/forgot-password" element={<ForgotPasswordPlaceholder />} />

        {/* ── Protected routes ──────────────────────────────────────── */}
        {/*
          ProtectedRoute renders <Outlet /> when authenticated,
          or <Navigate to="/login" state={{ from: location }} /> when not.
          Wrap any future protected pages inside this element.
        */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add more protected routes here as the app grows:
              <Route path="/alerts"  element={<Alerts />}  />
              <Route path="/logs"    element={<Logs />}    />
              <Route path="/rules"   element={<Rules />}   />
          */}
        </Route>

        {/* ── Catch-all ─────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/* ── Minimal forgot-password placeholder ──────────────────────────────── */
function ForgotPasswordPlaceholder() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center space-y-4 max-w-sm px-8">
        {/* Shield icon */}
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#22d3ee" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>

        <div>
          <h1 className="text-lg font-bold text-white">Password Reset</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Contact your SOC administrator to reset your password, or implement
            the forgot-password flow using{" "}
            <code className="text-cyan-500">authService.forgotPassword()</code>.
          </p>
        </div>

        <a
          href="/login"
          className="inline-block text-xs font-mono text-cyan-500 hover:text-cyan-400 transition-colors border border-cyan-500/20 rounded-lg px-4 py-2 hover:bg-cyan-500/5"
        >
          ← Back to sign in
        </a>
      </div>
    </div>
  );
}
