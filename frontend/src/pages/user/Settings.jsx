/**
 * src/pages/Settings.jsx
 *
 * User settings page.
 * No update endpoints confirmed — read-only display of current session info.
 * Shows: session details, security info, role permissions.
 */

import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import UserAvatar from "../../components/user/UserAvatar";
import RoleBadge from "../../components/user/RoleBadge";

// Role → capabilities mapping (display only)
const ROLE_CAPABILITIES = {
  ADMIN: [
    "Full system access",
    "Manage users and roles",
    "Configure detection rules",
    "View all audit logs",
    "Generate all report types",
    "Manage organization settings",
  ],
  ANALYST: [
    "View and investigate alerts",
    "Access log search",
    "Create and modify detection rules",
    "Generate security reports",
    "View device inventory",
  ],
  OPERATOR: [
    "View active alerts",
    "Acknowledge and close alerts",
    "View log stream",
    "View device inventory",
  ],
  VIEWER: [
    "View dashboard",
    "View alerts (read-only)",
    "View reports",
  ],
};

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const capabilities = ROLE_CAPABILITIES[user?.role] ?? [];

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex-1 p-5 md:p-8 space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-xs text-slate-600 font-mono mt-1">
          Session and account configuration
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Current session */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Current session</h2>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4">
              <UserAvatar user={user} size="lg" />
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-sm font-bold text-white">{user?.username ?? "—"}</p>
                  <RoleBadge role={user?.role} size="lg" />
                </div>
                <p className="text-xs text-slate-500 font-mono">{user?.email ?? "—"}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-xs font-mono text-cyan-400/70">Active session</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Role capabilities */}
        {capabilities.length > 0 && (
          <section className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                Permissions for <span className="text-cyan-400">{user?.role}</span>
              </h2>
            </div>
            <ul className="divide-y divide-slate-800">
              {capabilities.map((cap) => (
                <li key={cap} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-xs text-slate-400">{cap}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Security actions */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Security</h2>
          </div>
          <div className="p-5 space-y-3">
            <ActionRow
              label="Change password"
              description="Update via the forgot-password flow"
              onClick={() => navigate("/forgot-password")}
              variant="default"
            />
            <ActionRow
              label="Sign out of this session"
              description="Clears your access token and session cookie"
              onClick={handleLogout}
              variant="danger"
            />
          </div>
        </section>

        <p className="text-xs font-mono text-slate-700">
          To modify your profile or role, contact your SOC administrator.
        </p>
      </div>
    </div>
  );
}

function ActionRow({ label, description, onClick, variant = "default" }) {
  const btnClass =
    variant === "danger"
      ? "text-red-400 border-red-500/20 hover:bg-red-500/5 hover:border-red-500/40"
      : "text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white";

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold text-slate-300">{label}</p>
        <p className="text-xs text-slate-600 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onClick}
        className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-mono font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 ${btnClass}`}
      >
        {variant === "danger" ? "Sign out" : "Change"}
      </button>
    </div>
  );
}