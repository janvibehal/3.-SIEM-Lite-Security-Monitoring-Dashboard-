/**
 * src/pages/Dashboard.jsx
 *
 * SIEM Lite — Main SOC dashboard. Protected route.
 * Uses: AuthContext (user, logout, accessToken), UserDropdown
 *
 * Charting: Recharts (npm install recharts if not already a dependency)
 * Icons: lucide-react
 * Animation: Tailwind transition utilities only (no framer-motion assumed)
 * World map: placeholder ranked-list panel — swap in a real map lib later
 */

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  Server,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  ShieldAlert,
  Siren,
  ShieldCheck,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  PlusCircle,
  ScrollText,
  BellRing,
  FileBarChart2,
  LogIn,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS — existing app theme (do not alter)
   ════════════════════════════════════════════════════════════════════════ */

const T = {
  bg: "#0F1115",
  bgSecondary: "#171A1D",
  card: "#1C2026",
  border: "#2A2F36",
  text: "#FFFFFF",
  muted: "#A1A1AA",
  accent: "#22D3EE",
  success: "#34D399",
  warning: "#F59E0B",
  danger: "#F87171",
};

/* ════════════════════════════════════════════════════════════════════════
   MOCK DATA — replace with real API calls later
   ════════════════════════════════════════════════════════════════════════ */

const KPI_STATS = [
  { label: "Total devices",   value: "142",     icon: "devices",   accent: "cyan",   delta: "+4",   up: true,  goodWhenUp: true  },
  { label: "Online devices",  value: "128",     icon: "online",    accent: "green",  delta: "+2",   up: true,  goodWhenUp: true  },
  { label: "Offline devices", value: "14",      icon: "offline",   accent: "red",    delta: "+1",   up: true,  goodWhenUp: false },
  { label: "Logs today",      value: "48,910",  icon: "logs",      accent: "cyan",   delta: "+12%", up: true,  goodWhenUp: true  },
  { label: "Total alerts",    value: "23",      icon: "alerts",    accent: "amber",  delta: "+3",   up: true,  goodWhenUp: false },
  { label: "Critical alerts", value: "4",       icon: "critical",  accent: "red",    delta: "+1",   up: true,  goodWhenUp: false },
  { label: "Open incidents",  value: "7",       icon: "incidents", accent: "amber",  delta: "-2",   up: false, goodWhenUp: false },
  { label: "Rules enabled",   value: "31 / 36", icon: "rules",     accent: "green",  delta: "+1",   up: true,  goodWhenUp: true  },
];

const LOGS_OVER_TIME = [
  { time: "00:00", logs: 1180 },
  { time: "02:00", logs: 980  },
  { time: "04:00", logs: 860  },
  { time: "06:00", logs: 1240 },
  { time: "08:00", logs: 2310 },
  { time: "10:00", logs: 3420 },
  { time: "12:00", logs: 3980 },
  { time: "14:00", logs: 4218 },
  { time: "16:00", logs: 3760 },
  { time: "18:00", logs: 2890 },
  { time: "20:00", logs: 2140 },
  { time: "22:00", logs: 1560 },
];

const ALERT_SEVERITY_DATA = [
  { name: "Critical", value: 4, color: T.danger },
  { name: "High",     value: 9, color: "#FB923C" },
  { name: "Medium",   value: 7, color: T.warning },
  { name: "Low",      value: 3, color: T.accent },
];

const TOP_ATTACK_SOURCES = [
  { ip: "185.220.101.47", country: "NL", count: 342 },
  { ip: "103.41.167.12",  country: "RU", count: 287 },
  { ip: "198.51.100.77",  country: "CN", count: 251 },
  { ip: "45.33.32.156",   country: "US", count: 198 },
  { ip: "192.0.2.88",     country: "BR", count: 134 },
];

const TOP_ATTACKED_COUNTRIES = [
  { code: "US", name: "United States", count: 812 },
  { code: "CN", name: "China",         count: 654 },
  { code: "RU", name: "Russia",        count: 588 },
  { code: "NL", name: "Netherlands",   count: 401 },
  { code: "BR", name: "Brazil",        count: 276 },
];

