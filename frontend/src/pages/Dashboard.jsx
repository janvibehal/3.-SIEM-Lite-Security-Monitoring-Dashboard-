/**
 * src/pages/Dashboard.jsx
 *
 * SIEM Lite — Main SOC dashboard. Protected route.
 * Uses: AuthContext (user, logout, accessToken), UserDropdown
 */

import { useState, useEffect } from "react";

// ── Static mock data ──────────────────────────────────────────────────
const MOCK_STATS = [
  { label: "Events / sec",   value: "4,218", delta: "+12%", up: true,  icon: "pulse"  },
  { label: "Active alerts",  value: "23",    delta: "+3",   up: false, icon: "bell"   },
  { label: "Blocked IPs",    value: "1,047", delta: "+88",  up: true,  icon: "shield" },
  { label: "Open incidents", value: "7",     delta: "−2",   up: true,  icon: "folder" },
];

const MOCK_ALERTS = [
  { id: "A-4819", sev: "CRITICAL", type: "BRUTE_FORCE",    src: "185.220.101.47", dst: "10.0.0.14",    mitre: "T1110", time: "14:32:01", status: "open"         },
  { id: "A-4818", sev: "HIGH",     type: "PORT_SCAN",      src: "103.41.167.12",  dst: "10.0.0.5",     mitre: "T1046", time: "14:31:55", status: "investigating" },
  { id: "A-4817", sev: "CRITICAL", type: "C2_BEACON",      src: "198.51.100.77",  dst: "10.0.0.19",    mitre: "T1071", time: "14:31:33", status: "open"         },
  { id: "A-4816", sev: "HIGH",     type: "LATERAL_MOVE",   src: "10.0.0.22",      dst: "10.0.0.8",     mitre: "T1021", time: "14:30:12", status: "open"         },
  { id: "A-4815", sev: "HIGH",     type: "DATA_EXFIL",     src: "10.0.0.7",       dst: "45.33.32.156", mitre: "T1041", time: "14:28:47", status: "open"         },
  { id: "A-4814", sev: "MEDIUM",   type: "AUTH_ANOMALY",   src: "10.0.0.44",      dst: "AD-SERVER",    mitre: "T1078", time: "14:27:03", status: "resolved"     },
  { id: "A-4813", sev: "CRITICAL", type: "PRIV_ESC",       src: "10.0.0.11",      dst: "DC-01",        mitre: "T1068", time: "14:25:59", status: "investigating" },
  { id: "A-4812", sev: "MEDIUM",   type: "SUSPICIOUS_DNS", src: "10.0.0.33",      dst: "8.8.8.8",      mitre: "T1071", time: "14:24:31", status: "resolved"     },
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

export default function Dashboard() {
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const utcTime = clock.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  return (
    <div className="p-5 md:p-8 space-y-8">

      {/* ── Main content ──────────────────────────────────────────────── */}
        

        {/* Page content */}
        <div className="space-y-8">
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
              {MOCK_ALERTS.map((alert, i) => (
                <AlertRow key={alert.id} alert={alert} even={i % 2 === 0} />
              ))}
            </div>
          </section>
        </div>
      </div>
  );
}

/* ── Sub-components ───────────────────────────────────────────────────── */
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

/* ── Icons ────────────────────────────────────────────────────────────── */

function StatIcon({ name }) {
  const props = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "#94a3b8", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "pulse")  return <svg {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
  if (name === "bell")   return <svg {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
  if (name === "shield") return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
  if (name === "folder") return <svg {...props}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>;
  return null;
}
