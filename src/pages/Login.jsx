import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Card, Button, Input, Alert, Typography, Spin, Space, Tooltip, Modal, notification } from "antd";
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
  RadarChartOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  ApiOutlined
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";

const { Title, Text, Paragraph } = Typography;

const DEMO_ACCOUNTS = [
  { name: "Owner", username: "owner", role: "OWNER", style: { background: "rgba(127, 29, 29, 0.45)", border: "1px solid rgba(239, 68, 68, 0.5)", color: "#FCA5A5", boxShadow: "0 0 10px rgba(239, 68, 68, 0.25)" } },
  { name: "Admin", username: "tharun55", role: "ADMIN", style: { background: "rgba(8, 145, 178, 0.45)", border: "1px solid rgba(6, 182, 212, 0.5)", color: "#67E8F9", boxShadow: "0 0 10px rgba(6, 182, 212, 0.25)" } },
  { name: "Analyst", username: "joo", role: "ANALYST", style: { background: "rgba(6, 78, 59, 0.45)", border: "1px solid rgba(16, 185, 129, 0.5)", color: "#6EE7B7", boxShadow: "0 0 10px rgba(16, 185, 129, 0.25)" } },
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
        flexDirection: "row",
        background: isDarkMode
          ? "radial-gradient(circle at 70% 30%, #0B1120 0%, #080C14 70%, #030712 100%)"
          : "linear-gradient(135deg, #f5f3ff 0%, #e0e7ff 50%, #f0f9ff 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Styles Injection */}
      <style>{`
        @media (max-width: 991px) {
          .cyber-hero-panel {
            display: none !important;
          }
          .login-form-panel {
            width: 100% !important;
            max-width: 100% !important;
            padding: 16px !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }
        }
        @keyframes scan-glow {
          0% { transform: translateY(-50px); opacity: 0.1; }
          50% { opacity: 0.6; }
          100% { transform: translateY(250px); opacity: 0.1; }
        }
        @keyframes pulse-shield {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.03); }
        }
        @keyframes rotate-scanner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes float-badge {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(0.5deg); }
        }
        @keyframes flow-line {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.3); opacity: 1; }
        }
        @keyframes card-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .premium-input:focus {
          border-color: #06b6d4 !important;
          box-shadow: 0 0 14px rgba(6, 182, 212, 0.25) !important;
        }
      `}</style>

      {/* Cyber Grid background for Left side marketing panel */}
      {isDarkMode && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(6, 182, 212, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "3rem 3rem",
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* LEFT PANEL: Cybersecurity Hero Marketing Section */}
      <div
        className="cyber-hero-panel"
        style={{
          width: "55%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          position: "relative",
          zIndex: 2,
          borderRight: isDarkMode ? "1px solid rgba(6, 182, 212, 0.15)" : "1px solid rgba(99, 102, 241, 0.15)",
          background: isDarkMode ? "rgba(8, 12, 20, 0.6)" : "rgba(255, 255, 255, 0.35)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Branding header & Status Indicators */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)",
              }}
            >
              <SafetyOutlined style={{ fontSize: 22, color: "#ffffff" }} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, color: isDarkMode ? "#ffffff" : "#0F172A", letterSpacing: "-0.5px" }}>
              VulnGuard <span style={{ color: "#06B6D4", fontSize: 13, fontWeight: 700 }}>SOC</span>
            </span>
          </div>

          {/* Animated Status Badges */}
          <Space size="middle">
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: isDarkMode ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              padding: "4px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              color: "#10B981"
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", animation: "pulse-dot 2s infinite" }} />
              Live Monitoring
            </span>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: isDarkMode ? "rgba(6, 182, 212, 0.1)" : "rgba(6, 182, 212, 0.15)",
              border: "1px solid rgba(6, 182, 212, 0.3)",
              padding: "4px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              color: "#06B6D4"
            }}>
              Enterprise Ready
            </span>
          </Space>
        </div>

        {/* Core Marketing Visual & Copy */}
        <div style={{ margin: "auto 0", paddingRight: 40 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "2px",
              color: "#06B6D4",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 16,
            }}
          >
            Securing Enterprise Surface Area
          </span>
          <Title
            level={1}
            style={{
              fontSize: 44,
              fontWeight: 900,
              lineHeight: 1.15,
              margin: "0 0 20px 0",
              color: isDarkMode ? "#ffffff" : "#0f172a",
              letterSpacing: "-1.5px",
            }}
          >
            Enterprise Vulnerability Management Platform
          </Title>
          <Paragraph
            style={{
              fontSize: 16,
              color: isDarkMode ? "#94A3B8" : "#475569",
              lineHeight: 1.6,
              margin: "0 0 32px 0",
              maxWidth: 540,
            }}
          >
            Continuous infrastructure mapping, real-time threat vectors visualization, asset compliance audit trailing, and automated remediation workflow coordination.
          </Paragraph>

          {/* Floating Feature Badges Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 40, maxWidth: 540 }}>
            {[
              { text: "Real-time Threat Detection", color: "#EF4444" },
              { text: "CVE Intelligence", color: "#3B82F6" },
              { text: "Asset Management", color: "#06B6D4" },
              { text: "Compliance Reporting", color: "#10B981" }
            ].map((feat, i) => (
              <div
                key={feat.text}
                style={{
                  background: isDarkMode ? "rgba(30, 41, 59, 0.4)" : "rgba(255, 255, 255, 0.75)",
                  border: `1px solid ${isDarkMode ? "rgba(6, 182, 212, 0.15)" : "rgba(99, 102, 241, 0.15)"}`,
                  borderRadius: 12,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  color: isDarkMode ? "#E2E8F0" : "#334155",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                  animation: `float-badge ${6 + i}s ease-in-out infinite`,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: feat.color }} />
                {feat.text}
              </div>
            ))}
          </div>

          {/* Premium Cybersecurity SVG Interactive Illustration */}
          <div style={{ position: "relative", width: "100%", height: 260, display: "flex", justifyContent: "center", alignItems: "center" }}>
            {/* Pulsing Scan Line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "15%",
                right: "15%",
                height: "2px",
                background: "linear-gradient(90deg, rgba(6,182,212,0) 0%, rgba(6,182,212,0.8) 50%, rgba(6,182,212,0) 100%)",
                animation: "scan-glow 6s linear infinite",
                pointerEvents: "none",
                zIndex: 5,
              }}
            />

            <svg width="420" height="240" viewBox="0 0 420 240" style={{ overflow: "visible" }}>
              {/* Grid Lines */}
              <defs>
                <pattern id="illustration-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke={isDarkMode ? "rgba(6, 182, 212, 0.08)" : "rgba(99, 102, 241, 0.08)"} strokeWidth="1" />
                </pattern>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#illustration-grid)" />

              {/* Glowing outer scanning rings */}
              <g transform="translate(210, 120)">
                <circle r="90" fill="none" stroke={isDarkMode ? "rgba(6, 182, 212, 0.15)" : "rgba(99, 102, 241, 0.15)"} strokeWidth="1" strokeDasharray="10 15" style={{ animation: "rotate-scanner 35s linear infinite" }} />
                <circle r="70" fill="none" stroke={isDarkMode ? "rgba(37, 99, 235, 0.25)" : "rgba(37, 99, 235, 0.2)"} strokeWidth="1" strokeDasharray="15 8" style={{ animation: "rotate-scanner 25s linear infinite reverse" }} />
                
                {/* Central Cyber Shield */}
                <path
                  d="M -25,-32 L 25,-32 L 35,-5 L 0,35 L -35,-5 Z"
                  fill="url(#shieldGrad)"
                  stroke={isDarkMode ? "#06B6D4" : "#2563EB"}
                  strokeWidth="2"
                  style={{
                    filter: "drop-shadow(0 0 15px rgba(6, 182, 212, 0.6))",
                    transformOrigin: "center",
                    animation: "pulse-shield 4s ease-in-out infinite",
                  }}
                />
              </g>

              {/* Connected node points with glowing flow lines */}
              <path d="M 60,60 L 210,120 M 360,60 L 210,120 M 60,180 L 210,120 M 360,180 L 210,120" stroke={isDarkMode ? "rgba(6, 182, 212, 0.3)" : "rgba(37, 99, 235, 0.3)"} strokeWidth="1.5" strokeDasharray="5 5" />
              
              {/* Animated data packets flow */}
              <path d="M 60,60 L 210,120 M 360,180 L 210,120" stroke="#06B6D4" strokeWidth="2" strokeDasharray="10 100" style={{ animation: "flow-line 4s linear infinite" }} />

              {/* Node Icons */}
              <g transform="translate(60, 60)"><circle r="18" fill={isDarkMode ? "#1e293b" : "#ffffff"} stroke="#06b6d4" strokeWidth="2" /><DatabaseOutlined style={{ color: "#06b6d4", fontSize: 16, transform: "translate(-8px, -8px)" }} /></g>
              <g transform="translate(360, 60)"><circle r="18" fill={isDarkMode ? "#1e293b" : "#ffffff"} stroke="#3b82f6" strokeWidth="2" /><GlobalOutlined style={{ color: "#3b82f6", fontSize: 16, transform: "translate(-8px, -8px)" }} /></g>
              <g transform="translate(60, 180)"><circle r="18" fill={isDarkMode ? "#1e293b" : "#ffffff"} stroke="#10b981" strokeWidth="2" /><SafetyCertificateOutlined style={{ color: "#10b981", fontSize: 16, transform: "translate(-8px, -8px)" }} /></g>
              <g transform="translate(360, 180)"><circle r="18" fill={isDarkMode ? "#1e293b" : "#ffffff"} stroke="#f59e0b" strokeWidth="2" /><ApiOutlined style={{ color: "#f59e0b", fontSize: 16, transform: "translate(-8px, -8px)" }} /></g>
            </svg>

            {/* Floating Security Telemetry Pill Tags */}
            <div
              style={{
                position: "absolute",
                top: 20,
                left: "20%",
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                borderRadius: 12,
                padding: "6px 14px",
                color: "#FCA5A5",
                fontSize: 11,
                fontWeight: 700,
                boxShadow: "0 0 15px rgba(239, 68, 68, 0.2)",
                animation: "float-badge 7s ease-in-out infinite",
              }}
            >
              ⚠️ CVE-2024-3094 Active
            </div>

            <div
              style={{
                position: "absolute",
                bottom: 10,
                right: "15%",
                background: "rgba(16, 185, 129, 0.2)",
                border: "1px solid rgba(16, 185, 129, 0.5)",
                borderRadius: 12,
                padding: "6px 14px",
                color: "#6EE7B7",
                fontSize: 11,
                fontWeight: 700,
                boxShadow: "0 0 15px rgba(16, 185, 129, 0.2)",
                animation: "float-badge 9s ease-in-out infinite reverse",
              }}
            >
              🛡️ ISO-27001 Compliant
            </div>
          </div>
        </div>

        {/* Footer info panel */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: isDarkMode ? "#64748B" : "#94A3B8" }}>
          <span>© 2026 VulnGuard Inc.</span>
          <span>Version 1.0.0 • Enterprise Ready • Secure Session</span>
        </div>
      </div>

      {/* RIGHT PANEL: Login Interface Card */}
      <div
        className="login-form-panel"
        style={{
          width: "45%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
          position: "relative",
          zIndex: 3,
        }}
      >
        {/* Floating Theme Toggle Switcher */}
        <div style={{ position: "absolute", top: 24, right: 24, zIndex: 100 }}>
          <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to SOC Dark Mode"}>
            <Button
              type="default"
              shape="circle"
              size="large"
              icon={isDarkMode ? <SunOutlined style={{ color: "#F59E0B" }} /> : <MoonOutlined style={{ color: "#6366F1" }} />}
              onClick={toggleTheme}
              style={{
                background: isDarkMode ? "#1e293b" : "#FFFFFF",
                border: `1px solid ${isDarkMode ? "rgba(6, 182, 212, 0.35)" : "#CBD5E1"}`,
                boxShadow: isDarkMode ? "0 0 15px rgba(6, 182, 212, 0.2)" : "0 4px 14px rgba(0,0,0,0.08)",
              }}
            />
          </Tooltip>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: 440 }}
        >
          <Card
            bordered={false}
            style={{
              borderRadius: 24,
              boxShadow: isDarkMode
                ? "0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(6, 182, 212, 0.12), inset 0 0 15px rgba(255, 255, 255, 0.02)"
                : "0 20px 45px -10px rgba(99, 102, 241, 0.06), inset 0 0 15px rgba(255, 255, 255, 0.6)",
              background: isDarkMode ? "rgba(10, 15, 30, 0.88)" : "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: isDarkMode
                ? "1px solid rgba(6, 182, 212, 0.22)"
                : "1px solid rgba(99, 102, 241, 0.22)",
              padding: "16px 8px",
              animation: "card-float 6s ease-in-out infinite",
            }}
          >
            {/* Header / Brand Title for Mobile View */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)",
                  display: "inline-flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 14,
                  boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)",
                }}
              >
                <SafetyOutlined style={{ fontSize: 26, color: "#ffffff" }} />
              </div>

              <Title level={2} style={{ margin: 0, fontWeight: 900, letterSpacing: "-0.5px", color: isDarkMode ? "#FFFFFF" : "#0F172A" }}>
                VulnGuard <span style={{ fontSize: 13, color: "#06B6D4", fontWeight: 700, textTransform: "uppercase" }}>SOC</span>
              </Title>
              <Text style={{ fontSize: 13, color: isDarkMode ? "#94A3B8" : "#64748B", marginTop: 4, display: "block" }}>
                Sign in to cybersecurity command center
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

            {/* Translucent Demo Credential Badges */}
            <div
              style={{
                padding: "14px 16px",
                background: isDarkMode ? "rgba(8, 12, 20, 0.8)" : "#F1F5F9",
                borderRadius: 16,
                marginBottom: 24,
                border: `1px solid ${isDarkMode ? "rgba(6, 182, 212, 0.25)" : "#E2E8F0"}`,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: isDarkMode ? "#06B6D4" : "#64748B", marginBottom: 10, display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                <RadarChartOutlined spin style={{ color: "#06B6D4" }} /> QUICK DEMO ACCOUNTS (Click to autofill):
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {DEMO_ACCOUNTS.map((acc) => (
                  <div
                    key={acc.username}
                    onClick={() => fillDemoAccount(acc.username)}
                    style={{
                      ...acc.style,
                      cursor: "pointer",
                      borderRadius: 99,
                      padding: "4px 12px",
                      fontWeight: 700,
                      fontSize: 12,
                      userSelect: "none",
                      transition: "all 0.2s ease-in-out",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <span>{acc.name}</span>
                    <span style={{ opacity: 0.75, fontSize: 11 }}>({acc.username})</span>
                  </div>
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
                        className="premium-input"
                        prefix={<UserOutlined style={{ color: isDarkMode ? "#06B6D4" : "#94A3B8" }} />}
                        placeholder="e.g. owner or user@vulnguard.io"
                        status={errors.username ? "error" : ""}
                        autoComplete="username"
                        style={{
                          borderRadius: 12,
                          height: 48,
                          background: isDarkMode ? "#080C14" : "#FFFFFF",
                          border: isDarkMode ? "1px solid rgba(6, 182, 212, 0.2)" : "1px solid #CBD5E1",
                          color: isDarkMode ? "#F8FAFC" : "#0F172A",
                          transition: "all 0.3s ease",
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
                      style={{ padding: 0, fontSize: 12, fontWeight: 600, color: "#06B6D4" }}
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
                        className="premium-input"
                        prefix={<LockOutlined style={{ color: isDarkMode ? "#06B6D4" : "#94A3B8" }} />}
                        placeholder="Enter account password"
                        status={errors.password ? "error" : ""}
                        autoComplete="current-password"
                        style={{
                          borderRadius: 12,
                          height: 48,
                          background: isDarkMode ? "#080C14" : "#FFFFFF",
                          border: isDarkMode ? "1px solid rgba(6, 182, 212, 0.2)" : "1px solid #CBD5E1",
                          color: isDarkMode ? "#F8FAFC" : "#0F172A",
                          transition: "all 0.3s ease",
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

                {/* Vibrant Cyan-to-Blue Gradient Submit Button */}
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  disabled={submitting}
                  icon={!submitting && <ArrowRightOutlined />}
                  style={{
                    borderRadius: 12,
                    height: 52,
                    background: "linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)",
                    border: "none",
                    fontWeight: 800,
                    fontSize: 16,
                    color: "#FFFFFF",
                    boxShadow: "0 4px 16px rgba(6, 182, 212, 0.3)",
                    marginTop: 6,
                    letterSpacing: "0.5px",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(6, 182, 212, 0.45)";
                    e.currentTarget.style.transform = "translateY(-1.5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(6, 182, 212, 0.3)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {submitting ? <Spin size="small" style={{ color: "#ffffff" }} /> : "Sign In to Console"}
                </Button>
              </Space>
            </form>

            {/* Compliance & Security Footer Notice */}
            <div style={{ textAlign: "center", marginTop: 28, paddingTop: 16, borderTop: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
              <Text style={{ fontSize: 12, color: isDarkMode ? "#64748B" : "#94A3B8", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <SafetyCertificateOutlined style={{ color: "#10B981" }} /> Protected by 256-bit JWT Encryption & Audit Logging.
              </Text>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Forgot Password Reset Modal */}
      <Modal
        title={
          <Space>
            <KeyOutlined style={{ color: "#06B6D4" }} />
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
            prefix={<MailOutlined style={{ color: "#06B6D4" }} />}
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
            style={{ borderRadius: 10, background: "linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)", height: 44, fontWeight: 700, boxShadow: "0 0 15px rgba(6, 182, 212, 0.35)" }}
          >
            Send Password Reset Link
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