const RECENT_ALERTS = [
  { id: "A-4819", title: "Brute force attempt detected",   sev: "CRITICAL", device: "FW-EDGE-01", status: "open",          time: "14:32:01" },
  { id: "A-4818", title: "Port scan from external host",   sev: "HIGH",     device: "FW-EDGE-02", status: "investigating", time: "14:31:55" },
  { id: "A-4817", title: "C2 beacon traffic identified",   sev: "CRITICAL", device: "APP-PROD-3", status: "open",          time: "14:31:33" },
  { id: "A-4816", title: "Lateral movement across subnet", sev: "HIGH",     device: "DC-01",      status: "open",          time: "14:30:12" },
  { id: "A-4815", title: "Authentication anomaly on AD",   sev: "MEDIUM",   device: "AD-SERVER",  status: "resolved",      time: "14:27:03" },
];

const ACTIVITY_FEED = [
  { type: "rule",     text: "Rule triggered: brute force threshold exceeded", time: "2m ago"  },
  { type: "device",   text: "Device added: WIN-SRV-22",                      time: "14m ago" },
  { type: "incident", text: "Incident created: INC-1042",                    time: "26m ago" },
  { type: "alert",    text: "Alert resolved: A-4814",                        time: "41m ago" },
  { type: "login",    text: "Login failed: user jdoe",                      time: "53m ago" },
];

const DEVICE_HEALTH = [
  { label: "Online",      value: 128, total: 142, color: T.success },
  { label: "Offline",     value: 14,  total: 142, color: T.danger  },
  { label: "Warning",     value: 6,   total: 142, color: T.warning },
  { label: "Maintenance", value: 3,   total: 142, color: T.accent  },
];

const THREAT_TYPES = [
  { name: "Malware",     value: 35, color: T.danger },
  { name: "Phishing",    value: 25, color: "#FB923C" },
  { name: "Brute force", value: 20, color: T.warning },
  { name: "DDoS",        value: 12, color: T.accent },
  { name: "Other",       value: 8,  color: T.muted },
];

const QUICK_ACTIONS = [
  { label: "Create device",   icon: "devices"   },
  { label: "Create rule",     icon: "rules"     },
  { label: "Create incident", icon: "incidents" },
  { label: "View logs",       icon: "logs"      },
  { label: "View alerts",     icon: "alerts"    },
  { label: "Generate report", icon: "report"    },
];

const SEV_STYLES = {
  CRITICAL: { color: T.danger,    dot: T.danger    },
  HIGH:     { color: "#FB923C",   dot: "#FB923C"   },
  MEDIUM:   { color: T.warning,   dot: T.warning   },
  LOW:      { color: T.accent,    dot: T.accent    },
};

const STATUS_STYLES = {
  open:          { color: T.danger,  border: T.danger + "33",  bg: "rgba(248,113,113,0.08)" },
  investigating: { color: "#FB923C", border: "#FB923C33",       bg: "rgba(251,146,60,0.08)" },
  resolved:      { color: T.accent,  border: T.accent + "33",  bg: "rgba(34,211,238,0.08)" },
};

const ACCENT_STYLES = {
  cyan:  { border: T.accent,  iconBg: "rgba(34,211,238,0.08)",  iconBorder: T.accent + "4D",  iconColor: T.accent  },
  green: { border: T.success, iconBg: "rgba(52,211,153,0.08)",  iconBorder: T.success + "4D", iconColor: T.success },
  red:   { border: T.danger,  iconBg: "rgba(248,113,113,0.08)", iconBorder: T.danger + "4D",  iconColor: T.danger  },
  amber: { border: T.warning, iconBg: "rgba(245,158,11,0.08)",  iconBorder: T.warning + "4D", iconColor: T.warning },
};

const TOOLTIP_STYLE = {
  backgroundColor: T.bgSecondary,
  border: `1px solid ${T.border}`,
  borderRadius: "10px",
  fontSize: "12px",
  color: T.text,
};

/* ════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════════════ */

