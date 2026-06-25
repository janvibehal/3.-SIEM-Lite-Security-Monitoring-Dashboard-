/**
 * src/pages/ResetPassword.jsx
 *
 * Handles the password reset form.
 * Reads `?token=` from URL search params.
 *
 * Backend endpoint: POST /api/v1/auth/reset-password
 * Request: { token: string, newPassword: string }
 * Success 200: { message: "Password reset successful" }
 */

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import PasswordStrength from "../components/auth/PasswordStrength";
import { Toast, useToast } from "../components/ui/Toast";
import { resetPassword } from "../services/authService";
import { isPasswordValid } from "../utils/passwordValidation";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const { toast, showToast, clearToast } = useToast();

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── No token in URL ───────────────────────────────────────────────────
  if (!token) {
    return (
      <AuthLayout
        title="Invalid reset link"
        subtitle="This password reset link is missing or malformed."
      >
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertIcon />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Link is invalid</p>
              <p className="text-xs text-slate-500 mt-1">
                The reset link must include a valid token. Request a new one from the forgot password page.
              </p>
            </div>
          </div>
          <Link
            to="/forgot-password"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold tracking-wide bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Request new link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.newPassword) {
      next.newPassword = "Password is required";
    } else if (!isPasswordValid(form.newPassword)) {
      next.newPassword = "Password does not meet all requirements";
    }
    if (!form.confirmPassword) {
      next.confirmPassword = "Please confirm your password";
    } else if (form.newPassword !== form.confirmPassword) {
      next.confirmPassword = "Passwords do not match";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await resetPassword({ token, newPassword: form.newPassword });
      setSuccess(true);
    } catch (err) {
      const msg = err.message || "Reset failed. The link may have expired.";
      showToast(msg, "error");
      // Token expired / invalid
      if (err.statusCode === 400 || err.statusCode === 404) {
        setErrors({ newPassword: "This reset link has expired or already been used" });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ─────────────────────────────────────────────────────
  if (success) {
    return (
      <AuthLayout title="Password updated" subtitle="Your password has been reset successfully.">
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckIcon />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Password reset complete</p>
              <p className="text-xs text-slate-500 mt-1">
                You can now sign in with your new password.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/login", { replace: true })}
            className="w-full py-2.5 rounded-lg text-sm font-semibold tracking-wide bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Sign in now
          </button>
        </div>
      </AuthLayout>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────
  return (
    <AuthLayout
      title="Set new password"
      subtitle="Choose a strong password to secure your SOC account."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="space-y-2">
          <AuthInput
            id="newPassword"
            label="New password"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            placeholder="••••••••••••"
            autoComplete="new-password"
            required
            disabled={loading}
            icon={<LockIcon />}
          />
          <PasswordStrength password={form.newPassword} />
        </div>

        <AuthInput
          id="confirmPassword"
          label="Confirm new password"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="••••••••••••"
          autoComplete="new-password"
          required
          disabled={loading}
          icon={<ShieldIcon />}
        />

        <button
          type="submit"
          disabled={loading}
          className={[
            "w-full py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200",
            "bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-[0.98]",
            "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-950",
            loading ? "opacity-60 cursor-not-allowed" : "",
          ].join(" ")}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <SpinnerIcon />
              Updating password…
            </span>
          ) : (
            "Reset password"
          )}
        </button>

        <p className="text-center text-xs text-slate-600 font-mono">
          <Link to="/login" className="text-cyan-500 hover:text-cyan-400 transition-colors">
            ← Back to sign in
          </Link>
        </p>
      </form>

      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={clearToast} />
      )}
    </AuthLayout>
  );
}

function LockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}