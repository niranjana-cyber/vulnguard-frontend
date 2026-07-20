import React from "react";
import { Button, Typography, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import { SafetyCertificateOutlined, WarningOutlined, ExclamationCircleOutlined, CloudSyncOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const BaseErrorLayout = ({ code, icon, title, subtitle, actionText, onAction }) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "75vh",
        padding: "40px 20px",
        background: isDarkMode ? "#1E293B" : "#FFFFFF",
        borderRadius: 20,
        boxShadow: isDarkMode 
          ? "0 10px 40px rgba(0, 0, 0, 0.3)" 
          : "0 10px 40px rgba(0, 0, 0, 0.015)",
        textAlign: "center",
        transition: "all 0.3s ease",
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
        style={{ marginBottom: 24 }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: isDarkMode ? "rgba(59, 130, 246, 0.15)" : "rgba(37, 99, 235, 0.08)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto 16px",
            boxShadow: isDarkMode ? "0 8px 30px rgba(59, 130, 246, 0.2)" : "0 8px 25px rgba(37, 99, 235, 0.1)",
          }}
        >
          {icon}
        </div>
        <h1
          style={{
            fontSize: "72px",
            margin: 0,
            lineHeight: 1,
            fontWeight: 800,
            background: "linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-2px",
          }}
        >
          {code}
        </h1>
      </motion.div>

      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        <Title level={3} style={{ marginTop: 0, marginBottom: 8, fontWeight: 700, color: isDarkMode ? "#FFFFFF" : "#0F172A" }}>
          {title}
        </Title>
        <Paragraph style={{ maxWidth: 460, margin: "0 auto 32px", fontSize: 15, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
          {subtitle}
        </Paragraph>
        
        <Button
          type="primary"
          size="large"
          onClick={onAction}
          style={{
            borderRadius: 10,
            height: 48,
            padding: "0 32px",
            fontWeight: 600,
            background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
            border: "none",
            boxShadow: "0 8px 25px rgba(37, 99, 235, 0.2)",
          }}
        >
          {actionText}
        </Button>
      </motion.div>
    </div>
  );
};

export const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <BaseErrorLayout
      code="404"
      icon={<WarningOutlined style={{ fontSize: 44, color: "#EF4444" }} />}
      title="Page Not Found"
      subtitle="The security endpoint resource you are trying to query does not exist or has been relocated to another scope."
      actionText="Back to Dashboard"
      onAction={() => navigate("/dashboard")}
    />
  );
};

export const ForbiddenPage = () => {
  const navigate = useNavigate();
  return (
    <BaseErrorLayout
      code="403"
      icon={<SafetyCertificateOutlined style={{ fontSize: 44, color: "#EF4444" }} />}
      title="Access Denied"
      subtitle="Your account role does not possess the credentials or RBAC security clearance required to inspect this scope."
      actionText="Back to Dashboard"
      onAction={() => navigate("/dashboard")}
    />
  );
};

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  return (
    <BaseErrorLayout
      code="401"
      icon={<ExclamationCircleOutlined style={{ fontSize: 44, color: "#F59E0B" }} />}
      title="Session Expired"
      subtitle="Your authentication token key signature is missing or has expired. Please re-authenticate at the login console."
      actionText="Sign In Again"
      onAction={() => navigate("/login")}
    />
  );
};

export const ServerErrorPage = () => {
  const navigate = useNavigate();
  return (
    <BaseErrorLayout
      code="500"
      icon={<CloudSyncOutlined style={{ fontSize: 44, color: "#EF4444" }} />}
      title="Internal Security Error"
      subtitle="The central server encountered an unexpected error compiling your request. Please try again or audit backend logs."
      actionText="Retry Dashboard Connection"
      onAction={() => navigate("/dashboard")}
    />
  );
};
