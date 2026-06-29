/**
 * src/pages/dashboard/reports/Reports.jsx
 *
 * Reports page — generate daily/weekly/monthly reports.
 * NOTE: The backend report controller is a stub. This page provides the UI
 * and will work once the backend controller is implemented.
 * CSV export is handled client-side from available data.
 */

import { useState } from "react";
import { FileBarChart2, Download, RefreshCw, Calendar, Clock, FileText } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { alertService, logService, deviceService } from "../../../services/api";
import {
  T, PageHeader, StatCard, Btn, FormSelect, LoadingSpinner,
} from "../../../components/ui/shared";
import { useToast, Toast } from "../../../components/ui/Toast";

const REPORT_TYPES = [
  { value: "daily", label: "Daily Summary", icon: Clock, description: "Last 24 hours of alerts, logs, and incidents" },
  { value: "weekly", label: "Weekly Report", icon: Calendar, description: "Last 7 days of security events and trends" },
  { value: "monthly", label: "Monthly Overview", icon: FileBarChart2, description: "Full month security posture report" },
];

export default function ReportsPage() {
  const { accessToken } = useAuth();
  const { toast, showToast, clearToast } = useToast();

  const [selectedType, setSelectedType] = useState("daily");
  const [generating, setGenerating] = useState(false);
  const [lastReport, setLastReport] = useState(null);

  const generateReport = async () => {
    if (!accessToken) return;
    setGenerating(true);
    try {
      // Fetch data for the report
      const [alertsRes, logsRes, devicesRes] = await Promise.allSettled([
        alertService.getAll(accessToken, { limit: 100 }),
        logService.getAll(accessToken, { limit: 100 }),
        deviceService.getAll(accessToken, { limit: 100 }),
      ]);

      const alerts = alertsRes.status === "fulfilled"
        ? (() => { const d = alertsRes.value.data ?? alertsRes.value; return Array.isArray(d) ? d : d?.alerts ?? d?.items ?? []; })()
        : [];
      const logs = logsRes.status === "fulfilled"
        ? (() => { const d = logsRes.value.data ?? logsRes.value; return Array.isArray(d) ? d : d?.logs ?? d?.items ?? []; })()
        : [];
      const devices = devicesRes.status === "fulfilled"
        ? (() => { const d = devicesRes.value.data ?? devicesRes.value; return Array.isArray(d) ? d : d?.devices ?? d?.items ?? []; })()
        : [];

      const now = new Date();
      const report = {
        type: selectedType,
        generatedAt: now.toISOString(),
        period: selectedType,
        summary: {
          totalAlerts: alerts.length,
          criticalAlerts: alerts.filter((a) => a.severity === "CRITICAL").length,
          openAlerts: alerts.filter((a) => a.status === "OPEN").length,
          resolvedAlerts: alerts.filter((a) => a.status === "RESOLVED").length,
          totalLogs: logs.length,
          totalDevices: devices.length,
          onlineDevices: devices.filter((d) => d.status === "ONLINE").length,
        },
        alerts,
        logs: logs.slice(0, 50),
        devices,
      };

      setLastReport(report);
      showToast(`${REPORT_TYPES.find((r) => r.value === selectedType)?.label} generated`, "success");
    } catch (err) {
      showToast(err.message || "Failed to generate report", "error");
    } finally {
      setGenerating(false);
    }
  };

  const exportCSV = (type) => {
    if (!lastReport) return;

    let rows = [];
    let filename = "";

    if (type === "alerts") {
      filename = `alerts_${lastReport.period}_${new Date().toISOString().slice(0, 10)}.csv`;
      rows = [
        ["ID", "Title", "Severity", "Status", "Created At"],
        ...lastReport.alerts.map((a) => [
          a.id, a.title, a.severity, a.status, a.createdAt,
        ]),
      ];
    } else if (type === "logs") {
      filename = `logs_${lastReport.period}_${new Date().toISOString().slice(0, 10)}.csv`;
      rows = [
        ["ID", "Severity", "Source", "Message", "Event Timestamp"],
        ...lastReport.logs.map((l) => [
          l.id, l.severity, l.source, `"${(l.rawMessage ?? "").replace(/"/g, '""')}"`, l.eventTimestamp,
        ]),
      ];
    } else {
      filename = `devices_${lastReport.period}_${new Date().toISOString().slice(0, 10)}.csv`;
      rows = [
        ["ID", "Name", "Hostname", "IP", "Type", "Status"],
        ...lastReport.devices.map((d) => [
          d.id, d.name, d.hostname, d.ipAddress, d.deviceType, d.status,
        ]),
      ];
    }

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exported", "success");
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <PageHeader
        title="Reports"
        subtitle="Generate security reports and export data"
        icon={FileBarChart2}
      />

      {/* Report type selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {REPORT_TYPES.map((rt) => {
          const Icon = rt.icon;
          const active = selectedType === rt.value;
          return (
            <button
              key={rt.value}
              onClick={() => setSelectedType(rt.value)}
              className={`text-left p-5 rounded-xl border transition-colors ${
                active
                  ? "bg-[#1a1611] border-[#c9a36c]/40 text-[#c9a36c]"
                  : "bg-[#1C2026] border-[#2A2F36] text-zinc-400 hover:border-[#3a3f47] hover:text-zinc-200"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: active ? `${T.gold}20` : "#2A2F36" }}
                >
                  <Icon size={16} color={active ? T.gold : T.muted} />
                </div>
                <span className="text-sm font-semibold">{rt.label}</span>
              </div>
              <p className="text-xs font-mono opacity-70">{rt.description}</p>
            </button>
          );
        })}
      </div>

      {/* Generate button */}
      <div className="bg-[#1C2026] border border-[#2A2F36] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-200">
              Generate {REPORT_TYPES.find((r) => r.value === selectedType)?.label}
            </p>
            <p className="text-xs font-mono text-zinc-600 mt-1">
              {REPORT_TYPES.find((r) => r.value === selectedType)?.description}
            </p>
          </div>
          <button
            onClick={generateReport}
            disabled={generating}
            className="inline-flex items-center gap-2 bg-[#c9a36c]/20 text-[#c9a36c] border border-[#c9a36c]/30 hover:bg-[#c9a36c]/30 rounded-md px-5 py-2.5 text-sm font-mono font-medium transition-colors disabled:opacity-50"
          >
            {generating ? <LoadingSpinner size={14} /> : <RefreshCw size={14} />}
            {generating ? "Generating…" : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Report output */}
      {lastReport && (
        <div className="bg-[#1C2026] border border-[#2A2F36] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2F36]">
            <div>
              <p className="text-sm font-semibold text-zinc-100">
                {REPORT_TYPES.find((r) => r.value === lastReport.type)?.label}
              </p>
              <p className="text-[11px] font-mono text-zinc-600 mt-0.5">
                Generated {new Date(lastReport.generatedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-600 mr-2">Export:</span>
              {[
                { key: "alerts", label: "Alerts CSV" },
                { key: "logs", label: "Logs CSV" },
                { key: "devices", label: "Devices CSV" },
              ].map((e) => (
                <button
                  key={e.key}
                  onClick={() => exportCSV(e.key)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 border border-[#2A2F36] hover:border-[#3a3f47] hover:text-zinc-200 rounded-md px-3 py-1.5 transition-colors"
                >
                  <Download size={11} />
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary grid */}
          <div className="p-6">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-4">Executive Summary</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Total Alerts", value: lastReport.summary.totalAlerts, color: T.warning },
                { label: "Critical Alerts", value: lastReport.summary.criticalAlerts, color: T.danger },
                { label: "Total Logs", value: lastReport.summary.totalLogs, color: T.accent },
                { label: "Active Devices", value: lastReport.summary.onlineDevices + " / " + lastReport.summary.totalDevices, color: T.success },
              ].map((s) => (
                <div key={s.label} className="bg-[#171A1D] rounded-lg p-4 border border-[#2A2F36]">
                  <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-2">{s.label}</p>
                  <p className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Alert breakdown */}
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-3">Alert Status Breakdown</p>
            <div className="flex gap-4 mb-6 flex-wrap">
              {[
                { label: "Open", value: lastReport.summary.openAlerts, color: T.danger },
                { label: "Resolved", value: lastReport.summary.resolvedAlerts, color: T.success },
                { label: "Acknowledged", value: lastReport.summary.totalAlerts - lastReport.summary.openAlerts - lastReport.summary.resolvedAlerts, color: T.warning },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs font-mono text-zinc-400">
                    {s.label}: <span className="text-zinc-200 font-medium">{s.value}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Recent alerts table */}
            {lastReport.alerts.length > 0 && (
              <>
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-3">Recent Alerts</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-[#2A2F36]">
                        {["Title", "Severity", "Status", "Created"].map((h) => (
                          <th key={h} className="text-left px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lastReport.alerts.slice(0, 10).map((a) => (
                        <tr key={a.id} className="border-b border-[#2A2F36]/50">
                          <td className="px-3 py-2 text-zinc-300 truncate max-w-[200px]">{a.title}</td>
                          <td className="px-3 py-2">
                            <span className="text-[10px] uppercase font-semibold" style={{ color: { CRITICAL: T.danger, HIGH: "#FB923C", MEDIUM: T.warning, LOW: T.accent, INFO: T.muted }[a.severity] }}>
                              {a.severity}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-zinc-400">{a.status}</td>
                          <td className="px-3 py-2 text-zinc-600">{new Date(a.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={clearToast} />}
    </div>
  );
}