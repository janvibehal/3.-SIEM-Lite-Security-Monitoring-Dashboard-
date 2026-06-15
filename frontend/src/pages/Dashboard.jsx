/**
 * src/pages/Dashboard.jsx
 *
 * SIEM Lite — Main SOC dashboard. Protected route.
 * Uses: AuthContext (user, logout, accessToken)
 *
 * This is a presentation-quality placeholder that demonstrates:
 *  - Live stat cards
 *  - Recent alert feed
 *  - Sidebar navigation
 *  - Logged-in user identity
 *  - Functional logout (calls backend + clears memory token)
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Toast, useToast } from "../components/ui/Toast";

// ── Static mock data (replace with real API calls) ────────────────────
const MOCK_STATS = [
  { label: "Events / sec",    value: "4,218",  delta: "+12%",  up: true,  icon: "pulse"   },
  { label: "Active alerts",   value: "23",     delta: "+3",    up: false, icon: "bell"    },
  { label: "Blocked IPs",     value: "1,047",  delta: "+88",   up: true,  icon: "shield"  },
  { label: "Open incidents",  value: "7",      delta: "−2",    up: true,  icon: "folder"  },
];

const MOCK_ALERTS = [
  { id: "A-4819", sev: "CRITICAL", type: "BRUTE_FORCE",    src: "185.220.101.47", dst: "10.0.0.14", mitre: "T1110", time: "14:32:01", status: "open"         },
  { id: "A-4818", sev: "HIGH",     type: "PORT_SCAN",      src: "103.41.167.12",  dst: "10.0.0.5",  mitre: "T1046", time: "14:31:55", status: "investigating" },
  { id: "A-4817", sev: "CRITICAL", type: "C2_BEACON",      src: "198.51.100.77",  dst: "10.0.0.19", mitre: "T1071", time: "14:31:33", status: "open"         },
  { id: "A-4816", sev: "HIGH",     type: "LATERAL_MOVE",   src: "10.0.0.22",      dst: "10.0.0.8",  mitre: "T1021", time: "14:30:12", status: "open"         },
  { id: "A-4815", sev: "HIGH",     type: "DATA_EXFIL",     src: "10.0.0.7",       dst: "45.33.32.156", mitre: "T1041", time: "14:28:47", status: "open"      },
  { id: "A-4814", sev: "MEDIUM",   type: "AUTH_ANOMALY",   src: "10.0.0.44",      dst: "AD-SERVER", mitre: "T1078", time: "14:27:03", status: "resolved"     },
  { id: "A-4813", sev: "CRITICAL", type: "PRIV_ESC",       src: "10.0.0.11",      dst: "DC-01",     mitre: "T1068", time: "14:25:59", status: "investigating" },
  { id: "A-4812", sev: "MEDIUM",   type: "SUSPICIOUS_DNS", src: "10.0.0.33",      dst: "8.8.8.8",   mitre: "T1071", time: "14:24:31", status: "resolved"     },
];

const NAV_ITEMS = [
  { label: "Dashboard",   icon: "grid",    active: true  },
  { label: "Alerts",      icon: "bell",    active: false },
  { label: "Logs",        icon: "file",    active: false },
  { label: "Devices",     icon: "monitor", active: false },
  { label: "Rules",       icon: "code",    active: false },
  { label: "Reports",     icon: "bar",     active: false },
  { label: "Users",       icon: "users",   active: false },
  { label: "Audit Log",   icon: "clock",   active: false },
];

const SEV_STYLES = {
  CRITICAL: { bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/30",    dot: "bg-red-500"    },
  HIGH:     { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30", dot: "bg-orange-500" },
  MEDIUM:   { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30", dot: "bg-yellow-500" },
  LOW:      { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/30",   dot: "bg-blue-500"   },
};

const STATUS_STYLES = {
  open:          "text-red-400 bg-red-500/10 border-red-500/20",
  investigating: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  resolved:      "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
};

// ── Component ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast, clearToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clock, setClock] = useState(new Date());

  // Live clock tick
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = async () => {
    await logout(); // clears cookie + memory token
    navigate("/login", { replace: true });
  };

  const utcTime = clock.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-200">
      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 w-60 bg-slate-900/95 border-r border-slate-800 flex flex-col",
          "transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheckIcon className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">SIEM Lite</p>
            <p className="text-[10px] font-mono text-slate-600 mt-0.5">SOC Platform v1.0</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-[10px] font-mono text-slate-700 uppercase tracking-widest px-2 mb-2">Navigation</p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={[
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5",
                item.active
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800",
              ].join(" ")}
            >
              <NavIcon name={item.icon} active={item.active} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User / logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400">
              {user?.username?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.username ?? "—"}</p>
              <p className="text-[10px] font-mono text-slate-600 truncate">{user?.role ?? "operator"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/5 border border-slate-800 hover:border-red-500/20 transition-colors font-mono"
          >
            <LogOutIcon />
            Sign out
          </button>
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between h-14 px-5 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="lg:hidden text-slate-500 hover:text-white transition-colors"
          >
            <HamburgerIcon />
          </button>

          {/* Live clock */}
          <p className="hidden md:block text-xs font-mono text-slate-600 tracking-widest">
            <span className="text-red-500 animate-pulse mr-1.5">●</span>
            {utcTime}
          </p>

          {/* Right: alerts badge + user */}
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => showToast("23 active alerts require attention.", "error")}
              className="relative flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-200 transition-colors font-mono border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-1.5"
            >
              <BellIcon />
              <span>23</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-xs">
                {user?.username?.[0]?.toUpperCase() ?? "?"}
              </div>
              <span className="hidden sm:block text-slate-400 font-mono">{user?.username}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 md:p-8 space-y-8">
          {/* Page heading */}
          <div>
            <h1 className="text-xl font-bold text-white">Security Overview</h1>
            <p className="text-xs text-slate-600 font-mono mt-1">
              Real-time SOC monitoring · Last updated {clock.toLocaleTimeString()}
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {MOCK_STATS.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* Alert feed */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Recent Alerts</h2>
              <button className="text-xs font-mono text-cyan-500 hover:text-cyan-400 transition-colors">
                View all →
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden">
              {/* Table header */}
              <div className="hidden md:grid grid-cols-[80px_120px_140px_140px_140px_90px_80px_90px] gap-3 px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                <span>ID</span>
                <span>Severity</span>
                <span>Type</span>
                <span>Source</span>
                <span>Destination</span>
                <span>MITRE</span>
                <span>Time</span>
                <span>Status</span>
              </div>

              {/* Alert rows */}
              {MOCK_ALERTS.map((alert, i) => (
                <AlertRow key={alert.id} alert={alert} even={i % 2 === 0} />
              ))}
            </div>
          </section>
        </main>
      </div>

      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={clearToast} />
      )}
    </div>
  );
}

