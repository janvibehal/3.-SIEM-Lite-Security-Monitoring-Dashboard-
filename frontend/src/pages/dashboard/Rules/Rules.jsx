/**
 * src/pages/dashboard/rules/Rules.jsx
 *
 * Detection Rules management page.
 * Connects to /api/v1/rules
 */

import { useState, useEffect, useCallback } from "react";
import { Code2, Plus, Pencil, Trash2, Eye, RefreshCw, ToggleLeft, ToggleRight, Shield } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { ruleService } from "../../../services/api";
import {
  T, PageHeader, StatCard, SearchBar, SelectInput, DataTable, Pagination,
  SeverityBadge, ConfirmModal, Modal, FormInput, FormTextarea, FormSelect,
  Btn, EmptyState, ErrorState, formatDate, timeAgo, LoadingSpinner,
} from "../../../components/ui/shared";
import { useToast, Toast } from "../../../components/ui/Toast";

const SEVERITIES = ["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
const PAGE_SIZE = 15;
const EMPTY_FORM = {
  name: "",
  description: "",
  eventType: "",
  threshold: 5,
  timeWindow: 300,
  severity: "MEDIUM",
  enabled: true,
};

export default function RulesPage() {
  const { accessToken, user } = useAuth();
  const { toast, showToast, clearToast } = useToast();

  const [rules, setRules] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState("ALL");
  const [enabledFilter, setEnabledFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [detailRule, setDetailRule] = useState(null);
  const [editRule, setEditRule] = useState(null);
  const [deleteRule, setDeleteRule] = useState(null);
  const [formValues, setFormValues] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const canWrite = user?.role === "ADMIN" || user?.role === "ANALYST";
  const canDelete = user?.role === "ADMIN";

  const fetchRules = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (search) params.search = search;
      if (sevFilter !== "ALL") params.severity = sevFilter;
      if (enabledFilter !== "ALL") params.enabled = enabledFilter === "ENABLED";
      const res = await ruleService.getAll(accessToken, params);
      const data = res.data ?? res;
      const items = Array.isArray(data) ? data : (data.rules ?? data.items ?? []);
      setRules(items);
      setTotal(data.total ?? data.totalCount ?? items.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, search, sevFilter, enabledFilter]);

  useEffect(() => { fetchRules(); }, [fetchRules]);
  useEffect(() => { setPage(1); }, [search, sevFilter, enabledFilter]);

  const validate = () => {
    const e = {};
    if (!formValues.name.trim()) e.name = "Name is required";
    if (!formValues.eventType.trim()) e.eventType = "Event type is required";
    if (!formValues.threshold || formValues.threshold < 1) e.threshold = "Threshold must be ≥ 1";
    if (!formValues.timeWindow || formValues.timeWindow < 1) e.timeWindow = "Time window must be ≥ 1 second";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setFormLoading(true);
    try {
      const body = {
        ...formValues,
        threshold: parseInt(formValues.threshold),
        timeWindow: parseInt(formValues.timeWindow),
      };
      if (editRule?.id) {
        await ruleService.update(accessToken, editRule.id, body);
        showToast("Rule updated successfully", "success");
      } else {
        await ruleService.create(accessToken, body);
        showToast("Rule created successfully", "success");
      }
      setEditRule(null);
      fetchRules();
    } catch (err) {
      showToast(err.message || "Operation failed", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await ruleService.delete(accessToken, deleteRule.id);
      showToast("Rule deleted", "success");
      setDeleteRule(null);
      fetchRules();
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (rule) => {
    try {
      await ruleService.update(accessToken, rule.id, { enabled: !rule.enabled });
      showToast(`Rule ${rule.enabled ? "disabled" : "enabled"}`, "success");
      fetchRules();
    } catch (err) {
      showToast(err.message || "Toggle failed", "error");
    }
  };

  const openCreate = () => {
    setFormValues(EMPTY_FORM);
    setFormErrors({});
    setEditRule({});
  };

  const openEdit = (rule) => {
    setFormValues({
      name: rule.name,
      description: rule.description || "",
      eventType: rule.eventType,
      threshold: rule.threshold,
      timeWindow: rule.timeWindow,
      severity: rule.severity,
      enabled: rule.enabled,
    });
    setFormErrors({});
    setEditRule(rule);
  };

  const enabledCount = rules.filter((r) => r.enabled).length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const columns = [
    {
      key: "name",
      label: "Rule Name",
      render: (v, row) => (
        <div>
          <p className="text-zinc-100 font-medium">{v}</p>
          <p className="text-zinc-600 text-[10px]">{row.eventType}</p>
        </div>
      ),
    },
    {
      key: "severity",
      label: "Severity",
      render: (v) => <SeverityBadge severity={v} />,
    },
    {
      key: "threshold",
      label: "Threshold",
      render: (v, row) => (
        <span className="text-zinc-400">
          {v}x in {row.timeWindow}s
        </span>
      ),
    },
    {
      key: "enabled",
      label: "Status",
      render: (v) => (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide font-semibold"
          style={{
            color: v ? T.success : T.muted,
            background: v ? `${T.success}18` : `${T.muted}18`,
            border: `1px solid ${v ? T.success : T.muted}30`,
          }}
        >
          {v ? "Enabled" : "Disabled"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (v) => <span className="text-zinc-600">{formatDate(v)}</span>,
    },
    {
      key: "actions",
      label: "",
      render: (_, row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setDetailRule(row)}
            className="p-1.5 text-zinc-600 hover:text-zinc-200 hover:bg-[#2A2F36] rounded transition-colors"
            title="View"
          >
            <Eye size={13} />
          </button>
          {canWrite && (
            <>
              <button
                onClick={() => handleToggle(row)}
                className={`p-1.5 rounded transition-colors ${row.enabled ? "text-zinc-500 hover:text-amber-400 hover:bg-amber-400/10" : "text-zinc-600 hover:text-emerald-400 hover:bg-emerald-400/10"}`}
                title={row.enabled ? "Disable" : "Enable"}
              >
                {row.enabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
              </button>
              <button
                onClick={() => openEdit(row)}
                className="p-1.5 text-zinc-600 hover:text-[#c9a36c] hover:bg-[#c9a36c]/10 rounded transition-colors"
                title="Edit"
              >
                <Pencil size={13} />
              </button>
            </>
          )}
          {canDelete && (
            <button
              onClick={() => setDeleteRule(row)}
              className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <PageHeader
        title="Detection Rules"
        subtitle={`${enabledCount} enabled / ${total} total`}
        icon={Shield}
        actions={
          <div className="flex items-center gap-2">
            <Btn variant="ghost" icon={RefreshCw} onClick={fetchRules} loading={loading}>
              Refresh
            </Btn>
            {canWrite && (
              <Btn icon={Plus} onClick={openCreate}>
                Create Rule
              </Btn>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Rules" value={total} icon={Shield} color={T.accent} />
        <StatCard label="Enabled" value={enabledCount} icon={ToggleRight} color={T.success} />
        <StatCard label="Disabled" value={total - enabledCount} icon={ToggleLeft} color={T.muted} />
        <StatCard
          label="Critical Rules"
          value={rules.filter((r) => r.severity === "CRITICAL").length}
          icon={Shield}
          color={T.danger}
        />
      </div>

      {/* Filters + Table */}
      <div className="bg-[#1C2026] border border-[#2A2F36] rounded-xl">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#2A2F36]">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search rules…"
            className="flex-1 min-w-[200px]"
          />
          <SelectInput
            value={sevFilter}
            onChange={setSevFilter}
            options={[
              { value: "ALL", label: "All Severities" },
              ...SEVERITIES.map((s) => ({ value: s, label: s })),
            ]}
          />
          <SelectInput
            value={enabledFilter}
            onChange={setEnabledFilter}
            options={[
              { value: "ALL", label: "All Status" },
              { value: "ENABLED", label: "Enabled" },
              { value: "DISABLED", label: "Disabled" },
            ]}
          />
        </div>

        {error ? (
          <ErrorState message={error} onRetry={fetchRules} />
        ) : (
          <DataTable
            columns={columns}
            data={rules}
            loading={loading}
            onRowClick={setDetailRule}
            emptyState={
              <EmptyState
                icon={Shield}
                title="No detection rules"
                description="Create your first rule to start detecting threats"
                action={canWrite && <Btn icon={Plus} onClick={openCreate}>Create Rule</Btn>}
              />
            }
          />
        )}

        <div className="px-4 pb-4">
          <Pagination page={page} totalPages={totalPages} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!detailRule} title="Rule Details" onClose={() => setDetailRule(null)} width="max-w-xl">
        {detailRule && <RuleDetail rule={detailRule} />}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        open={!!editRule}
        title={editRule?.id ? "Edit Rule" : "Create Detection Rule"}
        onClose={() => setEditRule(null)}
        width="max-w-xl"
      >
        <div className="flex flex-col gap-4">
          <FormInput
            label="Rule Name"
            required
            placeholder="e.g. Brute Force Login Detection"
            value={formValues.name}
            onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
            error={formErrors.name}
          />
          <FormTextarea
            label="Description"
            placeholder="Optional description"
            rows={3}
            value={formValues.description}
            onChange={(e) => setFormValues((p) => ({ ...p, description: e.target.value }))}
          />
          <FormInput
            label="Event Type"
            required
            placeholder="e.g. FAILED_LOGIN, PORT_SCAN, PRIVILEGE_ESCALATION"
            value={formValues.eventType}
            onChange={(e) => setFormValues((p) => ({ ...p, eventType: e.target.value }))}
            error={formErrors.eventType}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Threshold (count)"
              required
              type="number"
              min={1}
              value={formValues.threshold}
              onChange={(e) => setFormValues((p) => ({ ...p, threshold: e.target.value }))}
              error={formErrors.threshold}
            />
            <FormInput
              label="Time Window (seconds)"
              required
              type="number"
              min={1}
              value={formValues.timeWindow}
              onChange={(e) => setFormValues((p) => ({ ...p, timeWindow: e.target.value }))}
              error={formErrors.timeWindow}
            />
          </div>
          <FormSelect
            label="Severity"
            required
            value={formValues.severity}
            onChange={(e) => setFormValues((p) => ({ ...p, severity: e.target.value }))}
            options={SEVERITIES.map((s) => ({ value: s, label: s }))}
          />
          <div className="flex items-center gap-3 pt-1">
            <input
              id="enabled-toggle"
              type="checkbox"
              checked={formValues.enabled}
              onChange={(e) => setFormValues((p) => ({ ...p, enabled: e.target.checked }))}
              className="w-4 h-4 rounded accent-[#c9a36c]"
            />
            <label htmlFor="enabled-toggle" className="text-xs font-mono text-zinc-400 cursor-pointer">
              Enable rule immediately
            </label>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#2A2F36]">
            <Btn variant="ghost" onClick={() => setEditRule(null)}>Cancel</Btn>
            <Btn onClick={handleSubmit} loading={formLoading}>
              {editRule?.id ? "Save Changes" : "Create Rule"}
            </Btn>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteRule}
        title="Delete Rule"
        message={`Delete "${deleteRule?.name}"? All alerts generated by this rule will also be removed.`}
        confirmLabel="Delete Rule"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteRule(null)}
        loading={deleteLoading}
      />

      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={clearToast} />}
    </div>
  );
}

function RuleDetail({ rule }) {
  const fields = [
    { label: "Name", value: rule.name },
    { label: "Event Type", value: rule.eventType },
    { label: "Severity", value: <SeverityBadge severity={rule.severity} /> },
    { label: "Threshold", value: `${rule.threshold} occurrences` },
    { label: "Time Window", value: `${rule.timeWindow} seconds` },
    { label: "Status", value: rule.enabled ? "Enabled" : "Disabled" },
    { label: "Created", value: formatDate(rule.createdAt) },
    { label: "Last Updated", value: formatDate(rule.updatedAt) },
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
      {rule.description && (
        <div>
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-1">Description</p>
          <p className="text-xs font-mono text-zinc-300 leading-relaxed">{rule.description}</p>
        </div>
      )}
    </div>
  );
}