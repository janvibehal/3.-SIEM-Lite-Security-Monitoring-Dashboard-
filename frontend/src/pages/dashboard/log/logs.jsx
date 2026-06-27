import React, { useState, useMemo } from "react";
import {
  ScrollText, Search, Filter, ChevronDown, X, Clock, Server,
  ChevronRight, ChevronLeft, RefreshCw, ArrowUpDown, Calendar,
  Tag, Hash, FileText, Code2, ShieldAlert, Copy, Check, AlignLeft
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Design tokens — inherited from existing app theme                  */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const SEVERITIES = ["critical", "high", "medium", "low", "info"];
const SEVERITY_META = {
  critical: { label: "Critical", color: T.danger },
  high: { label: "High", color: "#FB923C" },
  medium: { label: "Medium", color: T.warning },
  low: { label: "Low", color: T.accent },
  info: { label: "Info", color: T.muted },
};

const SOURCES = ["Firewall", "Windows Event Log", "Linux Auditd", "VPN Gateway", "Cloud Audit", "DNS Server", "Proxy"];
const DEVICES = [
  { name: "EDGE-FW-02", ip: "172.16.0.2" },
  { name: "DC-CORP-01", ip: "10.0.0.5" },
  { name: "WEB-PROD-04", ip: "10.12.4.18" },
  { name: "FIN-WS-221", ip: "10.20.6.91" },
  { name: "DB-CLUSTER-03", ip: "10.12.1.30" },
  { name: "VPN-GW-01", ip: "10.0.5.1" },
];

const MESSAGES = [
  "Failed password for invalid user admin from {ip} port {port} ssh2",
  "Connection accepted on port 443 from {ip}",
  "Firewall rule ALLOW_HTTPS matched, traffic forwarded",
  "User authentication succeeded for user jdoe",
  "DNS query for malicious-domain.example resolved",
  "Outbound connection blocked by policy: EGRESS_RESTRICT",
  "Account lockout threshold reached for user svc_backup",
  "File access denied: /etc/shadow by process bash",
  "VPN tunnel established for user remote_user_22",
  "Audit log cleared by administrator",
  "Process spawned: powershell.exe -enc <base64>",
  "Scheduled task created: UpdaterTask",
];

function pad(n) { return String(n).padStart(2, "0"); }

function makeLog(id) {
  const severity = SEVERITIES[(id * 13) % SEVERITIES.length];
  const source = SOURCES[(id * 5) % SOURCES.length];
  const device = DEVICES[id % DEVICES.length];
  const minsAgo = (id * 11) % (60 * 24 * 3);
  const ts = new Date(Date.now() - minsAgo * 60000);
  const ip = `${10 + (id % 50)}.${(id * 3) % 255}.${(id * 7) % 255}.${(id * 11) % 255}`;
  const port = 1024 + (id * 17) % 40000;
  const rawTemplate = MESSAGES[id % MESSAGES.length];
  const message = rawTemplate.replace("{ip}", ip).replace("{port}", port);

  return {
    id: `LOG-${String(100000 + id)}`,
    timestamp: ts,
    severity,
    source,
    device,
    message,
    sourceIp: ip,
    port,
    facility: ["auth", "kern", "daemon", "syslog"][id % 4],
    rawLog: `<134>1 ${ts.toISOString()} ${device.name} ${source.toLowerCase().replace(/\s/g, "-")}[${1000 + id}]: ${message}`,
    normalized: {
      event_type: severity === "critical" || severity === "high" ? "security.alert" : "system.event",
      host: device.name,
      host_ip: device.ip,
      source_ip: ip,
      source_port: port,
      facility: ["auth", "kern", "daemon", "syslog"][id % 4],
      severity_level: severity,
      message_normalized: message,
    },
    metadata: {
      "Ingest pipeline": "syslog-udp-514",
      "Parser": "grok/cef-v2",
      "Tenant": "default",
      "Index": "main",
      "Retention": "90 days",
    },
    relatedAlertCount: severity === "critical" ? 2 : severity === "high" ? 1 : 0,
    relatedAlert: severity === "critical" || severity === "high"
      ? { id: `ALT-${1000 + id}`, title: "Multiple Failed Logins From Single Source" }
      : null,
  };
}

const ALL_LOGS = Array.from({ length: 240 }, (_, i) => makeLog(i + 1));

/* ------------------------------------------------------------------ */
/*  Small primitives                                                   */
/* ------------------------------------------------------------------ */
function SeverityDot({ severity }) {
  const meta = SEVERITY_META[severity];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: meta.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

function timeAgo(date) {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmtTime(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
function fmtDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/* ------------------------------------------------------------------ */
/*  Filter dropdown                                                    */
/* ------------------------------------------------------------------ */
function FilterDropdown({ label, options, value, onChange, icon: Icon, width = "w-48" }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm transition-colors duration-150 hover:border-opacity-80"
        style={{
          borderColor: value !== "all" ? T.accent + "55" : T.border,
          background: value !== "all" ? "rgba(34,211,238,0.06)" : T.bgSecondary,
          color: value !== "all" ? T.accent : T.text,
        }}
      >
        {Icon && <Icon size={14} />}
        <span>{label}: {value === "all" ? "All" : current?.label}</span>
        <ChevronDown size={14} style={{ color: T.muted }} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className={`absolute top-full mt-2 left-0 z-20 ${width} max-h-72 overflow-y-auto rounded-xl border shadow-2xl animate-[fadeIn_0.15s_ease-out]`}
            style={{ background: T.card, borderColor: T.border }}
          >
            <button
              onClick={() => { onChange("all"); setOpen(false); }}
              className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-white/5 transition-colors"
              style={{ color: T.muted }}
            >
              All
            </button>
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
                style={{ color: T.text }}
              >
                {o.dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: o.dot }} />}
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const DATE_RANGES = [
  { value: "1h", label: "Last 1 hour" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

function rangeToMs(range) {
  switch (range) {
    case "1h": return 3600 * 1000;
    case "24h": return 24 * 3600 * 1000;
    case "7d": return 7 * 24 * 3600 * 1000;
    case "30d": return 30 * 24 * 3600 * 1000;
    default: return Infinity;
  }
}

/* ------------------------------------------------------------------ */
/*  Log detail drawer                                                  */
/* ------------------------------------------------------------------ */
function LogDetail({ log, onClose }) {
  const [tab, setTab] = useState("raw");
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl h-full overflow-y-auto border-l animate-[slideIn_0.25s_ease-out] flex flex-col"
        style={{ background: T.bg, borderColor: T.border }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-7 py-5 border-b backdrop-blur-xl"
          style={{ background: "rgba(15,17,21,0.92)", borderColor: T.border }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono" style={{ color: T.muted }}>{log.id}</span>
                <SeverityDot severity={log.severity} />
              </div>
              <h2 className="text-base font-medium leading-snug max-w-lg" style={{ color: T.text }}>{log.message}</h2>
              <p className="text-sm mt-1.5 flex items-center gap-1.5" style={{ color: T.muted }}>
                <Clock size={13} /> {fmtDate(log.timestamp)} {fmtTime(log.timestamp)} · {timeAgo(log.timestamp)}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl border transition-colors hover:bg-white/5 shrink-0" style={{ borderColor: T.border }}>
              <X size={16} style={{ color: T.muted }} />
            </button>
          </div>

          {log.relatedAlert && (
            <div
              className="flex items-center gap-2 mt-4 px-3.5 py-2.5 rounded-xl border text-sm"
              style={{ borderColor: T.danger + "33", background: "rgba(248,113,113,0.06)", color: T.danger }}
            >
              <ShieldAlert size={14} />
              Linked to alert <span className="font-medium">{log.relatedAlert.id}</span> — {log.relatedAlert.title}
            </div>
          )}
        </div>

        <div className="px-7 py-6 space-y-6 flex-1">
          {/* Key facts */}
          <section className="grid grid-cols-2 gap-3">
            <FactCard icon={Server} label="Device" value={log.device.name} sub={log.device.ip} />
            <FactCard icon={Tag} label="Source" value={log.source} />
            <FactCard icon={Hash} label="Source IP : Port" value={`${log.sourceIp}:${log.port}`} />
            <FactCard icon={FileText} label="Facility" value={log.facility} />
          </section>

          {/* Tabs */}
          <section>
            <div className="flex items-center gap-1 mb-3 p-1 rounded-xl border w-fit" style={{ borderColor: T.border, background: T.card }}>
              {[
                { id: "raw", label: "Raw log", icon: Code2 },
                { id: "normalized", label: "Normalized", icon: AlignLeft },
                { id: "metadata", label: "Metadata", icon: Tag },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: tab === t.id ? T.bgSecondary : "transparent",
                    color: tab === t.id ? T.text : T.muted,
                  }}
                >
                  <t.icon size={13} /> {t.label}
                </button>
              ))}
            </div>

            {tab === "raw" && (
              <div className="relative">
                <div
                  className="rounded-2xl border p-4 font-mono text-xs overflow-x-auto leading-relaxed"
                  style={{ background: "#0B0D10", borderColor: T.border, color: T.accent }}
                >
                  {log.rawLog}
                </div>
                <button
                  onClick={handleCopy}
                  className="absolute top-3 right-3 p-1.5 rounded-lg border transition-colors hover:bg-white/5"
                  style={{ borderColor: T.border, background: T.card }}
                >
                  {copied ? <Check size={13} style={{ color: T.success }} /> : <Copy size={13} style={{ color: T.muted }} />}
                </button>
              </div>
            )}

            {tab === "normalized" && (
              <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
                {Object.entries(log.normalized).map(([k, v], i) => (
                  <div
                    key={k}
                    className="flex items-center justify-between px-4 py-2.5 text-sm"
                    style={{ borderBottom: i < Object.entries(log.normalized).length - 1 ? `1px solid ${T.border}` : "none" }}
                  >
                    <span className="font-mono text-xs" style={{ color: T.muted }}>{k}</span>
                    <span className="font-mono text-xs text-right max-w-[60%] truncate" style={{ color: T.text }}>{String(v)}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === "metadata" && (
              <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
                {Object.entries(log.metadata).map(([k, v], i) => (
                  <div
                    key={k}
                    className="flex items-center justify-between px-4 py-2.5 text-sm"
                    style={{ borderBottom: i < Object.entries(log.metadata).length - 1 ? `1px solid ${T.border}` : "none" }}
                  >
                    <span style={{ color: T.muted }}>{k}</span>
                    <span style={{ color: T.text }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Timeline */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} style={{ color: T.accent }} />
              <h3 className="text-sm font-semibold" style={{ color: T.text }}>Timeline context</h3>
            </div>
            <div className="space-y-0">
              {[
                { t: "Log received", time: log.timestamp, detail: `Ingested via ${log.source}` },
                { t: "Parsed & normalized", time: new Date(log.timestamp.getTime() + 200), detail: "Applied parser grok/cef-v2" },
                ...(log.relatedAlert ? [{ t: "Correlated", time: new Date(log.timestamp.getTime() + 4000), detail: `Matched rule, generated ${log.relatedAlert.id}` }] : []),
              ].map((step, i, arr) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded-full mt-1.5" style={{ background: T.accent }} />
                    {i < arr.length - 1 && <span className="w-px flex-1 my-1" style={{ background: T.border }} />}
                  </div>
                  <div className="pb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: T.text }}>{step.t}</span>
                      <span className="text-xs" style={{ color: T.muted }}>{fmtTime(step.time)}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: T.muted }}>{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function FactCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-xl border p-3.5" style={{ background: T.card, borderColor: T.border }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={12} style={{ color: T.muted }} />
        <span className="text-xs" style={{ color: T.muted }}>{label}</span>
      </div>
      <div className="text-sm font-medium truncate font-mono" style={{ color: T.text }}>{value}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: T.muted }}>{sub}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty / loading states                                             */
/* ------------------------------------------------------------------ */
function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl border flex items-center justify-center mb-4" style={{ background: T.card, borderColor: T.border }}>
        <Search size={22} style={{ color: T.muted }} />
      </div>
      <h3 className="text-base font-semibold mb-1" style={{ color: T.text }}>No logs match this query</h3>
      <p className="text-sm mb-5" style={{ color: T.muted }}>Try a wider date range or clear a filter.</p>
      <button
        onClick={onReset}
        className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors hover:bg-white/5"
        style={{ borderColor: T.border, color: T.text }}
      >
        Clear filters
      </button>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: T.card, opacity: 1 - i * 0.04 }} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function LogsPage() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [dateRange, setDateRange] = useState("24h");
  const [sortDesc, setSortDesc] = useState(true);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 12;

  const filtered = useMemo(() => {
    const now = Date.now();
    const rangeMs = rangeToMs(dateRange);
    let result = ALL_LOGS.filter((l) => {
      if (now - l.timestamp.getTime() > rangeMs) return false;
      if (severityFilter !== "all" && l.severity !== severityFilter) return false;
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (deviceFilter !== "all" && l.device.name !== deviceFilter) return false;
      if (search && !`${l.message} ${l.id} ${l.sourceIp} ${l.device.name}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    result.sort((a, b) => (sortDesc ? b.timestamp - a.timestamp : a.timestamp - b.timestamp));
    return result;
  }, [search, severityFilter, sourceFilter, deviceFilter, dateRange, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const severityCounts = useMemo(() => {
    const c = {};
    SEVERITIES.forEach((s) => (c[s] = 0));
    filtered.forEach((l) => { c[l.severity] = (c[l.severity] || 0) + 1; });
    return c;
  }, [filtered]);

  function handleRefresh() {
    setLoading(true);
    setTimeout(() => setLoading(false), 700);
  }

  function clearFilters() {
    setSeverityFilter("all");
    setSourceFilter("all");
    setDeviceFilter("all");
    setSearch("");
    setPage(1);
  }

  return (
    <div className="min-h-screen w-full" style={{ background: T.bg }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideIn { from { transform: translateX(24px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
      `}</style>

      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center border"
                style={{ background: "rgba(34,211,238,0.08)", borderColor: T.accent + "33" }}
              >
                <ScrollText size={17} style={{ color: T.accent }} />
              </div>
              <h1 className="text-2xl font-semibold" style={{ color: T.text }}>Log Explorer</h1>
            </div>
            <p className="text-sm mt-2" style={{ color: T.muted }}>
              {filtered.length.toLocaleString()} events matched in the selected range
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:bg-white/5"
            style={{ borderColor: T.border, color: T.text }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Severity strip */}
        <div className="flex flex-wrap gap-3 mb-6">
          {SEVERITIES.map((s) => (
            <div
              key={s}
              className="flex-1 min-w-[120px] rounded-2xl border p-4 transition-colors duration-200"
              style={{ background: T.card, borderColor: T.border }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: T.muted }}>{SEVERITY_META[s].label}</span>
                <span className="w-2 h-2 rounded-full" style={{ background: SEVERITY_META[s].color }} />
              </div>
              <div className="text-2xl font-semibold" style={{ color: T.text }}>{severityCounts[s] || 0}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div
          className="flex flex-wrap items-center gap-3 mb-5 p-4 rounded-2xl border"
          style={{ background: T.bgSecondary, borderColor: T.border }}
        >
          <div className="relative flex-1 min-w-[240px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search raw logs, IPs, hosts, or IDs..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none transition-colors"
              style={{ background: T.bg, borderColor: T.border, color: T.text }}
            />
          </div>

          <FilterDropdown
            label="Date range"
            icon={Calendar}
            value={dateRange}
            onChange={(v) => { setDateRange(v); setPage(1); }}
            options={DATE_RANGES}
            width="w-44"
          />
          <FilterDropdown
            label="Severity"
            icon={Filter}
            value={severityFilter}
            onChange={(v) => { setSeverityFilter(v); setPage(1); }}
            options={SEVERITIES.map((s) => ({ value: s, label: SEVERITY_META[s].label, dot: SEVERITY_META[s].color }))}
          />
          <FilterDropdown
            label="Source"
            icon={Tag}
            value={sourceFilter}
            onChange={(v) => { setSourceFilter(v); setPage(1); }}
            options={SOURCES.map((s) => ({ value: s, label: s }))}
          />
          <FilterDropdown
            label="Device"
            icon={Server}
            value={deviceFilter}
            onChange={(v) => { setDeviceFilter(v); setPage(1); }}
            options={DEVICES.map((d) => ({ value: d.name, label: d.name }))}
          />
          <button
            onClick={() => setSortDesc((s) => !s)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm transition-colors hover:bg-white/5"
            style={{ borderColor: T.border, color: T.text }}
          >
            <ArrowUpDown size={14} /> {sortDesc ? "Newest" : "Oldest"}
          </button>

          {(severityFilter !== "all" || sourceFilter !== "all" || deviceFilter !== "all" || search) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-white/5"
              style={{ color: T.muted }}
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {/* Log table */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
          {loading ? (
            <LoadingRows />
          ) : pageItems.length === 0 ? (
            <EmptyState onReset={clearFilters} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left sticky top-0 z-10" style={{ background: T.bgSecondary }}>
                    {["Time", "Severity", "Source", "Device", "Message", ""].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 font-medium text-xs uppercase tracking-wide whitespace-nowrap"
                        style={{ color: T.muted, borderBottom: `1px solid ${T.border}` }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((l) => (
                    <tr
                      key={l.id}
                      onClick={() => setSelected(l)}
                      className="cursor-pointer transition-colors duration-150 hover:bg-white/[0.03]"
                      style={{ borderBottom: `1px solid ${T.border}` }}
                    >
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="font-mono text-xs" style={{ color: T.text }}>{fmtTime(l.timestamp)}</div>
                        <div className="text-[11px]" style={{ color: T.muted }}>{fmtDate(l.timestamp)}</div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap"><SeverityDot severity={l.severity} /></td>
                      <td className="px-5 py-3 whitespace-nowrap" style={{ color: T.muted }}>{l.source}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div style={{ color: T.text }}>{l.device.name}</div>
                        <div className="text-xs font-mono" style={{ color: T.muted }}>{l.sourceIp}</div>
                      </td>
                      <td className="px-5 py-3 max-w-md">
                        <div className="truncate font-mono text-xs" style={{ color: T.muted }}>{l.message}</div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <ChevronRight size={15} style={{ color: T.muted }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && pageItems.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t" style={{ borderColor: T.border }}>
              <span className="text-xs" style={{ color: T.muted }}>
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length.toLocaleString()}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border transition-colors hover:bg-white/5 disabled:opacity-30"
                  style={{ borderColor: T.border }}
                >
                  <ChevronLeft size={14} style={{ color: T.text }} />
                </button>
                <span className="text-xs px-2" style={{ color: T.muted }}>{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border transition-colors hover:bg-white/5 disabled:opacity-30"
                  style={{ borderColor: T.border }}
                >
                  <ChevronRight size={14} style={{ color: T.text }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && <LogDetail log={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}