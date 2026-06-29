/**
 * src/pages/admin/Users.jsx
 *
 * User Management — Admin only.
 * Connects to /api/v1/users (needs registering in server.ts)
 */

import { useState, useEffect, useCallback } from "react";
import { Users, RefreshCw, Lock, Unlock, Trash2, Pencil, Eye, Key } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { userService } from "../../../services/api";
import {
  T, PageHeader, StatCard, SearchBar, DataTable, Pagination,
  StatusBadge, ConfirmModal, Modal, FormSelect,
  Btn, EmptyState, ErrorState, formatDate, timeAgo, LoadingSpinner,
} from "../../../components/ui/shared";
import { useToast, Toast } from "../../../components/ui/Toast";

const PAGE_SIZE = 15;
const ROLES = ["ADMIN", "ANALYST", "OPERATOR", "VIEWER"];

const ROLE_META = {
  ADMIN: { label: "Admin", color: T.danger },
  ANALYST: { label: "Analyst", color: T.warning },
  OPERATOR: { label: "Operator", color: T.accent },
  VIEWER: { label: "Viewer", color: T.muted },
};

const STATUS_META = {
  true: { label: "Active", color: T.success },
  false: { label: "Locked", color: T.danger },
};

export default function UsersPage() {
  const { accessToken, user: currentUser } = useAuth();
  const { toast, showToast, clearToast } = useToast();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [detailUser, setDetailUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { type, user }
  const [actionLoading, setActionLoading] = useState(null);
  const [editRole, setEditRole] = useState("VIEWER");
  const [editLoading, setEditLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (search) params.search = search;
      const res = await userService.getAll(accessToken, params);
      const data = res.data ?? res;
      const items = Array.isArray(data) ? data : (data.users ?? data.items ?? []);
      setUsers(items);
      setTotal(data.total ?? data.totalCount ?? items.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [search]);

  const handleAction = async (type, user) => {
    setActionLoading(`${user.id}_${type}`);
    try {
      if (type === "lock") await userService.lock(accessToken, user.id);
      else if (type === "unlock") await userService.unlock(accessToken, user.id);
      else if (type === "delete") await userService.delete(accessToken, user.id);
      else if (type === "resetPassword") await userService.resetPassword(accessToken, user.id);
      showToast(`User ${type === "lock" ? "locked" : type === "unlock" ? "unlocked" : type === "delete" ? "deleted" : "password reset sent"}`, "success");
      setConfirmModal(null);
      fetchUsers();
    } catch (err) {
      showToast(err.message || "Action failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditRole = async () => {
    if (!editUser) return;
    setEditLoading(true);
    try {
      await userService.update(accessToken, editUser.id, { role: editRole });
      showToast("Role updated", "success");
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      showToast(err.message || "Update failed", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const activeCount = users.filter((u) => u.isActive).length;

  const columns = [
    {
      key: "username",
      label: "Username",
      render: (v, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#2A2F36] flex items-center justify-center text-[11px] font-bold text-zinc-400 flex-shrink-0">
            {v?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-zinc-100 font-medium">{v}</p>
            <p className="text-zinc-600 text-[10px]">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (v) => <StatusBadge status={v} map={ROLE_META} />,
    },
    {
      key: "isActive",
      label: "Status",
      render: (v) => <StatusBadge status={String(v)} map={STATUS_META} />,
    },
    {
      key: "emailVerified",
      label: "Verified",
      render: (v) => (
        <span className={`text-[10px] font-mono ${v ? "text-emerald-400" : "text-zinc-600"}`}>
          {v ? "Verified" : "Pending"}
        </span>
      ),
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (v) => <span className="text-zinc-600">{v ? timeAgo(v) : "Never"}</span>,
    },
    {
      key: "actions",
      label: "",
      render: (_, row) => {
        const isSelf = row.id === currentUser?.id;
        return (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setDetailUser(row)}
              className="p-1.5 text-zinc-600 hover:text-zinc-200 hover:bg-[#2A2F36] rounded transition-colors"
              title="View"
            >
              <Eye size={13} />
            </button>
            {!isSelf && (
              <>
                <button
                  onClick={() => { setEditUser(row); setEditRole(row.role); }}
                  className="p-1.5 text-zinc-600 hover:text-[#c9a36c] hover:bg-[#c9a36c]/10 rounded transition-colors"
                  title="Edit Role"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setConfirmModal({ type: row.isActive ? "lock" : "unlock", user: row })}
                  className={`p-1.5 rounded transition-colors ${
                    row.isActive
                      ? "text-zinc-600 hover:text-amber-400 hover:bg-amber-400/10"
                      : "text-zinc-600 hover:text-emerald-400 hover:bg-emerald-400/10"
                  }`}
                  title={row.isActive ? "Lock Account" : "Unlock Account"}
                >
                  {row.isActive ? <Lock size={13} /> : <Unlock size={13} />}
                </button>
                <button
                  onClick={() => setConfirmModal({ type: "resetPassword", user: row })}
                  className="p-1.5 text-zinc-600 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                  title="Reset Password"
                >
                  <Key size={13} />
                </button>
                <button
                  onClick={() => setConfirmModal({ type: "delete", user: row })}
                  className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  title="Delete User"
                >
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const confirmMessages = {
    lock: `Lock "${confirmModal?.user?.username}"? They will not be able to log in.`,
    unlock: `Unlock "${confirmModal?.user?.username}"? They will regain access.`,
    delete: `Permanently delete "${confirmModal?.user?.username}"? This cannot be undone.`,
    resetPassword: `Send a password reset email to "${confirmModal?.user?.username}"?`,
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <PageHeader
        title="User Management"
        subtitle={`${total} users · Admin only`}
        icon={Users}
        actions={
          <button
            onClick={fetchUsers}
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Users" value={total} icon={Users} color={T.accent} />
        <StatCard label="Active" value={activeCount} icon={Users} color={T.success} />
        <StatCard label="Locked" value={total - activeCount} icon={Lock} color={T.danger} />
        <StatCard label="Admins" value={users.filter((u) => u.role === "ADMIN").length} icon={Users} color={T.warning} />
      </div>

      <div className="bg-[#1C2026] border border-[#2A2F36] rounded-xl">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#2A2F36]">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search username, email…"
            className="flex-1 min-w-[200px]"
          />
        </div>

        {error ? (
          <ErrorState
            message={`${error}${error.includes("404") || error.includes("Cannot GET") ? " — User management endpoint may not be registered in server.ts yet." : ""}`}
            onRetry={fetchUsers}
          />
        ) : (
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            onRowClick={setDetailUser}
            emptyState={<EmptyState icon={Users} title="No users found" />}
          />
        )}

        <div className="px-4 pb-4">
          <Pagination page={page} totalPages={totalPages} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!detailUser} title="User Details" onClose={() => setDetailUser(null)} width="max-w-lg">
        {detailUser && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Username", value: detailUser.username },
              { label: "Email", value: detailUser.email },
              { label: "Role", value: <StatusBadge status={detailUser.role} map={ROLE_META} /> },
              { label: "Status", value: <StatusBadge status={String(detailUser.isActive)} map={STATUS_META} /> },
              { label: "Email Verified", value: detailUser.emailVerified ? "Yes" : "No" },
              { label: "Organization", value: detailUser.organizationId },
              { label: "Last Login", value: detailUser.lastLogin ? formatDate(detailUser.lastLogin) : "Never" },
              { label: "Created At", value: formatDate(detailUser.createdAt) },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-1">
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">{label}</p>
                <div className="text-xs font-mono text-zinc-200">{value ?? "—"}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Edit Role Modal */}
      <Modal open={!!editUser} title={`Edit Role — ${editUser?.username}`} onClose={() => setEditUser(null)}>
        <div className="flex flex-col gap-4">
          <FormSelect
            label="Role"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
            options={ROLES.map((r) => ({ value: r, label: r }))}
          />
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#2A2F36]">
            <Btn variant="ghost" onClick={() => setEditUser(null)}>Cancel</Btn>
            <Btn onClick={handleEditRole} loading={editLoading}>Save Role</Btn>
          </div>
        </div>
      </Modal>

      {/* Confirm Action Modal */}
      <ConfirmModal
        open={!!confirmModal}
        title={
          confirmModal?.type === "delete" ? "Delete User" :
          confirmModal?.type === "lock" ? "Lock Account" :
          confirmModal?.type === "unlock" ? "Unlock Account" : "Reset Password"
        }
        message={confirmMessages[confirmModal?.type] ?? "Are you sure?"}
        confirmLabel={
          confirmModal?.type === "delete" ? "Delete" :
          confirmModal?.type === "lock" ? "Lock" :
          confirmModal?.type === "unlock" ? "Unlock" : "Send Reset"
        }
        danger={confirmModal?.type === "delete" || confirmModal?.type === "lock"}
        onConfirm={() => handleAction(confirmModal.type, confirmModal.user)}
        onCancel={() => setConfirmModal(null)}
        loading={!!actionLoading}
      />

      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={clearToast} />}
    </div>
  );
}