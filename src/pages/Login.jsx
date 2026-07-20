import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Card, Button, Input, Alert, Typography, Spin, Space, Tag, Tooltip, Modal, notification } from "antd";
import {
  UserOutlined,
  LockOutlined,
  SafetyOutlined,
  SunOutlined,
  MoonOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  MailOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

const DEMO_ACCOUNTS = [
  { name: "Owner", username: "owner", role: "OWNER", badge: "red" },
  { name: "Admin", username: "tharun55", role: "ADMIN", badge: "blue" },
  { name: "Analyst", username: "joo", role: "ANALYST", badge: "teal" },
];

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data) => {
    setSubmitting(true);
    setErrorMsg("");
    const res = await login(data.username, data.password);
    setSubmitting(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMsg(res.message);
    }
  };

  const fillDemoAccount = (username) => {
    setValue("username", username, { shouldValidate: true });
    setValue("password", "password123", { shouldValidate: true });
    setErrorMsg("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: isDarkMode
          ? "radial-gradient(circle at 50% 30%, #1E293B 0%, #0F172A 70%, #020617 100%)"
          : "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 50%, #e0f2fe 100%)",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background grid and ambient lighting */}
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          background: isDarkMode
            ? "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%)"
            : "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(0, 0, 0, 0) 70%)",
          top: "-150px",
          right: "-150px",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      {/* Floating Theme Switcher */}
      <div style={{ position: "absolute", top: 24, right: 24, zIndex: 100 }}>
        <Tooltip title={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}>
          <Button
            type="default"
            shape="circle"
            size="large"
            icon={isDarkMode ? <SunOutlined style={{ color: "#F59E0B" }} /> : <MoonOutlined style={{ color: "#6366F1" }} />}
            onClick={toggleTheme}
            style={{
              background: isDarkMode ? "#1E293B" : "#FFFFFF",
              border: `1px solid ${isDarkMode ? "#334155" : "#CBD5E1"}`,
              boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
            }}
          />
        </Tooltip>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: 460, zIndex: 1 }}
      >
        <Card
          bordered={false}
          style={{
            borderRadius: 24,
            boxShadow: isDarkMode
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.6)"
              : "0 20px 40px -15px rgba(37, 99, 235, 0.15)",
            background: isDarkMode ? "rgba(30, 41, 59, 0.85)" : "rgba(255, 255, 255, 0.90)",
            backdropFilter: "blur(24px)",
            border: isDarkMode
              ? "1px solid rgba(255, 255, 255, 0.08)"
              : "1px solid rgba(255, 255, 255, 0.6)",
            padding: "20px 10px",
          }}
        >
          {/* Header & Logo */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%)",
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
                boxShadow: "0 10px 25px rgba(37, 99, 235, 0.35)",
              }}
            >
              <SafetyOutlined style={{ fontSize: 32, color: "#ffffff" }} />
            </div>

            <Title level={2} style={{ margin: 0, fontWeight: 800, letterSpacing: "-0.5px", color: isDarkMode ? "#FFFFFF" : "#0F172A" }}>
              VulnGuard
            </Title>
            <Text style={{ fontSize: 14, color: isDarkMode ? "#94A3B8" : "#64748B", marginTop: 4, display: "block" }}>
              Enterprise Cybersecurity Console
            </Text>
          </div>

          {/* Validation Server Error Alert */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: 20 }}
            >
              <Alert
                message="Authentication Error"
                description={errorMsg}
                type="error"
                showIcon
                closable
                onClose={() => setErrorMsg("")}
                style={{ borderRadius: 12 }}
              />
            </motion.div>
          )}

          {/* Quick Demo Credentials Bar */}
          <div
            style={{
              padding: "12px 14px",
              background: isDarkMode ? "rgba(15, 23, 42, 0.6)" : "#F1F5F9",
              borderRadius: 14,
              marginBottom: 24,
              border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: isDarkMode ? "#94A3B8" : "#64748B", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <KeyOutlined style={{ color: "#3B82F6" }} /> QUICK DEMO ACCOUNTS (Click to autofill):
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <Tag
                  key={acc.username}
                  color={acc.badge}
                  onClick={() => fillDemoAccount(acc.username)}
                  style={{
                    cursor: "pointer",
                    borderRadius: 8,
                    padding: "4px 10px",
                    fontWeight: 600,
                    fontSize: 12,
                    userSelect: "none",
                    transition: "transform 0.15s ease",
                  }}
                >
                  {acc.name} ({acc.username})
                </Tag>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Username or Email Input */}
              <div>
                <Text style={{ fontSize: 13, fontWeight: 600, color: isDarkMode ? "#CBD5E1" : "#334155", display: "block", marginBottom: 6 }}>
                  Email or Username
                </Text>
                <Controller
                  name="username"
                  control={control}
                  rules={{
                    required: "Please enter your Email or Username.",
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="large"
                      prefix={<UserOutlined style={{ color: isDarkMode ? "#64748B" : "#94A3B8" }} />}
                      placeholder="e.g. owner or user@vulnguard.io"
                      status={errors.username ? "error" : ""}
                      autoComplete="username"
                      style={{
                        borderRadius: 12,
                        height: 48,
                        background: isDarkMode ? "#0F172A" : "#FFFFFF",
                        border: isDarkMode ? "1px solid #334155" : "1px solid #CBD5E1",
                        color: isDarkMode ? "#F1F5F9" : "#0F172A",
                      }}
                    />
                  )}
                />
                {errors.username && (
                  <Text type="danger" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
                    {errors.username.message}
                  </Text>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: isDarkMode ? "#CBD5E1" : "#334155" }}>
                    Password
                  </Text>
                  <Button
                    type="link"
                    onClick={() => setForgotModalOpen(true)}
                    style={{ padding: 0, fontSize: 12, fontWeight: 600, color: "#3B82F6" }}
                  >
                    Forgot Password?
                  </Button>
                </div>
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: "Please enter your password.",
                    minLength: { value: 4, message: "Password must be at least 4 characters." },
                  }}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      size="large"
                      prefix={<LockOutlined style={{ color: isDarkMode ? "#64748B" : "#94A3B8" }} />}
                      placeholder="Enter account password"
                      status={errors.password ? "error" : ""}
                      autoComplete="current-password"
                      style={{
                        borderRadius: 12,
                        height: 48,
                        background: isDarkMode ? "#0F172A" : "#FFFFFF",
                        border: isDarkMode ? "1px solid #334155" : "1px solid #CBD5E1",
                        color: isDarkMode ? "#F1F5F9" : "#0F172A",
                      }}
                    />
                  )}
                />
                {errors.password && (
                  <Text type="danger" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
                    {errors.password.message}
                  </Text>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                disabled={submitting}
                icon={!submitting && <ArrowRightOutlined />}
                style={{
                  borderRadius: 12,
                  height: 50,
                  background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: "0 8px 24px rgba(37, 99, 235, 0.35)",
                  marginTop: 6,
                }}
              >
                {submitting ? <Spin size="small" style={{ color: "#ffffff" }} /> : "Sign In to Console"}
              </Button>
            </Space>
          </form>

          {/* Compliance & Security Footer Notice */}
          <div style={{ textAlign: "center", marginTop: 28, paddingTop: 16, borderTop: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
            <Text style={{ fontSize: 12, color: isDarkMode ? "#64748B" : "#94A3B8", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <SafetyCertificateOutlined style={{ color: "#22C55E" }} /> Protected by 256-bit JWT Encryption & Audit Logging.
            </Text>
          </div>
        </Card>
      </motion.div>

      {/* Forgot Password Reset Modal */}
      <Modal
        title={
          <Space>
            <KeyOutlined style={{ color: "#3B82F6" }} />
            <span>Reset Account Password</span>
          </Space>
        }
        open={forgotModalOpen}
        onCancel={() => setForgotModalOpen(false)}
        footer={null}
        destroyOnClose
        centered
      >
        <div style={{ padding: "12px 0" }}>
          <Text style={{ display: "block", marginBottom: 16, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
            Enter your registered enterprise email address or username. A secure password reset link will be sent to your inbox.
          </Text>
          <Input
            size="large"
            prefix={<MailOutlined style={{ color: "#94A3B8" }} />}
            placeholder="e.g. owner@vulnguard.io or owner"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            style={{ borderRadius: 10, marginBottom: 20 }}
          />
          <Button
            type="primary"
            block
            size="large"
            loading={resetLoading}
            onClick={() => {
              if (!resetEmail) {
                notification.warning({ message: "Email required", description: "Please enter your registered email address." });
                return;
              }
              setResetLoading(true);
              setTimeout(() => {
                setResetLoading(false);
                setForgotModalOpen(false);
                setResetEmail("");
                notification.success({
                  message: "Password Reset Email Sent",
                  description: "If an account matches that email, password recovery instructions have been dispatched.",
                });
              }, 1000);
            }}
            style={{ borderRadius: 10, background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)", height: 44, fontWeight: 700 }}
          >
            Send Password Reset Link
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
