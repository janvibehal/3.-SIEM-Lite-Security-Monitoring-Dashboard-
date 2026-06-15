/**
 * Toast.jsx
 * Success / error notification component for auth events.
 */

import { useEffect, useState } from "react";

export function Toast({ message, type = "success", onDismiss, duration = 4000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const styles = {
    success: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    error:   "border-red-500/40  bg-red-500/10  text-red-300",
    info:    "border-slate-600   bg-slate-800   text-slate-300",
  };

  const icons = {
    success: "✓",
    error:   "✕",
    info:    "i",
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 border rounded-lg px-4 py-3 shadow-2xl
        text-sm font-mono max-w-xs transition-all duration-300 ${styles[type]}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
        {icons[type]}
      </span>
      <span className="text-xs leading-relaxed">{message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
        className="ml-auto text-current/50 hover:text-current transition-colors text-xs leading-none"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * useToast hook
 * Usage:
 *   const { toast, showToast } = useToast();
 *   ...
 *   showToast("Logged in", "success");
 *   ...
 *   {toast && <Toast {...toast} onDismiss={clearToast} />}
 */
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type, key: Date.now() });
  };

  const clearToast = () => setToast(null);

  return { toast, showToast, clearToast };
}
