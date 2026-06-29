/**
 * src/pages/dashboard/devices/Devices.jsx
 *
 * Device Management — full CRUD with list, search, filter, pagination.
 * Connects to GET/POST/PATCH/DELETE /api/v1/devices
 */

import { useState, useEffect, useCallback } from "react";
import { Monitor, Plus, Pencil, Trash2, Eye, RefreshCw, Wifi, WifiOff, HelpCircle, Server } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { deviceService } from "../../../services/api";
import {
  T, PageHeader, StatCard, SearchBar, SelectInput, DataTable, Pagination,
  SeverityBadge, StatusBadge, ConfirmModal, Modal, FormInput, FormSelect,
  Btn, EmptyState, ErrorState, PageLoadingState, formatDate, timeAgo,
  DEVICE_STATUS_COLORS, LoadingSpinner,
} from "../../../components/ui/shared";
import { useToast, Toast } from "../../../components/ui/Toast";

/* ── Constants ────────────────────────────────────────────────────── */
const DEVICE_TYPES = ["SERVER", "WORKSTATION", "FIREWALL", "ROUTER", "SWITCH", "IDS", "CLOUD", "OTHER"];
const DEVICE_STATUSES = ["ONLINE", "OFFLINE", "UNKNOWN"];
const PAGE_SIZE = 15;

const STATUS_META = {
  ONLINE: { label: "Online", color: T.success },
  OFFLINE: { label: "Offline", color: T.danger },
  UNKNOWN: { label: "Unknown", color: T.muted },
};

const TYPE_ICONS = {
  SERVER: Server, WORKSTATION: Monitor, FIREWALL: Monitor,
  ROUTER: Monitor, SWITCH: Monitor, IDS: Monitor, CLOUD: Monitor, OTHER: Monitor,
};

/* ── Default form state ───────────────────────────────────────────── */
const EMPTY_FORM = { name: "", hostname: "", ipAddress: "", deviceType: "SERVER", status: "UNKNOWN" };

