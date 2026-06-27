/**
 * src/components/layouts/DashboardLayout.jsx
 *
 * Shared layout for all authenticated pages (Dashboard, Profile, Settings, etc.)
 * Provides: sidebar, top navbar, mobile hamburger, UserDropdown.
 * Page content is rendered via <Outlet /> (React Router nested route).
 */

import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Toast, useToast } from "../components/ui/Toast";
import UserDropdown from "../components/user/UserDropdown";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "grid",    path: "/dashboard" },
  { label: "Alerts",    icon: "bell",    path: "/alerts"    },
  { label: "Logs",      icon: "file",    path: "/logs"      },
  { label: "Devices",   icon: "monitor", path: "/devices"   },
  { label: "Rules",     icon: "code",    path: "/rules"     },
  { label: "Reports",   icon: "bar",     path: "/reports"   },
  { label: "Users",     icon: "users",   path: "/users"     },
  { label: "Audit Log", icon: "clock",   path: "/audit"     },
];

export default function DashboardLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const { toast, showToast, clearToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const utcTime = clock.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex text-zinc-300">
      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 w-60 bg-[#0d0e10]/95 border-r border-[#1c1d20] flex flex-col",
          "transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="relative px-5 py-5 border-b border-[#1c1d20]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#b08d57] via-[#8a703f] to-transparent" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#1a1611] border border-[#3a2f1f] flex items-center justify-center flex-shrink-0">
              <ShieldCheckIcon className="w-4 h-4 text-[#c9a36c]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100 leading-none tracking-tight">SIEM Lite</p>
              <p className="text-[10px] font-mono text-zinc-600 mt-1 tracking-wide">SOC Platform v1.0</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-[0.2em] px-2 mb-2">Navigation</p>
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={[
                  "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors mb-0.5",
                  active
                    ? "bg-[#16140f] text-[#c9a36c]"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-[#15161a]",
                ].join(" ")}
              >
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#b08d57] rounded-full" aria-hidden="true" />
                )}
                <NavIcon name={item.icon} active={active} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar user footer */}
        <div className="p-4 border-t border-[#1c1d20]">
          <Link
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-[#15161a] transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-[#16171a] border border-[#26282d] flex items-center justify-center text-xs font-semibold text-[#c9a36c] flex-shrink-0">
              {user?.username?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-200 truncate group-hover:text-[#c9a36c] transition-colors">
                {user?.username ?? "—"}
              </p>
              <p className="text-[10px] font-mono text-zinc-600 truncate uppercase tracking-wide">
                {user?.role ?? "operator"}
              </p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between h-14 px-5 bg-[#0a0a0b]/90 backdrop-blur border-b border-[#1c1d20]">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="lg:hidden text-zinc-500 hover:text-zinc-100 transition-colors"
            aria-label="Open navigation"
          >
            <HamburgerIcon />
          </button>

          <p className="hidden md:block text-xs font-mono text-zinc-600 tracking-widest">
            <span className="text-[#6b9080] motion-safe:animate-pulse mr-1.5">●</span>
            {utcTime}
          </p>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => showToast("23 active alerts require attention.", "error")}
              className="relative flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 transition-colors font-mono border border-[#1c1d20] hover:border-[#34363b] rounded-md px-3 py-1.5"
              aria-label="View alerts"
            >
              <BellIcon />
              <span>23</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#c4756b] motion-safe:animate-pulse" />
            </button>

            <UserDropdown />
          </div>
        </header>

        {/* Nested page content */}
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </div>

      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={clearToast} />
      )}
    </div>
  );
}

/* ── Icons ────────────────────────────────────────────────────────────── */
function ShieldCheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function NavIcon({ name, active }) {
  const color = active ? "#c9a36c" : "#71757c";
  const props = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "grid")    return <svg {...props}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
  if (name === "bell")    return <svg {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
  if (name === "file")    return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
  if (name === "monitor") return <svg {...props}><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>;
  if (name === "code")    return <svg {...props}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
  if (name === "bar")     return <svg {...props}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
  if (name === "users")   return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
  if (name === "clock")   return <svg {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
  return null;
}