/* ── Stat card ───────────────────────────────────────────────────────── */
function StatCard({ label, value, delta, up, icon }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-4 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <StatIcon name={icon} />
        </div>
        <span className={`text-xs font-mono ${up ? "text-cyan-400" : "text-red-400"}`}>{delta}</span>
      </div>
      <p className="text-2xl font-bold text-white font-mono leading-none">{value}</p>
      <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

/* ── Alert row ───────────────────────────────────────────────────────── */
function AlertRow({ alert, even }) {
  const sev = SEV_STYLES[alert.sev] ?? SEV_STYLES.MEDIUM;
  const statusStyle = STATUS_STYLES[alert.status] ?? STATUS_STYLES.open;

  return (
    <div
      className={[
        "grid grid-cols-1 md:grid-cols-[80px_120px_140px_140px_140px_90px_80px_90px] gap-3 px-4 py-3",
        "border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors cursor-pointer",
        even ? "bg-transparent" : "bg-slate-900/20",
      ].join(" ")}
    >
      <span className="text-xs font-mono text-slate-500">{alert.id}</span>

      <span className={`flex items-center gap-1.5 text-xs font-mono font-bold ${sev.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${sev.dot} flex-shrink-0`} />
        {alert.sev}
      </span>

      <span className="text-xs font-mono text-slate-300 truncate">{alert.type}</span>

      <span className="text-xs font-mono text-slate-400 truncate">{alert.src}</span>

      <span className="text-xs font-mono text-slate-400 truncate">{alert.dst}</span>

      <span className="text-xs font-mono text-slate-600">{alert.mitre}</span>

      <span className="text-xs font-mono text-slate-500">{alert.time}</span>

      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono border w-fit ${statusStyle}`}>
        {alert.status}
      </span>
    </div>
  );
}

/* ── Tiny icon sets ──────────────────────────────────────────────────── */
function ShieldCheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function StatIcon({ name }) {
  const props = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "#94a3b8", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "pulse") return <svg {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
  if (name === "bell")  return <svg {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
  if (name === "shield") return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
  if (name === "folder") return <svg {...props}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>;
  return null;
}

function NavIcon({ name, active }) {
  const color = active ? "#22d3ee" : "#64748b";
  const props = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "grid")    return <svg {...props}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
  if (name === "bell")    return <svg {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
  if (name === "file")    return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
  if (name === "monitor") return <svg {...props}><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>;
  if (name === "code")    return <svg {...props}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
  if (name === "bar")     return <svg {...props}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
  if (name === "users")   return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
  if (name === "clock")   return <svg {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
  return null;
}