export default function DevicesPage() {
  const { accessToken, user } = useAuth();
  const { toast, showToast, clearToast } = useToast();

  /* list state */
  const [devices, setDevices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* filters */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  /* modals */
  const [detailDevice, setDetailDevice] = useState(null);
  const [editDevice, setEditDevice] = useState(null); // null=closed, {}=create, {id,...}=edit
  const [deleteDevice, setDeleteDevice] = useState(null);
  const [formValues, setFormValues] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* stats */
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0, unknown: 0 });

  const canWrite = user?.role === "ADMIN" || user?.role === "OPERATOR";
  const canDelete = user?.role === "ADMIN";

  /* ── Fetch ──────────────────────────────────────────────────────── */
  const fetchDevices = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (search) params.search = search;
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (typeFilter !== "ALL") params.deviceType = typeFilter;
      const res = await deviceService.getAll(accessToken, params);
      // Handle both paginated and array responses
      const data = res.data ?? res;
      const items = Array.isArray(data) ? data : (data.devices ?? data.items ?? []);
      const totalCount = data.total ?? data.totalCount ?? items.length;
      setDevices(items);
      setTotal(totalCount);
      // compute stats
      const all = items;
      setStats({
        total: totalCount,
        online: all.filter((d) => d.status === "ONLINE").length,
        offline: all.filter((d) => d.status === "OFFLINE").length,
        unknown: all.filter((d) => d.status === "UNKNOWN").length,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, search, statusFilter, typeFilter]);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);
  useEffect(() => { setPage(1); }, [search, statusFilter, typeFilter]);

  /* ── Validate form ──────────────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!formValues.name.trim()) e.name = "Name is required";
    if (!formValues.hostname.trim()) e.hostname = "Hostname is required";
    if (!formValues.ipAddress.trim()) e.ipAddress = "IP Address is required";
    else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(formValues.ipAddress.trim()))
      e.ipAddress = "Enter a valid IPv4 address";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit form ────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!validate()) return;
    setFormLoading(true);
    try {
      if (editDevice?.id) {
        await deviceService.update(accessToken, editDevice.id, formValues);
        showToast("Device updated successfully", "success");
      } else {
        await deviceService.create(accessToken, formValues);
        showToast("Device created successfully", "success");
      }
      setEditDevice(null);
      fetchDevices();
    } catch (err) {
      showToast(err.message || "Operation failed", "error");
    } finally {
      setFormLoading(false);
    }
  };

  /* ── Delete ─────────────────────────────────────────────────────── */
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deviceService.delete(accessToken, deleteDevice.id);
      showToast("Device deleted", "success");
      setDeleteDevice(null);
      fetchDevices();
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ── Open form helpers ──────────────────────────────────────────── */
  const openCreate = () => {
    setFormValues(EMPTY_FORM);
    setFormErrors({});
    setEditDevice({});
  };
  const openEdit = (device) => {
    setFormValues({
      name: device.name,
      hostname: device.hostname,
      ipAddress: device.ipAddress,
      deviceType: device.deviceType,
      status: device.status,
    });
    setFormErrors({});
    setEditDevice(device);
  };

  /* ── Columns ────────────────────────────────────────────────────── */
  const columns = [
    {
      key: "name",
      label: "Name",
      render: (v, row) => (
        <div>
          <p className="text-zinc-100 font-medium">{v}</p>
          <p className="text-zinc-600 text-[10px]">{row.hostname}</p>
        </div>
      ),
    },
    { key: "ipAddress", label: "IP Address" },
    {
      key: "deviceType",
      label: "Type",
      render: (v) => <span className="text-zinc-400">{v}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (v) => <StatusBadge status={v} map={STATUS_META} />,
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
            onClick={() => setDetailDevice(row)}
            className="p-1.5 text-zinc-600 hover:text-zinc-200 hover:bg-[#2A2F36] rounded transition-colors"
            title="View details"
          >
            <Eye size={13} />
          </button>
          {canWrite && (
            <button
              onClick={() => openEdit(row)}
              className="p-1.5 text-zinc-600 hover:text-[#c9a36c] hover:bg-[#c9a36c]/10 rounded transition-colors"
              title="Edit"
            >
              <Pencil size={13} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setDeleteDevice(row)}
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

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <PageHeader
        title="Device Inventory"
        subtitle={`${total} device${total !== 1 ? "s" : ""} registered`}
        icon={Monitor}
        actions={
          <div className="flex items-center gap-2">
            <Btn variant="ghost" icon={RefreshCw} onClick={fetchDevices} loading={loading}>
              Refresh
            </Btn>
            {canWrite && (
              <Btn icon={Plus} onClick={openCreate}>
                Add Device
              </Btn>
            )}
          </div>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total" value={stats.total} icon={Monitor} color={T.accent} />
        <StatCard label="Online" value={stats.online} icon={Wifi} color={T.success} />
        <StatCard label="Offline" value={stats.offline} icon={WifiOff} color={T.danger} />
        <StatCard label="Unknown" value={stats.unknown} icon={HelpCircle} color={T.muted} />
      </div>

      {/* Filters */}
      <div className="bg-[#1C2026] border border-[#2A2F36] rounded-xl mb-4">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#2A2F36]">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search name, hostname, IP…"
            className="flex-1 min-w-[200px]"
          />
          <SelectInput
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "ALL", label: "All Statuses" },
              ...DEVICE_STATUSES.map((s) => ({ value: s, label: s })),
            ]}
          />
          <SelectInput
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: "ALL", label: "All Types" },
              ...DEVICE_TYPES.map((t) => ({ value: t, label: t })),
            ]}
          />
        </div>

        {/* Table */}
        {error ? (
          <ErrorState message={error} onRetry={fetchDevices} />
        ) : (
          <DataTable
            columns={columns}
            data={devices}
            loading={loading}
            onRowClick={setDetailDevice}
            emptyState={
              <EmptyState
                icon={Monitor}
                title="No devices found"
                description={search ? "Try a different search term" : "Add your first device to get started"}
                action={
                  canWrite && !search ? (
                    <Btn icon={Plus} onClick={openCreate}>Add Device</Btn>
                  ) : null
                }
              />
            }
          />
        )}

        {/* Pagination */}
        <div className="px-4 pb-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* ── Detail Modal ─────────────────────────────────────────────── */}
      <Modal
        open={!!detailDevice}
        title="Device Details"
        onClose={() => setDetailDevice(null)}
        width="max-w-xl"
      >
        {detailDevice && <DeviceDetail device={detailDevice} token={accessToken} />}
      </Modal>

      {/* ── Create/Edit Modal ─────────────────────────────────────────── */}
      <Modal
        open={!!editDevice}
        title={editDevice?.id ? "Edit Device" : "Add Device"}
        onClose={() => setEditDevice(null)}
      >
        <div className="flex flex-col gap-4">
          <FormInput
            label="Name"
            required
            placeholder="e.g. PROD-WEB-01"
            value={formValues.name}
            onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
            error={formErrors.name}
          />
          <FormInput
            label="Hostname"
            required
            placeholder="e.g. prod-web-01.internal"
            value={formValues.hostname}
            onChange={(e) => setFormValues((p) => ({ ...p, hostname: e.target.value }))}
            error={formErrors.hostname}
          />
          <FormInput
            label="IP Address"
            required
            placeholder="e.g. 192.168.1.10"
            value={formValues.ipAddress}
            onChange={(e) => setFormValues((p) => ({ ...p, ipAddress: e.target.value }))}
            error={formErrors.ipAddress}
          />
          <FormSelect
            label="Device Type"
            required
            value={formValues.deviceType}
            onChange={(e) => setFormValues((p) => ({ ...p, deviceType: e.target.value }))}
            options={DEVICE_TYPES.map((t) => ({ value: t, label: t }))}
          />
          {editDevice?.id && (
            <FormSelect
              label="Status"
              value={formValues.status}
              onChange={(e) => setFormValues((p) => ({ ...p, status: e.target.value }))}
              options={DEVICE_STATUSES.map((s) => ({ value: s, label: s }))}
            />
          )}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#2A2F36]">
            <Btn variant="ghost" onClick={() => setEditDevice(null)}>Cancel</Btn>
            <Btn onClick={handleSubmit} loading={formLoading}>
              {editDevice?.id ? "Save Changes" : "Create Device"}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm ────────────────────────────────────────────── */}
      <ConfirmModal
        open={!!deleteDevice}
        title="Delete Device"
        message={`Are you sure you want to delete "${deleteDevice?.name}"? This will also delete all associated logs.`}
        confirmLabel="Delete Device"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteDevice(null)}
        loading={deleteLoading}
      />

      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={clearToast} />}
    </div>
  );
}

