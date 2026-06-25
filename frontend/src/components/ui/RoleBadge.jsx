/**
 * RoleBadge.jsx
 * Displays a user role as a styled chip.
 * Backend roles: ADMIN | ANALYST | OPERATOR | VIEWER
 */

const ROLE_STYLES = {
  ADMIN:    "bg-red-500/10 text-red-400 border-red-500/30",
  ANALYST:  "bg-purple-500/10 text-purple-400 border-purple-500/30",
  OPERATOR: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  VIEWER:   "bg-slate-500/10 text-slate-400 border-slate-500/30",
};

const ROLE_ICONS = {
  ADMIN:    "⬡",
  ANALYST:  "◈",
  OPERATOR: "◎",
  VIEWER:   "◉",
};

export default function RoleBadge({ role, size = "sm" }) {
  if (!role) return null;

  const style = ROLE_STYLES[role] ?? "bg-slate-500/10 text-slate-400 border-slate-500/30";
  const icon  = ROLE_ICONS[role] ?? "○";
  const text  = size === "lg"
    ? "text-xs px-3 py-1"
    : "text-[10px] px-2 py-0.5";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold tracking-widest uppercase border rounded-full ${style} ${text}`}
    >
      <span className="text-[9px] leading-none">{icon}</span>
      {role}
    </span>
  );
}