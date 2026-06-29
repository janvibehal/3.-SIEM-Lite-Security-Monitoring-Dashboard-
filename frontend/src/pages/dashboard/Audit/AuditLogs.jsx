/**
 * src/pages/dashboard/audit/AuditLogs.jsx
 *
 * Audit Logs page — read-only table with filters.
 * Connects to /api/v1/audit (needs registering in server.ts)
 */

import { useState, useEffect, useCallback } from "react";
import { Clock, RefreshCw, User, Activity } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { auditService } from "../../../services/api";
import {
  T, PageHeader, SearchBar, SelectInput, DataTable, Pagination,
  EmptyState, ErrorState, formatDate, timeAgo,
} from "../../../components/ui/shared";
import { useToast, Toast } from "../../../components/ui/Toast";

const PAGE_SIZE = 20;
const ACTIONS = ["LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE", "ACCESS", "EXPORT"];

export default function AuditLogsPage() {
  const { accessToken } = useAuth();
  const { toast, showToast, clearToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (search) params.search = search;
      if (actionFilter !== "ALL") params.action = actionFilter;
      const res = await auditService.getAll(accessToken, params);
      const data = res.data ?? res;
      const items = Array.isArray(data) ? data : (data.logs ?? data.auditLogs ?? data.items ?? []);
      setLogs(items);
      setTotal(data.total ?? data.totalCount ?? items.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, search, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { setPage(1); }, [search, actionFilter]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const actionColor = (action) => {
    const a = action?.toUpperCase();
    if (a === "DELETE") return T.danger;
    if (a === "CREATE") return T.success;
    if (a === "UPDATE") return T.warning;
    if (a === "LOGIN" || a === "LOGOUT") return T.accent;
    return T.muted;
  };

  const columns = [
    {
      key: "createdAt",
      label: "Timestamp",
      render: (v) => (
        <div>
          <p className="text-zinc-300">{formatDate(v)}</p>
          <p className="text-zinc-600 text-[10px]">{timeAgo(v)}</p>
        </div>
      ),
    },
    {
      key: "user",
      label: "User",
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#2A2F36] flex items-center justify-center text-[10px] font-bold text-zinc-400">
            {(v?.username ?? row.userId ?? "?")[0]?.toUpperCase()}
          </div>
          <span className="text-zinc-300">{v?.username ?? row.userId ?? "System"}</span>
        </div>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (v) => (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide font-semibold"
          style={{ color: actionColor(v), background: `${actionColor(v)}18`, border: `1px solid ${actionColor(v)}30` }}
        >
          {v}
        </span>
      ),
    },
    {
      key: "resource",
      label: "Resource",
      render: (v) => <span className="text-zinc-400">{v ?? "—"}</span>,
    },
    {
      key: "ipAddress",
      label: "IP Address",
      render: (v) => <span className="text-zinc-600 font-mono">{v ?? "—"}</span>,
    },
  ];

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <PageHeader
        title="Audit Logs"
        subtitle={`${total} audit events`}
        icon={Clock}
        actions={
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 border border-[#2A2F36] hover:text-zinc-200 hover:border-[#3a3f47] rounded-md px-4 py-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <RefreshCw size={13} />
            )}
            Refresh
          </button>
        }
      />

      <div className="bg-[#1C2026] border border-[#2A2F36] rounded-xl">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#2A2F36]">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by user, resource, action…"
            className="flex-1 min-w-[200px]"
          />
          <SelectInput
            value={actionFilter}
            onChange={setActionFilter}
            options={[
              { value: "ALL", label: "All Actions" },
              ...ACTIONS.map((a) => ({ value: a, label: a })),
            ]}
          />
        </div>

        {error ? (
          <ErrorState
            message={`${error}${error.includes("404") || error.includes("Cannot GET") ? " — Audit log endpoint may not be registered in server.ts yet." : ""}`}
            onRetry={fetchLogs}
          />
        ) : (
          <DataTable
            columns={columns}
            data={logs}
            loading={loading}
            emptyState={
              <EmptyState
                icon={Clock}
                title="No audit logs found"
                description={search ? "Try a different search term" : "Audit events will appear here as users take actions"}
              />
            }
          />
        )}

        <div className="px-4 pb-4">
          <Pagination page={page} totalPages={totalPages} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
      </div>

      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={clearToast} />}
    </div>
  );
}