export default function Dashboard() {
  const [clock, setClock] = useState(new Date());
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLastRefresh(new Date());
      setRefreshing(false);
    }, 600);
  };

  return (
    <div className="p-5 md:p-8 space-y-8" style={{ background: T.bg }}>
      <DashboardHeader
        clock={clock}
        lastRefresh={lastRefresh}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* Row 1 — KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_STATS.map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 60}>
            <MetricCard {...stat} />
          </FadeIn>
        ))}
      </div>

      {/* Row 2 — Logs over time / severity donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <FadeIn delay={120} className="lg:col-span-2">
          <ChartCard title="Logs over time" subtitle="Ingested log volume, last 24 hours">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={LOGS_OVER_TIME} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="logsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.accent} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={T.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={T.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" stroke={T.border} tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
                <YAxis stroke={T.border} tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: T.muted }} />
                <Area type="monotone" dataKey="logs" stroke={T.accent} strokeWidth={2} fill="url(#logsFill)" animationDuration={900} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </FadeIn>

        <FadeIn delay={160}>
          <ChartCard title="Alert severity" subtitle="Distribution of active alerts">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={ALERT_SEVERITY_DATA}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  animationDuration={900}
                >
                  {ALERT_SEVERITY_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {ALERT_SEVERITY_DATA.map((entry) => (
                <span key={entry.name} className="flex items-center gap-1.5 text-[11px] font-mono" style={{ color: T.muted }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name} · {entry.value}
                </span>
              ))}
            </div>
          </ChartCard>
        </FadeIn>
      </div>

      {/* Row 3 — Top attacked countries / top attack sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <FadeIn delay={200} className="lg:col-span-2">
          <ThreatMapCard countries={TOP_ATTACKED_COUNTRIES} />
        </FadeIn>

        <FadeIn delay={240}>
          <ChartCard title="Top attack sources" subtitle="By source IP, last 24 hours">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={TOP_ATTACK_SOURCES} layout="vertical" margin={{ top: 5, right: 16, left: 10, bottom: 5 }}>
                <CartesianGrid stroke={T.border} strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke={T.border} tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
                <YAxis dataKey="ip" type="category" stroke={T.border} tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} width={110} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill={T.accent} radius={[0, 4, 4, 0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </FadeIn>
      </div>

      {/* Row 4 — Recent alerts / activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <FadeIn delay={280} className="lg:col-span-2">
          <RecentAlertsTable alerts={RECENT_ALERTS} />
        </FadeIn>

        <FadeIn delay={320}>
          <ActivityFeed items={ACTIVITY_FEED} />
        </FadeIn>
      </div>

      {/* Row 5 — Device health / threat intel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FadeIn delay={360}>
          <DeviceHealthCard items={DEVICE_HEALTH} />
        </FadeIn>

        <FadeIn delay={400}>
          <ChartCard title="Threat intelligence" subtitle="Top threat types, last 7 days">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={THREAT_TYPES} dataKey="value" nameKey="name" outerRadius={85} animationDuration={900}>
                  {THREAT_TYPES.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  verticalAlign="bottom"
                  height={32}
                  formatter={(value) => <span style={{ color: T.muted, fontSize: 11 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </FadeIn>
      </div>

      {/* Bottom row — quick actions */}
      <FadeIn delay={440}>
        <QuickActions actions={QUICK_ACTIONS} />
      </FadeIn>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS (kept in-file per spec)
   ════════════════════════════════════════════════════════════════════════ */

function FadeIn({ children, delay = 0, className = "" }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-500 ease-out ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"} ${className}`}
    >
      {children}
    </div>
  );
}

