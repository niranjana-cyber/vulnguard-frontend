import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spin } from "antd";

import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import DashboardLayout from "../layouts/DashboardLayout";

// Import Pages
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Departments from "../pages/Departments";
import Admins from "../pages/Admins";
import Employees from "../pages/Employees";
import Assets from "../pages/Assets";
import Vulnerabilities from "../pages/Vulnerabilities";
import AuditLogs from "../pages/AuditLogs";
import Reports from "../pages/Reports";
import Profile from "../pages/Profile";
import { NotFoundPage, ForbiddenPage, UnauthorizedPage, ServerErrorPage } from "../pages/ErrorPages";

const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#0F172A",
          color: "#ffffff",
        }}
      >
        <Spin size="large" tip="Loading VulnGuard Session..." />
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected Routes inside DashboardLayout */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/departments"
        element={
          <PrivateRoute allowedRoles={["OWNER", "ADMIN"]}>
            <DashboardLayout>
              <Departments />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/admins"
        element={
          <PrivateRoute allowedRoles={["OWNER"]}>
            <DashboardLayout>
              <Admins />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/employees"
        element={
          <PrivateRoute allowedRoles={["OWNER", "ADMIN"]}>
            <DashboardLayout>
              <Employees />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/assets"
        element={
          <PrivateRoute allowedRoles={["OWNER", "ADMIN", "SECURITY_MANAGER", "SECURITY_ANALYST", "IT_ENGINEER"]}>
            <DashboardLayout>
              <Assets />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/vulnerabilities"
        element={
          <PrivateRoute allowedRoles={["OWNER", "ADMIN", "SECURITY_MANAGER", "SECURITY_ANALYST", "IT_ENGINEER"]}>
            <DashboardLayout>
              <Vulnerabilities />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/audit-logs"
        element={
          <PrivateRoute allowedRoles={["OWNER", "ADMIN"]}>
            <DashboardLayout>
              <AuditLogs />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <PrivateRoute allowedRoles={["OWNER", "ADMIN", "SECURITY_MANAGER"]}>
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      {/* Error Fallbacks */}
      <Route path="/401" element={<UnauthorizedPage />} />
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="/500" element={<ServerErrorPage />} />

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
