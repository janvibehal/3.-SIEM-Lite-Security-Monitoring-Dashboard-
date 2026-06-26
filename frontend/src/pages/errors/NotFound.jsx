/**
 * src/pages/NotFound.jsx
 * 404 — Page not found.
 */

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-8">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Animated grid background accent */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="#64748b" strokeWidth="1.5" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="8" y1="11" x2="14" y2="11" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Code */}
        <div>
          <p className="text-7xl font-bold font-mono text-slate-800 leading-none select-none">404</p>
          <h1 className="text-lg font-bold text-white mt-2">Page Not Found</h1>
          <p className="text-sm text-slate-500 mt-1">
            This route doesn't exist in the SOC platform.
          </p>
        </div>

        {/* Terminal-style path display */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-3">
          <p className="text-xs font-mono text-slate-600">
            <span className="text-cyan-500/60">$ </span>
            <span className="text-red-400">GET </span>
            <span className="text-slate-400">{window.location.pathname}</span>
          </p>
          <p className="text-xs font-mono text-red-400/60 mt-1">
            → 404 Not Found
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="w-full py-2.5 rounded-lg text-sm font-semibold tracking-wide bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-950 flex items-center justify-center"
            >
              Back to Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-full py-2.5 rounded-lg text-sm font-semibold tracking-wide bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-950 flex items-center justify-center"
            >
              Back to Sign In
            </Link>
          )}
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 rounded-lg text-sm font-semibold tracking-wide border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all duration-200"
          >
            ← Go back
          </button>
        </div>

        <p className="text-xs font-mono text-slate-700">
          SIEM Lite · Error 404 · Not Found
        </p>
      </div>
    </div>
  );
}