/**
 * src/pages/dashboard/incidents/Incidents.jsx
 *
 * Incident Management page.
 * NOTE: Backend /api/v1/incidents routes need to be registered in server.ts.
 * The schema (Incident model) exists in Prisma. This page gracefully handles
 * the API being unavailable and shows the error state.
 */

import { useState, useEffect, useCallback } from "react";
import { Siren, Plus, Eye, RefreshCw, UserCheck, CheckCircle2, RotateCcw, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { incidentService } from "../../../services/api";
import {
  T, PageHeader, StatCard, SearchBar, SelectInput, DataTable, Pagination,
  SeverityBadge, StatusBadge, ConfirmModal, Modal, FormInput, FormTextarea, FormSelect,
  Btn, EmptyState, ErrorState, formatDate, timeAgo, LoadingSpinner,
} from "../../../components/ui/shared";
import { useToast, Toast } from "../../../components/ui/Toast";

const SEVERITIES = ["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PAGE_SIZE = 15;

const STATUS_META = {
  OPEN: { label: "Open", color: T.danger },
  IN_PROGRESS: { label: "In Progress", color: T.warning },
  RESOLVED: { label: "Resolved", color: T.success },
  CLOSED: { label: "Closed", color: T.muted },
};

const EMPTY_FORM = { title: "", description: "", severity: "MEDIUM" };

export default function IncidentsPage() {
  const { accessToken, user } = useAuth();
  const { toast, showToast, clearToast } = useToast();

  const [incidents, setIncidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sevFilter, setSevFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [detailIncident, setDetailIncident] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [formValues, setFormValues] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const canWrite = user?.role === "ADMIN" || user?.role === "ANALYST";

  const fetchIncidents = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (search) params.search = search;
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (sevFilter !== "ALL") params.severity = sevFilter;
      const res = await incidentService.getAll(accessToken, params);
      const data = res.data ?? res;
      const items = Array.isArray(data) ? data : (data.incidents ?? data.items ?? []);
      setIncidents(items);
      setTotal(data.total ?? data.totalCount ?? items.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, search, statusFilter, sevFilter]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);
  useEffect(() => { setPage(1); }, [search, statusFilter, sevFilter]);

  const validate = () => {
    const e = {};
    if (!formValues.title.trim()) e.title = "Title is required";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setFormLoading(true);
    try {
      await incidentService.create(accessToken, formValues);
      showToast("Incident created", "success");
      setCreateOpen(false);
      setFormValues(EMPTY_FORM);
      fetchIncidents();
    } catch (err) {
      showToast(err.message || "Failed to create incident", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleClose = async (incident) => {
    setActionLoading(incident.id + "_close");
    try {
      await incidentService.close(accessToken, incident.id);
      showToast("Incident closed", "success");
      fetchIncidents();
      if (detailIncident?.id === incident.id) setDetailIncident(null);
    } catch (err) {
      showToast(err.message || "Failed to close incident", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReopen = async (incident) => {
    setActionLoading(incident.id + "_reopen");
    try {
      await incidentService.reopen(accessToken, incident.id);
      showToast("Incident reopened", "success");
      fetchIncidents();
    } catch (err) {
      showToast(err.message || "Failed to reopen incident", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const openCount = incidents.filter((i) => i.status === "OPEN").length;
  const inProgressCount = incidents.filter((i) => i.status === "IN_PROGRESS").length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (v, row) => (
        <div>
          <p className="text-zinc-100 font-medium truncate max-w-[250px]">{v}</p>
          {row.description && (
            <p className="text-zinc-600 text-[10px] truncate max-w-[250px]">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "severity",
      label: "Severity",
      render: (v) => <SeverityBadge severity={v} />,
    },
    {
      key: "status",
      label: "Status",
      render: (v) => <StatusBadge status={v} map={STATUS_META} />,
    },
    {
      key: "assignedTo",
      label: "Assigned To",
      render: (v) => (
        <span className="text-zinc-400">{v?.username ?? <span className="text-zinc-600 italic">Unassigned</span>}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (v) => <span className="text-zinc-600">{timeAgo(v)}</span>,
    },
    {
      key: "actions",
      label: "",
      render: (_, row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setDetailIncident(row)}
            className="p-1.5 text-zinc-600 hover:text-zinc-200 hover:bg-[#2A2F36] rounded transition-colors"
          >
            <Eye size={13} />
          </button>
          {canWrite && row.status !== "CLOSED" && row.status !== "RESOLVED" && (
            <button
              onClick={() => handleClose(row)}
              disabled={actionLoading === row.id + "_close"}
              className="p-1.5 text-zinc-600 hover:text-emerald-400 hover:bg-emerald-400/10 rounded transition-colors"
              title="Close incident"
            >
              {actionLoading === row.id + "_close" ? <LoadingSpinner size={13} /> : <CheckCircle2 size={13} />}
            </button>
          )}
          {canWrite && (row.status === "CLOSED" || row.status === "RESOLVED") && (
            <button
              onClick={() => handleReopen(row)}
              disabled={actionLoading === row.id + "_reopen"}
              className="p-1.5 text-zinc-600 hover:text-amber-400 hover:bg-amber-400/10 rounded transition-colors"
              title="Reopen incident"
            >
              {actionLoading === row.id + "_reopen" ? <LoadingSpinner size={13} /> : <RotateCcw size={13} />}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <PageHeader
        title="Incident Management"
        subtitle={`${openCount} open · ${inProgressCount} in progress`}
        icon={Siren}
        actions={
          <div className="flex items-center gap-2">
            <Btn variant="ghost" icon={RefreshCw} onClick={fetchIncidents} loading={loading}>Refresh</Btn>
            {canWrite && (
              <Btn icon={Plus} onClick={() => { setFormValues(EMPTY_FORM); setFormErrors({}); setCreateOpen(true); }}>
                New Incident
              </Btn>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total" value={total} icon={Siren} color={T.accent} />
        <StatCard label="Open" value={openCount} icon={Siren} color={T.danger} />
        <StatCard label="In Progress" value={inProgressCount} icon={UserCheck} color={T.warning} />
        <StatCard
          label="Resolved"
          value={incidents.filter((i) => i.status === "RESOLVED" || i.status === "CLOSED").length}
          icon={CheckCircle2}
          color={T.success}
        />
      </div>

      {/* Filters + Table */}
      <div className="bg-[#1C2026] border border-[#2A2F36] rounded-xl">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#2A2F36]">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search incidents…"
            className="flex-1 min-w-[200px]"
          />
          <SelectInput
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "ALL", label: "All Statuses" },
              ...STATUSES.map((s) => ({ value: s, label: STATUS_META[s]?.label ?? s })),
            ]}
          />
          <SelectInput
            value={sevFilter}
            onChange={setSevFilter}
            options={[
              { value: "ALL", label: "All Severities" },
              ...SEVERITIES.map((s) => ({ value: s, label: s })),
            ]}
          />
        </div>

        {error ? (
          <ErrorState
            message={`${error}${error.includes("404") || error.includes("Cannot GET") ? " — The incidents API endpoint may not be registered in server.ts yet." : ""}`}
            onRetry={fetchIncidents}
          />
        ) : (
          <DataTable
            columns={columns}
            data={incidents}
            loading={loading}
            onRowClick={setDetailIncident}
            emptyState={
              <EmptyState
                icon={Siren}
                title="No incidents found"
                description="Incidents are created manually or escalated from alerts"
                action={canWrite && <Btn icon={Plus} onClick={() => { setFormValues(EMPTY_FORM); setCreateOpen(true); }}>New Incident</Btn>}
              />
            }
          />
        )}

        <div className="px-4 pb-4">
          <Pagination page={page} totalPages={totalPages} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!detailIncident} title="Incident Details" onClose={() => setDetailIncident(null)} width="max-w-xl">
        {detailIncident && (
          <IncidentDetail
            incident={detailIncident}
            onClose={handleClose}
            onReopen={handleReopen}
            canWrite={canWrite}
            actionLoading={actionLoading}
          />
        )}
      </Modal>

      {/* Create Modal */}
      <Modal open={createOpen} title="Create Incident" onClose={() => setCreateOpen(false)}>
        <div className="flex flex-col gap-4">
          <FormInput
            label="Title"
            required
            placeholder="Brief incident description"
            value={formValues.title}
            onChange={(e) => setFormValues((p) => ({ ...p, title: e.target.value }))}
            error={formErrors.title}
          />
          <FormTextarea
            label="Description"
            placeholder="Detailed incident description"
            rows={4}
            value={formValues.description}
            onChange={(e) => setFormValues((p) => ({ ...p, description: e.target.value }))}
          />
          <FormSelect
            label="Severity"
            required
            value={formValues.severity}
            onChange={(e) => setFormValues((p) => ({ ...p, severity: e.target.value }))}
            options={SEVERITIES.map((s) => ({ value: s, label: s }))}
          />
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#2A2F36]">
            <Btn variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Btn>
            <Btn onClick={handleCreate} loading={formLoading}>Create Incident</Btn>
          </div>
        </div>
      </Modal>

      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={clearToast} />}
    </div>
  );
}

function IncidentDetail({ incident, onClose, onReopen, canWrite, actionLoading }) {
  const fields = [
    { label: "Title", value: incident.title },
    { label: "Severity", value: <SeverityBadge severity={incident.severity} /> },
    { label: "Status", value: <StatusBadge status={incident.status} map={{ OPEN: { label: "Open", color: T.danger }, IN_PROGRESS: { label: "In Progress", color: T.warning }, RESOLVED: { label: "Resolved", color: T.success }, CLOSED: { label: "Closed", color: T.muted } }} /> },
    { label: "Assigned To", value: incident.assignedTo?.username ?? "Unassigned" },
    { label: "Created By", value: incident.createdBy?.username ?? "—" },
    { label: "Created At", value: formatDate(incident.createdAt) },
    { label: "Last Updated", value: formatDate(incident.updatedAt) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-1">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">{label}</p>
            <div className="text-xs font-mono text-zinc-200">{value ?? "—"}</div>
          </div>
        ))}
      </div>

      {incident.description && (
        <div>
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-1">Description</p>
          <p className="text-xs font-mono text-zinc-300 leading-relaxed">{incident.description}</p>
        </div>
      )}

      {canWrite && (
        <div className="flex items-center gap-3 pt-3 border-t border-[#2A2F36]">
          {(incident.status === "OPEN" || incident.status === "IN_PROGRESS") && (
            <Btn
              variant="success"
              icon={CheckCircle2}
              loading={actionLoading === incident.id + "_close"}
              onClick={() => onClose(incident)}
            >
              Close Incident
            </Btn>
          )}
          {(incident.status === "CLOSED" || incident.status === "RESOLVED") && (
            <Btn
              variant="ghost"
              icon={RotateCcw}
              loading={actionLoading === incident.id + "_reopen"}
              onClick={() => onReopen(incident)}
            >
              Reopen
            </Btn>
          )}
        </div>
      )}
    </div>
  );
}