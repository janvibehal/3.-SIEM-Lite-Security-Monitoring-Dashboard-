/**
 * RoleBadge.jsx
 * Displays a user role as a styled chip with a clearance-tier indicator.
 * Backend roles: ADMIN | ANALYST | OPERATOR | VIEWER
 */

const ROLE_STYLES = {
  ADMIN:    "bg-[#1c1712] text-[#c9a36c] border-[#3a2f1f]",
  ANALYST:  "bg-[#141a1f] text-[#8aa4bb] border-[#23303a]",
  OPERATOR: "bg-[#131a17] text-[#7fa491] border-[#1f2e27]",
  VIEWER:   "bg-[#15161a] text-[#8a8d93] border-[#26282d]",
};

const ROLE_TIER = {
  ADMIN: 4,
  ANALYST: 3,
  OPERATOR: 2,
  VIEWER: 1,
};

export default function RoleBadge({ role, size = "sm" }) {
  if (!role) return null;

  const style = ROLE_STYLES[role] ?? ROLE_STYLES.VIEWER;
  const tier = ROLE_TIER[role] ?? 1;
  const text = size === "lg" ? "text-xs px-3 py-1.5" : "text-[10px] px-2 py-1";

  return (
    <span
      className={`inline-flex items-center gap-2 font-mono font-medium tracking-[0.15em] uppercase border rounded-md ${style} ${text}`}
    >
      <TierTicks tier={tier} />
      {role}
    </span>
  );
}

function TierTicks({ tier }) {
  return (
    <span className="inline-flex items-end gap-[2px]" aria-hidden="true">
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-[2.5px] rounded-[1px] bg-current"
          style={{
            height: `${3 + i * 1.5}px`,
            opacity: i <= tier ? 1 : 0.22,
          }}
        />
      ))}
    </span>
  );
}