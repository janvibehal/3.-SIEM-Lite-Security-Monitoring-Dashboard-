/**
 * src/pages/VerifyEmail.jsx
 *
 * Auto-triggers GET /api/v1/auth/verify-email?token=<token> on mount.
 * Token is read from URL search params: ?token=<token>
 *
 * States: loading → success | error
 */

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import { verifyEmail } from "../services/authService";

const STATE = { LOADING: "loading", SUCCESS: "success", ERROR: "error", NO_TOKEN: "no_token" };

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState(token ? STATE.LOADING : STATE.NO_TOKEN);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        await verifyEmail(token);
        if (!cancelled) setState(STATE.SUCCESS);
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(err.message || "Verification failed. The link may have expired.");
          setState(STATE.ERROR);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [token]);

  // ── Loading ───────────────────────────────────────────────────────────
  if (state === STATE.LOADING) {
    return (
      <AuthLayout title="Verifying your email" subtitle="Please wait while we confirm your address.">
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="22,6 12,13 2,6" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="flex flex-col items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" className="animate-spin opacity-60">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <p className="text-xs font-mono text-slate-600 tracking-widest uppercase">Verifying…</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────
  if (state === STATE.SUCCESS) {
    return (
      <AuthLayout title="Email verified" subtitle="Your account is now active.">
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path d="M9 12l2 2 4-4" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-white">Email verified successfully</p>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                You can now sign in and access the SOC platform.
              </p>
            </div>
          </div>

          <Link
            to="/login"
            className="flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-semibold tracking-wide bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Sign in to SOC
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // ── No token ──────────────────────────────────────────────────────────
  if (state === STATE.NO_TOKEN) {
    return (
      <AuthLayout title="Missing verification link" subtitle="No token was found in this URL.">
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
            <div className="w-9 h-9 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <WarnIcon />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">No token provided</p>
              <p className="text-xs text-slate-500 mt-1">
                Use the link from your verification email. It should contain a token parameter.
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className="flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-semibold tracking-wide border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all duration-200"
          >
            ← Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────
  return (
    <AuthLayout title="Verification failed" subtitle="We could not verify your email address.">
      <div className="space-y-6">
        <div className="flex items-start gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertIcon />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Verification failed</p>
            <p className="text-xs text-slate-500 mt-1">{errorMessage}</p>
            <p className="text-xs text-slate-600 mt-2">
              Verification links expire after 24 hours and can only be used once.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            to="/register"
            className="flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-semibold tracking-wide bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Register again
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-semibold tracking-wide border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all duration-200"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
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

function WarnIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}