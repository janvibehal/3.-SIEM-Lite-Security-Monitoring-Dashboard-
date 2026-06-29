import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleGuard from "./routes/RoleGuard";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

import Dashboard from "./pages/dashboard/Dashboard";
import AlertsPage from "./pages/dashboard/alert/Alerts";
import LogsPage from "./pages/dashboard/log/logs";

import Devices from "./pages/dashboard/Devices/Devices";
import Rules from "./pages/dashboard/Rules/Rules";
import Analytics from "./pages/dashboard/Analytics/Analytics";
import Reports from "./pages/dashboard/Reports/Reports";
import Incidents from "./pages/dashboard/Incidents/Incidents";
import AuditLogs from "./pages/dashboard/Audit/AuditLogs";
import Users from "./pages/dashboard/Users/Users";

import Profile from "./pages/user/Profile";
import Settings from "./pages/user/Settings";

import Forbidden from "./pages/errors/Forbidden";
import NotFound from "./pages/errors/NotFound";

import DashboardLayout from "./layouts/DashboardLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/403" element={<Forbidden />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/devices" element={<Devices />} />

            <Route path="/logs" element={<LogsPage />} />

            <Route path="/rules" element={<Rules />} />

            <Route path="/alerts" element={<AlertsPage />} />

            <Route path="/incidents" element={<Incidents />} />

            <Route path="/analytics" element={<Analytics />} />

            <Route path="/reports" element={<Reports />} />

            <Route path="/audit-logs" element={<AuditLogs />} />

            <Route
              path="/users"
              element={
                <RoleGuard allowed={["ADMIN"]}>
                  <Users />
                </RoleGuard>
              }
            />

            <Route path="/profile" element={<Profile />} />

            <Route
              path="/settings"
              element={
                <RoleGuard
                  allowed={["ADMIN", "ANALYST", "OPERATOR", "VIEWER"]}
                >
                  <Settings />
                </RoleGuard>
              }
            />

          </Route>
        </Route>

        {/* 404 */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}