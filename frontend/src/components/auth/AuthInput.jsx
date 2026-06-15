/**
 * AuthInput.jsx
 * Reusable input for auth forms with validation states, icons, and show/hide password.
 */

import { useState } from "react";

export default function AuthInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  hint,
  placeholder,
  autoComplete,
  icon,
  required = false,
  disabled = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;
  const hasError = !!error;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold tracking-widest text-slate-400 uppercase">
          {label}
          {required && <span className="ml-1 text-cyan-400">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Left icon */}
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
            {icon}
          </div>
        )}

        <input
          id={id}
          name={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          className={[
            "w-full bg-slate-900/60 border rounded-lg py-2.5 text-sm text-slate-100 placeholder-slate-600",
            "focus:outline-none focus:ring-1 transition-colors duration-150",
            icon ? "pl-10" : "pl-3.5",
            isPassword ? "pr-10" : "pr-3.5",
            hasError
              ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/30"
              : "border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20",
            disabled ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
        />

        {/* Show/hide password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={11} />
          {error}
        </p>
      )}

      {/* Hint text */}
      {hint && !hasError && (
        <p className="text-xs text-slate-600">{hint}</p>
      )}
    </div>
  );
}

/* ── Inline micro-icons (no lucide dependency required) ──────────────── */
function Eye({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function AlertCircle({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
