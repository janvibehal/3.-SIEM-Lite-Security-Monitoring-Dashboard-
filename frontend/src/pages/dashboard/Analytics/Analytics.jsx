/**
 * src/pages/dashboard/analytics/Analytics.jsx
 *
 * Analytics page — charts and trends from real API data.
 * Uses: /api/v1/dashboard/* endpoints
 */

import { useState, useEffect } from "react";
import { BarChart2, RefreshCw, TrendingUp, Activity } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { useAuth } from "../../../context/AuthContext";
import { dashboardService } from "../../../services/api";
import {
  T, PageHeader, ChartCard, ErrorState, PageLoadingState, SeverityBadge,
} from "../../../components/ui/shared";
import { useToast, Toast } from "../../../components/ui/Toast";

const SEVERITY_COLORS = {
  CRITICAL: T.danger,
  HIGH: "#FB923C",
  MEDIUM: T.warning,
  LOW: T.accent,
  INFO: T.muted,
};

const customTooltipStyle = {
  contentStyle: { background: "#1C2026", border: "1px solid #2A2F36", borderRadius: 8, fontFamily: "monospace", fontSize: 11 },
  labelStyle: { color: T.muted },
};

export default function AnalyticsPage() {
  const { accessToken } = useAuth();
  const { toast, showToast, clearToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [severityDist, setSeverityDist] = useState([]);
  const [attackTrend, setAttackTrend] = useState([]);
  const [topDevices, setTopDevices] = useState([]);
  const [alertStats, setAlertStats] = useState({});
  const [logStats, setLogStats] = useState({});

  const fetchAll = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const [sev, trend, devices, alerts, logs] = await Promise.allSettled([
        dashboardService.getSeverityDistribution(accessToken),
        dashboardService.getAttackTrend(accessToken),
        dashboardService.getTopDevices(accessToken),
        dashboardService.getAlertStats(accessToken),
        dashboardService.getLogStats(accessToken),
      ]);

      if (sev.status === "fulfilled") {
        const d = sev.value.data ?? sev.value;
        setSeverityDist(
          Array.isArray(d)
            ? d
            : Object.entries(d).map(([name, value]) => ({ name, value, color: SEVERITY_COLORS[name.toUpperCase()] ?? T.muted }))
        );
      }
      if (trend.status === "fulfilled") {
        const d = trend.value.data ?? trend.value;
        setAttackTrend(Array.isArray(d) ? d : []);
      }
      if (devices.status === "fulfilled") {
        const d = devices.value.data ?? devices.value;
        setTopDevices(Array.isArray(d) ? d : []);
      }
      if (alerts.status === "fulfilled") {
        setAlertStats(alerts.value.data ?? alerts.value ?? {});
      }
      if (logs.status === "fulfilled") {
        setLogStats(logs.value.data ?? logs.value ?? {});
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [accessToken]);

  if (loading) return <div className="p-6"><PageLoadingState label="Loading analytics…" /></div>;
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={fetchAll} /></div>;

  // Build pie data from severity distribution
  const pieData = severityDist.length > 0
    ? severityDist.map((item) => ({
        name: item.name ?? item.severity,
        value: item.value ?? item.count ?? 0,
        color: SEVERITY_COLORS[(item.name ?? item.severity)?.toUpperCase()] ?? T.muted,
      }))
    : [
        { name: "CRITICAL", value: 0, color: T.danger },
        { name: "HIGH", value: 0, color: "#FB923C" },
        { name: "MEDIUM", value: 0, color: T.warning },
        { name: "LOW", value: 0, color: T.accent },
        { name: "INFO", value: 0, color: T.muted },
      ];

  // Build trend data
  const trendData = attackTrend.length > 0
    ? attackTrend
    : Array.from({ length: 14 }, (_, i) => ({
        date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        alerts: 0,
        logs: 0,
      }));

  // Top devices bar data
  const deviceBarData = topDevices.slice(0, 10).map((d) => ({
    name: d.name ?? d.device?.name ?? d.deviceId,
    alerts: d.alertCount ?? d.alerts ?? 0,
    logs: d.logCount ?? d.logs ?? 0,
  }));

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <PageHeader
        title="Analytics"
        subtitle="Security trends and patterns"
        icon={BarChart2}
        actions={
          <Btn variant="ghost" icon={RefreshCw} onClick={fetchAll} loading={loading}>
            Refresh
          </Btn>
        }
      />

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Alerts", value: alertStats.total ?? alertStats.totalAlerts ?? "—", color: T.danger },
          { label: "Open Alerts", value: alertStats.open ?? alertStats.openAlerts ?? "—", color: T.warning },
          { label: "Logs Today", value: logStats.today ?? logStats.logsToday ?? "—", color: T.accent },
          { label: "Total Logs", value: logStats.total ?? logStats.totalLogs ?? "—", color: T.muted },
        ].map((s) => (
          <div key={s.label} className="bg-[#1C2026] border border-[#2A2F36] rounded-xl p-4">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-3">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Row 1: Trend + Severity Pie */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <ChartCard title="Alert & Log Trend" subtitle="Last 14 days" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gAlerts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.danger} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={T.danger} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gLogs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.accent} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={T.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2F36" />
              <XAxis dataKey="date" tick={{ fill: T.muted, fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
              <Tooltip {...customTooltipStyle} />
              <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 11 }} />
              <Area type="monotone" dataKey="alerts" stroke={T.danger} fill="url(#gAlerts)" strokeWidth={2} name="Alerts" />
              <Area type="monotone" dataKey="logs" stroke={T.accent} fill="url(#gLogs)" strokeWidth={2} name="Logs" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Severity Distribution" subtitle="Alert breakdown by severity">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip {...customTooltipStyle} />
              <Legend
                wrapperStyle={{ fontFamily: "monospace", fontSize: 10 }}
                formatter={(v) => <span style={{ color: T.muted }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Top Devices Bar */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Top Attacked Devices" subtitle="By alert count">
          {deviceBarData.length === 0 ? (
            <div className="flex items-center justify-center h-[180px]">
              <p className="text-xs font-mono text-zinc-600">No device data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deviceBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2F36" horizontal={false} />
                <XAxis type="number" tick={{ fill: T.muted, fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: T.muted, fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} width={100} />
                <Tooltip {...customTooltipStyle} />
                <Bar dataKey="alerts" fill={T.danger} opacity={0.8} radius={[0, 4, 4, 0]} name="Alerts" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Log Volume" subtitle="Severity breakdown">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pieData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2F36" />
              <XAxis dataKey="name" tick={{ fill: T.muted, fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
              <Tooltip {...customTooltipStyle} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Count">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} opacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={clearToast} />}
    </div>
  );
}

function Btn({ children, variant = "ghost", icon: Icon, loading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-md font-mono text-xs px-4 py-2 transition-colors border ${
        variant === "ghost"
          ? "text-zinc-500 border-[#2A2F36] hover:text-zinc-200 hover:border-[#3a3f47]"
          : "bg-[#c9a36c]/20 text-[#c9a36c] border-[#c9a36c]/30 hover:bg-[#c9a36c]/30"
      } disabled:opacity-50`}
    >
      {loading ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ) : Icon ? (
        <Icon size={13} />
      ) : null}
      {children}
    </button>
  );
}