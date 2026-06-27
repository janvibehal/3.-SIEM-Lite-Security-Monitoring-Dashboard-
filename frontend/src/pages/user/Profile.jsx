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
        <div className="flex flex-col items-center justify-center py-28 gap-4">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8a8d93"
            strokeWidth="2"
            strokeLinecap="round"
            className="motion-safe:animate-spin opacity-70"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <p className="text-[11px] font-mono text-zinc-600 tracking-[0.2em] uppercase">
            Verifying credentials…
          </p>
        </div>
      </PageShell>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <PageShell>
        <div className="flex items-start gap-4 p-5 rounded-md bg-[#1a1413] border border-[#3a2420] max-w-md">
          <div className="w-9 h-9 rounded-md bg-[#241a18] border border-[#3a2420] flex items-center justify-center flex-shrink-0">
            <AlertIcon />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100">
              Profile unavailable
            </p>
            <p className="text-xs text-zinc-500 mt-1 font-mono">{error}</p>
          </div>
        </div>
      </PageShell>
    );
  }

  const data = profile ?? ctxUser ?? {};
  const verified = data.emailVerified ?? data.isVerified ?? false;
  const serial = buildSerial(data.id ?? data._id);

  return (
    <PageShell>
      <div className="max-w-2xl space-y-8">
        {/* ── Badge card ──────────────────────────────────────────────── */}
        <div className="relative rounded-lg bg-[#131416] border border-[#232428] overflow-hidden">
          {/* clearance stripe */}
          <div className="h-[3px] w-full bg-gradient-to-r from-[#b08d57] via-[#8a703f] to-transparent" />

          {/* corner brackets — signature framing element */}
          <CornerBracket position="top-left" />
          <CornerBracket position="top-right" />
          <CornerBracket position="bottom-left" />
          <CornerBracket position="bottom-right" />

          <div className="p-7 flex flex-col items-center text-center gap-4">
            <div className="relative">
              <UserAvatar user={data} size="xl" />
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#131416] ${
                  verified
                    ? "bg-[#6b9080] motion-safe:animate-pulse"
                    : "bg-zinc-700"
                }`}
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-zinc-100 tracking-tight font-[\'Space_Grotesk\',sans-serif]">
                {data.username ?? "—"}
              </h2>
              <p className="text-xs text-zinc-500 font-mono mt-1">
                {data.email ?? "—"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <RoleBadge role={data.role} size="lg" />
              <VerificationBadge verified={verified} />
            </div>

            <div className="mt-2 px-3 py-1.5 rounded-full bg-[#1a1b1e] border border-[#232428]">
              <span className="text-[10px] font-mono text-zinc-500 tracking-[0.15em]">
                {serial}
              </span>
            </div>
          </div>
        </div>

        {/* ── Detail list ─────────────────────────────────────────────── */}
        <div className="rounded-lg bg-[#131416] border border-[#232428] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#232428] flex items-center justify-between">
            <h3 className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.2em]">
              Account record
            </h3>
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
              Read-only
            </span>
          </div>

          <div className="divide-y divide-[#1c1d20]">
            <ProfileField label="User ID" value={data.id ?? data._id ?? "—"} mono />
            <ProfileField label="Username" value={data.username ?? "—"} />
            <ProfileField label="Email" value={data.email ?? "—"} />
            <ProfileField label="Role" value={<RoleBadge role={data.role} />} />
            <ProfileField
              label="Email verified"
              value={<VerificationBadge verified={verified} />}
            />
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

        <p className="text-[11px] font-mono text-zinc-600 tracking-wide text-center">
          This record is read-only. Contact your SOC administrator to request changes.
        </p>
      </div>
    </PageShell>
  );
}

function ProfileField({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 gap-4 hover:bg-[#16171a] transition-colors">
      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.18em] flex-shrink-0 w-36">
        {label}
      </span>
      <span
        className={`text-sm text-zinc-300 text-right min-w-0 truncate ${
          mono ? "font-mono text-xs text-zinc-400" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function CornerBracket({ position }) {
  const base = "absolute w-3 h-3 border-[#34363b] pointer-events-none";
  const map = {
    "top-left": "top-2 left-2 border-t-2 border-l-2 rounded-tl-sm",
    "top-right": "top-2 right-2 border-t-2 border-r-2 rounded-tr-sm",
    "bottom-left": "bottom-2 left-2 border-b-2 border-l-2 rounded-bl-sm",
    "bottom-right": "bottom-2 right-2 border-b-2 border-r-2 rounded-br-sm",
  };
  return <div className={`${base} ${map[position]}`} aria-hidden="true" />;
}

function PageShell({ children }) {
  return (
    <div className="flex-1 min-h-screen bg-[#0a0a0b] p-5 md:p-10 space-y-7">
      <div>
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.25em] mb-1.5">
          Identity / Access
        </p>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
          Profile
        </h1>
        <p className="text-xs text-zinc-600 font-mono mt-1">
          Account information for the authenticated session
        </p>
      </div>
      {children}
    </div>
  );
}

function buildSerial(id) {
  if (!id) return "SOC-XXXX-XXXX";
  const clean = String(id).replace(/-/g, "").toUpperCase();
  const a = clean.slice(0, 4) || "XXXX";
  const b = clean.slice(4, 8) || "XXXX";
  return `SOC-${a}-${b}`;
}

function AlertIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#c4756b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}