/* ── Device Detail Panel ──────────────────────────────────────────── */
function DeviceDetail({ device, token }) {
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const { logService } = require("../../../services/api");

  useEffect(() => {
    (async () => {
      try {
        const res = await import("../../../services/api").then((m) =>
          m.logService.getAll(token, { deviceId: device.id, limit: 5 })
        );
        const data = res.data ?? res;
        const items = Array.isArray(data) ? data : (data.logs ?? data.items ?? []);
        setLogs(items);
      } catch {
        setLogs([]);
      } finally {
        setLogsLoading(false);
      }
    })();
  }, [device.id, token]);

  const fields = [
    { label: "Name", value: device.name },
    { label: "Hostname", value: device.hostname },
    { label: "IP Address", value: device.ipAddress },
    { label: "Device Type", value: device.deviceType },
    { label: "Status", value: <StatusBadge status={device.status} map={{ ONLINE: { label: "Online", color: T.success }, OFFLINE: { label: "Offline", color: T.danger }, UNKNOWN: { label: "Unknown", color: T.muted } }} /> },
    { label: "Organization", value: device.organizationId },
    { label: "Created At", value: formatDate(device.createdAt) },
    { label: "Last Updated", value: formatDate(device.updatedAt) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-1">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">{label}</p>
            <div className="text-xs font-mono text-zinc-200">{value ?? "—"}</div>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-3">Recent Logs</p>
        {logsLoading ? (
          <div className="flex justify-center py-4"><LoadingSpinner size={16} /></div>
        ) : logs.length === 0 ? (
          <p className="text-xs text-zinc-600 font-mono">No recent logs</p>
        ) : (
          <div className="flex flex-col gap-1">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#171A1D] border border-[#2A2F36]">
                <SeverityBadge severity={log.severity} />
                <span className="text-xs font-mono text-zinc-300 flex-1 truncate">{log.rawMessage}</span>
                <span className="text-[10px] font-mono text-zinc-600">{timeAgo(log.eventTimestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}