/**
 * src/components/ui/shared.jsx
 *
 * Reusable components used across all dashboard modules.
 * Design tokens match existing app theme.
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, X, AlertTriangle } from "lucide-react";

/* ── Design Tokens ────────────────────────────────────────────────── */
export const T = {
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
  gold: "#c9a36c",
};

/* ── Severity helpers ─────────────────────────────────────────────── */
export const SEVERITY_META = {
  CRITICAL: { label: "Critical", color: T.danger, bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)" },
  HIGH: { label: "High", color: "#FB923C", bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.3)" },
  MEDIUM: { label: "Medium", color: T.warning, bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  LOW: { label: "Low", color: T.accent, bg: "rgba(34,211,238,0.1)", border: "rgba(34,211,238,0.3)" },
  INFO: { label: "Info", color: T.muted, bg: "rgba(161,161,170,0.1)", border: "rgba(161,161,170,0.3)" },
};

export const STATUS_COLORS = {
  OPEN: T.danger,
  ACKNOWLEDGED: T.warning,
  RESOLVED: T.success,
  IN_PROGRESS: T.accent,
  CLOSED: T.muted,
};

export const DEVICE_STATUS_COLORS = {
  ONLINE: T.success,
  OFFLINE: T.danger,
  UNKNOWN: T.muted,
};

/* ── LoadingSpinner ───────────────────────────────────────────────── */
export function LoadingSpinner({ size = 18, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#8a8d93"
      strokeWidth="2"
      strokeLinecap="round"
      className={`animate-spin ${className}`}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

/* ── PageLoadingState ─────────────────────────────────────────────── */
export function PageLoadingState({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-4">
      <LoadingSpinner size={20} />
      <p className="text-[11px] font-mono text-zinc-600 tracking-[0.2em] uppercase">{label}</p>
    </div>
  );
}

/* ── EmptyState ───────────────────────────────────────────────────── */
export function EmptyState({ icon: Icon = AlertTriangle, title = "No data found", description = "", action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <div className="w-12 h-12 rounded-xl border border-[#2A2F36] flex items-center justify-center mb-1">
        <Icon size={20} color={T.muted} />
      </div>
      <p className="text-sm font-medium text-zinc-300">{title}</p>
      {description && <p className="text-xs text-zinc-600 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

/* ── ErrorState ───────────────────────────────────────────────────── */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <div className="w-12 h-12 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center justify-center mb-1">
        <AlertTriangle size={20} color={T.danger} />
      </div>
      <p className="text-sm font-medium text-zinc-300">Failed to load data</p>
      <p className="text-xs text-zinc-600 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 text-xs font-mono text-zinc-500 hover:text-zinc-200 border border-[#2A2F36] hover:border-[#3a3f47] rounded-md px-4 py-1.5 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

/* ── PageHeader ───────────────────────────────────────────────────── */
export function PageHeader({ title, subtitle, icon: Icon, actions }) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-[#1C2026] border border-[#2A2F36] flex items-center justify-center">
            <Icon size={16} color={T.gold} />
          </div>
        )}
        <div>
          <h1 className="text-base font-semibold text-zinc-100">{title}</h1>
          {subtitle && <p className="text-xs text-zinc-500 font-mono mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ── StatCard ─────────────────────────────────────────────────────── */
export function StatCard({ label, value, icon: Icon, color = T.accent, sublabel }) {
  return (
    <div className="bg-[#1C2026] border border-[#2A2F36] rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">{label}</p>
        {Icon && (
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `${color}15` }}>
            <Icon size={14} style={{ color }} />
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-100 leading-none">{value ?? "—"}</p>
        {sublabel && <p className="text-[11px] font-mono text-zinc-600 mt-1">{sublabel}</p>}
      </div>
    </div>
  );
}

/* ── StatusBadge ──────────────────────────────────────────────────── */
export function StatusBadge({ status, map }) {
  const meta = map?.[status] || { label: status, color: T.muted };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide font-semibold"
      style={{ color: meta.color, background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}
    >
      {meta.label || status}
    </span>
  );
}

/* ── SeverityBadge ────────────────────────────────────────────────── */
export function SeverityBadge({ severity }) {
  const s = severity?.toUpperCase();
  const meta = SEVERITY_META[s] || { label: s, color: T.muted, bg: "transparent", border: "transparent" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide font-semibold"
      style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}
    >
      {meta.label}
    </span>
  );
}

/* ── SearchBar ────────────────────────────────────────────────────── */
export function SearchBar({ value, onChange, placeholder = "Search…", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#1C2026] border border-[#2A2F36] rounded-md pl-8 pr-8 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#c9a36c]/40 font-mono transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

/* ── SelectInput ──────────────────────────────────────────────────── */
export function SelectInput({ value, onChange, options, className = "" }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-[#1C2026] border border-[#2A2F36] rounded-md px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#c9a36c]/40 font-mono appearance-none cursor-pointer transition-colors ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#1C2026]">
          {opt.label}
        </option>
      ))}
    </select>
  );
}

/* ── FormInput ────────────────────────────────────────────────────── */
export function FormInput({ label, error, required, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`bg-[#171A1D] border rounded-md px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none font-mono transition-colors ${
          error ? "border-red-500/50 focus:border-red-500/80" : "border-[#2A2F36] focus:border-[#c9a36c]/40"
        } ${props.className || ""}`}
      />
      {error && <p className="text-[11px] text-red-400 font-mono">{error}</p>}
    </div>
  );
}

/* ── FormTextarea ─────────────────────────────────────────────────── */
export function FormTextarea({ label, error, required, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        {...props}
        className={`bg-[#171A1D] border rounded-md px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none font-mono transition-colors resize-none ${
          error ? "border-red-500/50 focus:border-red-500/80" : "border-[#2A2F36] focus:border-[#c9a36c]/40"
        } ${props.className || ""}`}
      />
      {error && <p className="text-[11px] text-red-400 font-mono">{error}</p>}
    </div>
  );
}

/* ── FormSelect ───────────────────────────────────────────────────── */
export function FormSelect({ label, error, required, options = [], ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        {...props}
        className={`bg-[#171A1D] border rounded-md px-3 py-2.5 text-sm text-zinc-200 focus:outline-none font-mono transition-colors appearance-none cursor-pointer ${
          error ? "border-red-500/50 focus:border-red-500/80" : "border-[#2A2F36] focus:border-[#c9a36c]/40"
        } ${props.className || ""}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#1C2026]">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[11px] text-red-400 font-mono">{error}</p>}
    </div>
  );
}

/* ── Pagination ───────────────────────────────────────────────────── */
export function Pagination({ page, totalPages, onPageChange, totalItems, pageSize }) {
  if (totalPages <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between pt-4 border-t border-[#2A2F36]">
      <p className="text-xs font-mono text-zinc-600">
        {start}–{end} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <PagBtn onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          <ChevronLeft size={14} />
        </PagBtn>
        {getPageNums(page, totalPages).map((n, i) =>
          n === "…" ? (
            <span key={`e-${i}`} className="w-8 text-center text-xs text-zinc-600">…</span>
          ) : (
            <PagBtn key={n} onClick={() => onPageChange(n)} active={n === page}>
              {n}
            </PagBtn>
          )
        )}
        <PagBtn onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          <ChevronRight size={14} />
        </PagBtn>
      </div>
    </div>
  );
}

function PagBtn({ children, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-mono transition-colors ${
        active
          ? "bg-[#c9a36c]/20 text-[#c9a36c] border border-[#c9a36c]/30"
          : disabled
          ? "text-zinc-700 cursor-not-allowed"
          : "text-zinc-500 hover:text-zinc-200 hover:bg-[#2A2F36] border border-transparent"
      }`}
    >
      {children}
    </button>
  );
}

function getPageNums(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

/* ── ConfirmModal ─────────────────────────────────────────────────── */
export function ConfirmModal({ open, title, message, confirmLabel = "Confirm", danger = false, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1C2026] border border-[#2A2F36] rounded-xl w-full max-w-sm p-6 shadow-2xl">
        <h3 className="text-sm font-semibold text-zinc-100 mb-2">{title}</h3>
        <p className="text-xs text-zinc-400 font-mono leading-relaxed mb-6">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-xs font-mono text-zinc-500 hover:text-zinc-200 border border-[#2A2F36] hover:border-[#3a3f47] rounded-md px-4 py-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`text-xs font-mono rounded-md px-4 py-2 transition-colors flex items-center gap-2 ${
              danger
                ? "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                : "bg-[#c9a36c]/20 text-[#c9a36c] border border-[#c9a36c]/30 hover:bg-[#c9a36c]/30"
            }`}
          >
            {loading && <LoadingSpinner size={12} />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal ────────────────────────────────────────────────────────── */
export function Modal({ open, title, onClose, children, width = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={`bg-[#1C2026] border border-[#2A2F36] rounded-xl w-full ${width} shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2F36] flex-shrink-0">
          <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ── DataTable ────────────────────────────────────────────────────── */
export function DataTable({ columns, data, onRowClick, emptyState, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size={18} />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="border-b border-[#2A2F36]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-zinc-600 font-semibold whitespace-nowrap"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                {emptyState || <EmptyState title="No records found" />}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-[#2A2F36]/50 transition-colors ${
                  onRowClick ? "cursor-pointer hover:bg-[#171A1D]" : ""
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-zinc-300 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ── ChartCard ────────────────────────────────────────────────────── */
export function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <div className={`bg-[#1C2026] border border-[#2A2F36] rounded-xl p-5 ${className}`}>
      <div className="mb-4">
        <p className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">{title}</p>
        {subtitle && <p className="text-[11px] font-mono text-zinc-600 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

/* ── Btn ──────────────────────────────────────────────────────────── */
export function Btn({ children, variant = "primary", size = "sm", loading, icon: Icon, ...props }) {
  const sizes = {
    xs: "px-3 py-1.5 text-[11px]",
    sm: "px-4 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
  };
  const variants = {
    primary: "bg-[#c9a36c]/20 text-[#c9a36c] border border-[#c9a36c]/30 hover:bg-[#c9a36c]/30",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
    ghost: "text-zinc-500 border border-[#2A2F36] hover:text-zinc-200 hover:border-[#3a3f47]",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20",
  };
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center gap-2 rounded-md font-mono font-medium transition-colors ${sizes[size]} ${variants[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${props.className || ""}`}
    >
      {loading ? <LoadingSpinner size={12} /> : Icon ? <Icon size={13} /> : null}
      {children}
    </button>
  );
}

/* ── formatDate ───────────────────────────────────────────────────── */
export function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDateShort(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function timeAgo(date) {
  if (!date) return "—";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}