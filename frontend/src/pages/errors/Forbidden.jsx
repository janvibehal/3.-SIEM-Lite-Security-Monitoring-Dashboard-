/**
 * src/pages/Forbidden.jsx
 * 403 — Insufficient permissions.
 */

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RoleBadge from "../../components/user/RoleBadge";

export default function Forbidden() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-8">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
                stroke="#f87171"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <line x1="8" y1="12" x2="16" y2="12" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Code */}
        <div>
          <p className="text-7xl font-bold font-mono text-red-500/20 leading-none select-none">403</p>
          <h1 className="text-lg font-bold text-white mt-2">Access Denied</h1>
          <p className="text-sm text-slate-500 mt-1">
            You don't have permission to view this page.
          </p>
        </div>

        {/* Current role hint */}
        {user?.role && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-slate-600 font-mono">Your current role</p>
            <RoleBadge role={user.role} size="lg" />
            <p className="text-xs text-slate-600 mt-1">
              Contact your SOC administrator to request elevated access.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 rounded-lg text-sm font-semibold tracking-wide border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            ← Go back
          </button>
          <button
            onClick={() => navigate("/dashboard", { replace: true })}
            className="w-full py-2.5 rounded-lg text-sm font-semibold tracking-wide bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            Return to dashboard
          </button>
        </div>

        <p className="text-xs font-mono text-slate-700">
          SIEM Lite · Error 403 · Forbidden
        </p>
      </div>
    </div>
  );
}