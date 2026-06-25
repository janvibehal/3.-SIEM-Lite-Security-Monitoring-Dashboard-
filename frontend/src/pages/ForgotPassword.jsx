/**
 * src/pages/ForgotPassword.jsx
 *
 * Forgot password page.
 * Backend endpoint: POST /api/v1/auth/forgot-password
 * Request: { email }
 * Response (always 200 — timing-safe):
 *   { message: "If this email is registered, you will receive a reset link." }
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import { Toast, useToast } from "../components/ui/Toast";
import { forgotPassword } from "../services/authService";
import { isEmailValid } from "../utils/passwordValidation";

export default function ForgotPassword() {
  const { toast, showToast, clearToast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const validate = () => {
    if (!email.trim()) { setError("Email is required"); return false; }
    if (!isEmailValid(email)) { setError("Enter a valid email address"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await forgotPassword({ email: email.trim() });
      setSubmitted(true);
    } catch (err) {
      // Even on backend error show generic message — don't reveal email existence
      showToast(err.message || "Something went wrong. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ─────────────────────────────────────────────────────
  if (submitted) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle="If this email is registered, a reset link is on its way."
      >
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MailIcon />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Reset link sent</p>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Sent to <span className="text-cyan-400">{email}</span>
              </p>
              <p className="text-xs text-slate-600 mt-2">
                Check your spam folder if it doesn't arrive within a few minutes.
                The link expires in 1 hour.
              </p>
            </div>
          </div>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold tracking-wide border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            ← Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // ── Form state ────────────────────────────────────────────────────────
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email address on your account. We'll send a reset link."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthInput
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={handleChange}
          error={error}
          placeholder="analyst@company.com"
          autoComplete="email"
          required
          disabled={loading}
          icon={<MailIcon />}
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
              Sending reset link…
            </span>
          ) : (
            "Send reset link"
          )}
        </button>

        <p className="text-center text-xs text-slate-600 font-mono">
          Remembered it?{" "}
          <Link to="/login" className="text-cyan-500 hover:text-cyan-400 transition-colors">
            Back to sign in →
          </Link>
        </p>
      </form>

      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={clearToast} />
      )}
    </AuthLayout>
  );
}

function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
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