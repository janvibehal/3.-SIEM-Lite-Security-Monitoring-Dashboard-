/**
 * src/pages/Register.jsx
 *
 * Registration page for SIEM Lite.
 * Uses: AuthLayout, AuthInput, PasswordStrength, Toast/useToast, authService.register
 *
 * Backend endpoint: POST /api/v1/auth/register
 * Request:  { email: string, username: string, password: string }
 * Response: { success: true, data: { id, email, username, role } }
 *
 * Password rules (mirrors Zod registerSchema in backend):
 *   min 8 chars, uppercase, lowercase, digit, special char
 * Username rules: min 3, max 50
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import PasswordStrength from "../components/auth/PasswordStrength";
import { Toast, useToast } from "../components/ui/Toast";
import { register as apiRegister } from "../services/authService";
import { isPasswordValid, isUsernameValid, isEmailValid } from "../utils/passwordValidation";

export default function Register() {
  const navigate = useNavigate();
  const { toast, showToast, clearToast } = useToast();

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ── Field change ──────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── Client-side validation ────────────────────────────────────────────
  const validate = () => {
    const next = {};

    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!isEmailValid(form.email)) {
      next.email = "Enter a valid email address";
    }

    if (!form.username.trim()) {
      next.username = "Username is required";
    } else if (!isUsernameValid(form.username)) {
      next.username = "Username must be 3–50 characters";
    }

    if (!form.password) {
      next.password = "Password is required";
    } else if (!isPasswordValid(form.password)) {
      next.password = "Password does not meet all requirements";
    }

    if (!form.confirmPassword) {
      next.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      next.confirmPassword = "Passwords do not match";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // POST /api/v1/auth/register — { email, username, password }
      // Returns { success: true, data: { id, email, username, role } }
      await apiRegister({
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
      });

      showToast("Account created — you can now sign in.", "success");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      // 409 ConflictError → "Email already exists" | "Username already exists"
      const msg = err.message || "Registration failed. Please try again.";
      showToast(msg, "error");

      // Surface field-level conflict errors
      if (msg.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: "This email is already registered" }));
      } else if (msg.toLowerCase().includes("username")) {
        setErrors((prev) => ({ ...prev, username: "This username is already taken" }));
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <AuthLayout
      title="Request access"
      subtitle="Create your SOC operator account to get started."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Email */}
        <AuthInput
          id="email"
          label="Email address"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="analyst@company.com"
          autoComplete="email"
          required
          disabled={loading}
          icon={<MailIcon />}
        />

        {/* Username */}
        <AuthInput
          id="username"
          label="Username"
          type="text"
          value={form.username}
          onChange={handleChange}
          error={errors.username}
          hint="3–50 characters. Used to sign in."
          placeholder="soc_analyst_01"
          autoComplete="username"
          required
          disabled={loading}
          icon={<UserIcon />}
        />

        {/* Password + strength indicator */}
        <div className="space-y-2">
          <AuthInput
            id="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••••••"
            autoComplete="new-password"
            required
            disabled={loading}
            icon={<LockIcon />}
          />
          <PasswordStrength password={form.password} />
        </div>

        {/* Confirm password */}
        <AuthInput
          id="confirmPassword"
          label="Confirm password"
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

        {/* Submit */}
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
              Creating account…
            </span>
          ) : (
            "Create Account"
          )}
        </button>

        {/* Login link */}
        <p className="text-center text-xs text-slate-600 font-mono">
          Already have access?{" "}
          <Link
            to="/login"
            className="text-cyan-500 hover:text-cyan-400 transition-colors"
          >
            Sign in →
          </Link>
        </p>
      </form>

      {/* Toast notification */}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onDismiss={clearToast}
        />
      )}
    </AuthLayout>
  );
}

/* ── Inline icons ────────────────────────────────────────────────────── */
function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
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

function SpinnerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