function DashboardHeader({ clock, lastRefresh, refreshing, onRefresh }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold" style={{ color: T.text }}>Security Overview</h1>
        <p className="text-xs font-mono mt-1" style={{ color: T.muted }}>
          Real-time Security Operations Center monitoring
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-mono" style={{ color: T.text }}>{clock.toLocaleTimeString()}</p>
          <p className="text-[10px] font-mono" style={{ color: T.muted }}>
            Last refresh {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 text-xs font-mono rounded-xl px-3.5 py-2.5 border transition-colors duration-200 disabled:opacity-60 hover:bg-white/5"
          style={{ color: T.muted, borderColor: T.border }}
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} style={{ color: T.accent }} />
          Refresh
        </button>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, accent, delta, up, goodWhenUp }) {
  const style = ACCENT_STYLES[accent] ?? ACCENT_STYLES.cyan;
  const isGood = up === goodWhenUp;
  const trendColor = isGood ? T.success : T.danger;

  return (
    <div
      className="rounded-2xl px-4 py-4 border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
      style={{
        background: T.card,
        borderColor: T.border,
        borderLeft: `2px solid ${style.border}`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-8 h-8 rounded-xl border flex items-center justify-center"
          style={{ background: style.iconBg, borderColor: style.iconBorder }}
        >
          <StatIcon name={icon} color={style.iconColor} />
        </div>
        <span className="flex items-center gap-1 text-xs font-mono" style={{ color: trendColor }}>
          {up ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {delta}
        </span>
      </div>
      <p className="text-2xl font-bold font-mono leading-none" style={{ color: T.text }}>{value}</p>
      <p className="text-[10px] font-mono uppercase tracking-widest mt-1" style={{ color: T.muted }}>{label}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div
      className="backdrop-blur rounded-2xl p-5 border transition-colors duration-300 h-full"
      style={{ background: T.card, borderColor: T.border }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color: T.text }}>{title}</h3>
        {subtitle && <p className="text-[11px] font-mono mt-0.5" style={{ color: T.muted }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function ThreatMapCard({ countries }) {
  const max = Math.max(...countries.map((c) => c.count));

  return (
    <div
      className="backdrop-blur rounded-2xl p-5 border transition-colors duration-300 h-full"
      style={{ background: T.card, borderColor: T.border }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: T.text }}>Top attacked countries</h3>
          <p className="text-[11px] font-mono mt-0.5" style={{ color: T.muted }}>Attack markers, last 24 hours</p>
        </div>
        <span
          className="text-[10px] font-mono uppercase tracking-widest rounded-full px-2 py-0.5 border"
          style={{ color: T.muted, borderColor: T.border }}
        >
          Map view coming soon
        </span>
      </div>

      <div
        className="relative rounded-xl border px-4 py-5 overflow-hidden"
        style={{ borderColor: T.border, background: T.bgSecondary }}
      >
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(circle, ${T.accent} 1px, transparent 1px)`,
            backgroundSize: "18px 18px",
          }}
          aria-hidden="true"
        />
        <div className="relative space-y-3">
          {countries.map((c) => (
            <div key={c.code} className="flex items-center gap-3">
              <span className="w-9 text-[10px] font-mono uppercase" style={{ color: T.muted }}>{c.code}</span>
              <span className="text-xs w-32 truncate" style={{ color: T.text }}>{c.name}</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: T.border }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(c.count / max) * 100}%`, background: T.accent + "B3" }}
                />
              </div>
              <span className="w-10 text-right text-xs font-mono" style={{ color: T.muted }}>{c.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecentAlertsTable({ alerts }) {
  return (
    <div className="rounded-2xl overflow-hidden border h-full" style={{ background: T.card, borderColor: T.border }}>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: T.border }}>
        <h3 className="text-sm font-semibold" style={{ color: T.text }}>Recent alerts</h3>
        <button className="flex items-center gap-1 text-xs font-mono transition-colors" style={{ color: T.accent }}>
          View all <ArrowRight size={12} />
        </button>
      </div>

      <div
        className="hidden md:grid grid-cols-[1fr_90px_110px_110px_70px_70px] gap-3 px-5 py-2.5 border-b text-[10px] font-mono uppercase tracking-widest"
        style={{ background: T.bgSecondary, borderColor: T.border, color: T.muted }}
      >
        <span>Alert</span>
        <span>Severity</span>
        <span>Device</span>
        <span>Status</span>
        <span>Time</span>
        <span>Actions</span>
      </div>

      {alerts.map((alert, i) => {
        const sev = SEV_STYLES[alert.sev] ?? SEV_STYLES.MEDIUM;
        const statusStyle = STATUS_STYLES[alert.status] ?? STATUS_STYLES.open;
        return (
          <div
            key={alert.id}
            className="grid grid-cols-1 md:grid-cols-[1fr_90px_110px_110px_70px_70px] gap-3 px-5 py-3 border-b last:border-0 transition-colors hover:bg-white/[0.03]"
            style={{ borderColor: T.border, background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}
          >
            <div className="min-w-0">
              <p className="text-xs truncate" style={{ color: T.text }}>{alert.title}</p>
              <p className="text-[10px] font-mono" style={{ color: T.muted }}>{alert.id}</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-mono font-bold" style={{ color: sev.color }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sev.dot }} />
              {alert.sev}
            </span>
            <span className="text-xs font-mono truncate" style={{ color: T.muted }}>{alert.device}</span>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono border w-fit"
              style={{ color: statusStyle.color, borderColor: statusStyle.border, background: statusStyle.bg }}
            >
              {alert.status}
            </span>
            <span className="text-xs font-mono" style={{ color: T.muted }}>{alert.time}</span>
            <button className="text-xs font-mono text-left transition-colors" style={{ color: T.muted }}>
              View
            </button>
          </div>
        );
      })}
    </div>
  );
}

const ACTIVITY_STYLES = {
  rule:     { dot: T.accent,  icon: "rules"     },
  device:   { dot: T.success, icon: "devices"   },
  incident: { dot: T.warning, icon: "incidents" },
  alert:    { dot: T.accent,  icon: "alerts"    },
  login:    { dot: T.danger,  icon: "offline"   },
};

function ActivityFeed({ items }) {
  return (
    <div className="rounded-2xl p-5 border h-full" style={{ background: T.card, borderColor: T.border }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: T.text }}>Recent activity</h3>
      <div className="relative pl-5">
        <div className="absolute left-[5px] top-1 bottom-1 w-px" style={{ background: T.border }} aria-hidden="true" />
        <div className="space-y-4">
          {items.map((item, i) => {
            const style = ACTIVITY_STYLES[item.type] ?? ACTIVITY_STYLES.rule;
            return (
              <div key={`${item.type}-${i}`} className="relative flex gap-3">
                <span
                  className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full"
                  style={{ background: style.dot, boxShadow: `0 0 0 4px ${T.card}` }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-xs leading-snug" style={{ color: T.text }}>{item.text}</p>
                  <p className="text-[10px] font-mono mt-0.5" style={{ color: T.muted }}>{item.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DeviceHealthCard({ items }) {
  return (
    <div className="rounded-2xl p-5 border h-full" style={{ background: T.card, borderColor: T.border }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: T.text }}>Device health</h3>
      <div className="space-y-4">
        {items.map((item) => {
          const pct = Math.round((item.value / item.total) * 100);
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: T.muted }}>{item.label}</span>
                <span className="text-xs font-mono" style={{ color: T.muted }}>
                  {item.value} <span style={{ color: T.border }}>/ {item.total}</span>
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: T.border }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuickActions({ actions }) {
  return (
    <div className="rounded-2xl p-5 border" style={{ background: T.card, borderColor: T.border }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: T.text }}>Quick actions</h3>
      <div className="flex flex-wrap gap-2.5">
        {actions.map((action) => (
          <button
            key={action.label}
            className="flex items-center gap-2 text-xs rounded-xl px-3.5 py-2.5 border transition-all duration-200 hover:-translate-y-0.5"
            style={{ color: T.text, background: T.bgSecondary, borderColor: T.border }}
          >
            <StatIcon name={action.icon} color={T.accent} />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Icons (lucide-react) ─────────────────────────────────────────────── */

function StatIcon({ name, color = "#A1A1AA" }) {
  const props = { size: 15, color, strokeWidth: 1.8 };
  if (name === "devices")   return <Server {...props} />;
  if (name === "online")    return <CheckCircle2 {...props} />;
  if (name === "offline")   return <XCircle {...props} />;
  if (name === "logs")      return <FileText {...props} />;
  if (name === "alerts")    return <BellRing {...props} />;
  if (name === "critical")  return <Siren {...props} />;
  if (name === "incidents") return <ShieldAlert {...props} />;
  if (name === "rules")     return <ShieldCheck {...props} />;
  if (name === "report")    return <FileBarChart2 {...props} />;
  return null;
}