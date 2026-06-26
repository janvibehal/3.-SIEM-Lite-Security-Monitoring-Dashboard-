/**
 * src/pages/Login.jsx
 *
 * Login page for SIEM Lite.
 * Uses: AuthLayout, AuthInput, Toast/useToast, AuthContext, authService.login
 *
 * Backend endpoint: POST /api/v1/auth/login
 * Request:  { username: string, password: string }
 * Response: { accessToken: string, user: { id, email, username, role } }
 *           + httpOnly cookie: siem_refresh_token
 */

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import { Toast, useToast } from "../../components/ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { login as apiLogin } from "../../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast, showToast, clearToast } = useToast();

  // Where to redirect after login — default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ── Field change ──────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── Client-side validation ────────────────────────────────────────────
  const validate = () => {
    const next = {};
    if (!form.username.trim()) next.username = "Username is required";
    if (!form.password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // POST /api/v1/auth/login — { username, password }
      // Returns { accessToken, user: { id, email, username, role } }
      const data = await apiLogin({
        username: form.username.trim(),
        password: form.password,
      });

      // Store token in memory via AuthContext; user object in state
      login(data.accessToken, data.user);

      showToast(`Welcome back, ${data.user.username}`, "success");

      // Small delay so the toast is visible before navigation
      setTimeout(() => navigate(from, { replace: true }), 600);
    } catch (err) {
      // 401 → "Invalid credentials"
      // 423 → "Account is temporarily locked"
      const msg = err.message || "Login failed. Please try again.";
      showToast(msg, "error");

      // Surface account-lock as a field-level hint too
      if (err.statusCode === 423) {
        setErrors({ password: "Account locked — try again later" });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <AuthLayout
      title="Sign in to SOC"
      subtitle="Enter your credentials to access the security dashboard."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Username */}
        <AuthInput
          id="username"
          label="Username"
          type="text"
          value={form.username}
          onChange={handleChange}
          error={errors.username}
          placeholder="operator_01"
          autoComplete="username"
          required
          disabled={loading}
          icon={<UserIcon />}
        />

        {/* Password */}
        <AuthInput
          id="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="••••••••••••"
          autoComplete="current-password"
          required
          disabled={loading}
          icon={<LockIcon />}
        />

        {/* Forgot password link */}
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors font-mono"
            tabIndex={loading ? -1 : 0}
          >
            Forgot password?
          </Link>
        </div>

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
              Authenticating…
            </span>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Register link */}
        <p className="text-center text-xs text-slate-600 font-mono">
          No account?{" "}
          <Link
            to="/register"
            className="text-cyan-500 hover:text-cyan-400 transition-colors"
          >
            Create Account →
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

/* ── Inline icons (no external dependency) ───────────────────────────── */
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

function SpinnerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
