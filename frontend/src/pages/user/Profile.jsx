/**
 * src/pages/Profile.jsx
 *
 * Read-only profile page. Source of truth: GET /api/v1/auth/me
 * Displays: id, email, username, role, organizationId, emailVerified, createdAt
 * (any field returned by the backend /me endpoint).
 */

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMe } from "../../services/authService";
import UserAvatar from "../../components/user/UserAvatar";
import RoleBadge from "../../components/user/RoleBadge";
import VerificationBadge from "../../components/user/VerificationBadge";

export default function Profile() {
  const { accessToken, user: ctxUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    (async () => {
      try {
        const res = await getMe(accessToken);
        setProfile(res.data);
      } catch (err) {
        setError(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken]);

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" className="animate-spin opacity-60">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <p className="text-xs font-mono text-slate-600 tracking-widest uppercase">Loading profile…</p>
        </div>
      </PageShell>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <PageShell>
        <div className="flex items-start gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20 max-w-md">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertIcon />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Failed to load profile</p>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
          </div>
        </div>
      </PageShell>
    );
  }

  const data = profile ?? ctxUser ?? {};

  return (
    <PageShell>
      <div className="max-w-2xl space-y-6">
        {/* Profile card header */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="flex items-start gap-5">
            <UserAvatar user={data} size="xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className="text-lg font-bold text-white">{data.username ?? "—"}</h2>
                <RoleBadge role={data.role} size="lg" />
              </div>
              <p className="text-sm text-slate-400 font-mono">{data.email ?? "—"}</p>
              <div className="mt-2">
                <VerificationBadge verified={data.emailVerified ?? data.isVerified ?? false} />
              </div>
            </div>
          </div>
        </div>

        {/* Detail fields */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Account details</h3>
          </div>
          <div className="divide-y divide-slate-800">
            <ProfileField label="User ID" value={data.id ?? data._id ?? "—"} mono />
            <ProfileField label="Username" value={data.username ?? "—"} />
            <ProfileField label="Email" value={data.email ?? "—"} />
            <ProfileField label="Role" value={<RoleBadge role={data.role} />} />
            <ProfileField label="Email verified" value={<VerificationBadge verified={data.emailVerified ?? data.isVerified ?? false} />} />
            {data.organizationId && (
              <ProfileField label="Organization ID" value={data.organizationId} mono />
            )}
            {data.createdAt && (
              <ProfileField
                label="Member since"
                value={new Date(data.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
            )}
          </div>
        </div>

        <p className="text-xs font-mono text-slate-700">
          Profile is read-only. Contact your SOC administrator to request changes.
        </p>
      </div>
    </PageShell>
  );
}

function ProfileField({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 gap-4">
      <span className="text-xs font-mono text-slate-600 uppercase tracking-widest flex-shrink-0 w-36">
        {label}
      </span>
      <span className={`text-sm text-slate-300 text-right min-w-0 truncate ${mono ? "font-mono text-xs text-slate-400" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function PageShell({ children }) {
  return (
    <div className="flex-1 p-5 md:p-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Profile</h1>
        <p className="text-xs text-slate-600 font-mono mt-1">
          Your account information
        </p>
      </div>
      {children}
    </div>
  );
}

function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}