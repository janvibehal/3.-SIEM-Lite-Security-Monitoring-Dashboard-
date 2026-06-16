/**
 * AuthLayout.jsx
 * Shared layout for login and register pages.
 * Dark SIEM/SOC aesthetic: deep navy background, cyan accent, monospace secondary.
 */

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* ── Left Panel: form ──────────────────────────────────────────── */}
      <div className="w-full lg:w-3/5 flex flex-col justify-center px-8 md:px-12 lg:px-14 py-12 relative z-10">
        {/* Brand mark */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-8">
            <SiemIcon />
            <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
              siem-lite / dtl soc
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white leading-tight">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>

        {children}

        {/* Footer */}
        <p className="mt-10 text-center text-xs text-slate-700 font-mono">
          SIEM Lite &bull; Internal SOC Platform &bull; v1.0
        </p>
      </div>

      {/* ── Right Panel: animated threat map visual ──────────────────── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-slate-900">
        <ThreatMapVisual />
      </div>
    </div>
  );
}

/* ── SIEM brand icon ─────────────────────────────────────────────────── */
function SiemIcon() {
  return (
    <div className="w-10 h-10 rounded bg-white/80 border border-cyan-500/30  flex items-center justify-center">
      <img
        src="/dtl-logo.png"
        alt="DTL Logo"
        className="w-10  object-contain"
      />
    </div>
  );
}

/* ── Animated right panel ────────────────────────────────────────────── */
function ThreatMapVisual() {
  // Static threat feed lines — realistic SOC aesthetic
  const lines = [
    { label: "BRUTE_FORCE",    src: "185.220.101.47",  dst: "10.0.0.14", sev: "CRIT",  mitre: "T1110" },
    { label: "PORT_SCAN",      src: "103.41.167.12",   dst: "10.0.0.5",  sev: "HIGH",  mitre: "T1046" },
    { label: "LATERAL_MOVE",   src: "10.0.0.22",       dst: "10.0.0.8",  sev: "HIGH",  mitre: "T1021" },
    { label: "PRIV_ESC",       src: "10.0.0.11",       dst: "DC-01",     sev: "CRIT",  mitre: "T1068" },
    { label: "SUSPICIOUS_DNS", src: "10.0.0.33",       dst: "8.8.8.8",   sev: "MED",   mitre: "T1071" },
    { label: "C2_BEACON",      src: "198.51.100.77",   dst: "10.0.0.19", sev: "CRIT",  mitre: "T1071" },
    { label: "DATA_EXFIL",     src: "10.0.0.7",        dst: "45.33.32.156", sev: "HIGH", mitre: "T1041" },
    { label: "AUTH_ANOMALY",   src: "10.0.0.44",       dst: "AD-SERVER", sev: "MED",   mitre: "T1078" },
  ];

  const sevColor = { CRIT: "#f87171", HIGH: "#fb923c", MED: "#facc15" };

  const stats = [
    { label: "Events/sec",   value: "4,218" },
    { label: "Active alerts", value: "23" },
    { label: "Blocked IPs",  value: "1,047" },
    { label: "MTTD (avg)",   value: "2m 14s" },
  ];

  return (
    <div className="absolute inset-0 flex flex-col justify-between p-10">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-5"
        
        style={{
          backgroundImage: "linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <img
  src="/dtl-logo.png"
  alt=""
  className="absolute inset-0 m-auto w-[500px] h-[500px] object-contain opacity-[0.09] pointer-events-none select-none z-0"
/>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl" />

      {/* Header */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-mono text-slate-500 tracking-widest">LIVE THREAT FEED</span>
        </div>
        <p className="text-slate-600 text-xs font-mono">
          {new Date().toISOString().replace("T", " ").slice(0, 19)} UTC
        </p>
      </div>

      {/* Live event log */}
      <div className="relative flex-1 flex flex-col justify-center space-y-1.5 my-8">
        {lines.map((line, i) => (
          <div
            key={i}
            className="flex items-center gap-2 font-mono text-xs"
            style={{ opacity: 1 - i * 0.08 }}
          >
            <span
              className="w-14 text-right text-[10px] font-bold tracking-wider shrink-0"
              style={{ color: sevColor[line.sev] }}
            >
              {line.sev}
            </span>
            <span className="text-slate-600">[{line.mitre}]</span>
            <span className="text-slate-400 truncate">
              {line.label}{" "}
              <span className="text-slate-600">{line.src} → {line.dst}</span>
            </span>
          </div>
        ))}

        {/* Blinking cursor */}
        <div className="flex items-center gap-2 font-mono text-xs mt-1">
          <span className="w-14" />
          <span className="text-cyan-500/40 animate-pulse">▋</span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="relative grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-3">
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{s.label}</p>
            <p className="text-lg font-bold text-white mt-0.5 font-mono">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}