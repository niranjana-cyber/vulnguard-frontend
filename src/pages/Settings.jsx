import React, { useState } from "react";
import { Card, Tabs, Form, Input, Button, Switch, Select, Table, Space, Tag, Divider, Typography, Row, Col, Alert, notification } from "antd";
import {
  SettingOutlined,
  LockOutlined,
  BellOutlined,
  EyeOutlined,
  GlobalOutlined,
  HistoryOutlined,
  SaveOutlined,
  KeyOutlined,
  MobileOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const Settings = () => {
  const { user, role, changePassword, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [compactLayout, setCompactLayout] = useState(false);

  const handlePasswordSubmit = async (values) => {
    if (values.new_password !== values.confirm_password) {
      notification.error({
        message: "Validation Error",
        description: "New passwords do not match.",
      });
      return;
    }

    setLoading(true);
    const res = await changePassword(values.old_password, values.new_password);
    setLoading(false);
    
    if (res.success) {
      notification.success({
        message: "Password Updated",
        description: "Your login credentials have been changed successfully.",
      });
      form.resetFields();
    } else {
      notification.error({
        message: "Credential Update Failed",
        description: res.message || "Could not change password.",
      });
    }
  };

  const auditLogsData = [
    { key: "1", action: "LOGIN", desc: "User logged into VulnGuard Web Console", ip: "127.0.0.1", time: "2026-07-22 01:10:45" },
    { key: "2", action: "PASSWORD_CHANGE", desc: "User updated security authentication credential", ip: "127.0.0.1", time: "2026-07-22 00:54:12" },
    { key: "3", action: "ASSET_CREATE", desc: "Registered new AWS Elastic Kubernetes node group", ip: "127.0.0.1", time: "2026-07-21 23:45:00" },
    { key: "4", action: "VULN_IMPORT", desc: "Uploaded CVE telemetry logs via CSV patch", ip: "127.0.0.1", time: "2026-07-21 21:00:30" }
  ];

  const auditColumns = [
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (act) => <Tag color={act.includes("CHANGE") ? "orange" : act.includes("LOGIN") ? "blue" : "green"}>{act}</Tag>
    },
    {
      title: "Details Description",
      dataIndex: "desc",
      key: "desc"
    },
    {
      title: "Origin IP",
      dataIndex: "ip",
      key: "ip",
      render: (ip) => <code style={{ color: "#06B6D4" }}>{ip}</code>
    },
    {
      title: "Timestamp",
      dataIndex: "time",
      key: "time"
    }
  ];

  const tabItems = [
    {
      key: "account",
      label: (
        <span>
          <SettingOutlined /> Account Settings
        </span>
      ),
      children: (
        <Card
          bordered={false}
          style={{ background: "transparent", padding: 0 }}
        >
          <Title level={4} style={{ color: isDarkMode ? "#ffffff" : "#0f172a" }}>Edit Profile & Contact Details</Title>
          <Paragraph style={{ color: isDarkMode ? "#94A3B8" : "#64748B" }}>
            Configure your enterprise designation, email endpoints, and contact number.
          </Paragraph>
          <Form layout="vertical" initialValues={{ email: user?.email, phone: user?.phone_number || "+1 (555) 019-2834", username: user?.username }} style={{ marginTop: 24, maxWidth: 600 }}>
            <Form.Item label="Username Preference" name="username">
              <Input disabled style={{ borderRadius: 8, height: 40 }} />
            </Form.Item>
            <Form.Item label="Primary Email Address" name="email" rules={[{ required: true, type: "email" }]}>
              <Input style={{ borderRadius: 8, height: 40 }} />
            </Form.Item>
            <Form.Item label="Business Phone Number" name="phone">
              <Input style={{ borderRadius: 8, height: 40 }} />
            </Form.Item>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => notification.success({ message: "Settings Saved", description: "Your contact details have been updated." })}
              style={{ borderRadius: 8, height: 42, background: "linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)", border: "none" }}
            >
              Save Profile Preferences
            </Button>
          </Form>
        </Card>
      )
    },
    {
      key: "security",
      label: (
        <span>
          <LockOutlined /> Security & MFA
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card
              bordered={false}
              style={{ background: isDarkMode ? "rgba(30, 41, 59, 0.4)" : "#F8FAFC", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "#E2E8F0"}`, borderRadius: 16 }}
            >
              <Title level={4} style={{ color: isDarkMode ? "#ffffff" : "#0f172a" }}>Update Authentication Credentials</Title>
              <Form form={form} layout="vertical" onFinish={handlePasswordSubmit} style={{ marginTop: 20 }}>
                <Form.Item name="old_password" label="Current Password" rules={[{ required: true }]}>
                  <Input.Password style={{ borderRadius: 8, height: 40 }} />
                </Form.Item>
                <Form.Item name="new_password" label="New Password" rules={[{ required: true, min: 8 }]}>
                  <Input.Password style={{ borderRadius: 8, height: 40 }} />
                </Form.Item>
                <Form.Item name="confirm_password" label="Confirm Password" rules={[{ required: true }]}>
                  <Input.Password style={{ borderRadius: 8, height: 40 }} />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} style={{ borderRadius: 8, height: 42, background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)", border: "none" }}>
                  Save New Password
                </Button>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              bordered={false}
              style={{ background: isDarkMode ? "rgba(30, 41, 59, 0.4)" : "#F8FAFC", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "#E2E8F0"}`, borderRadius: 16, height: "100%" }}
            >
              <Title level={4} style={{ color: isDarkMode ? "#ffffff" : "#0f172a", marginBottom: 20 }}>Multi-Factor Authentication (MFA)</Title>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                  <Text style={{ fontWeight: 700, display: "block", color: isDarkMode ? "#ffffff" : "#0f172a" }}>Hardware / App Authenticator</Text>
                  <Text style={{ fontSize: 12, color: isDarkMode ? "#94A3B8" : "#64748B" }}>Require TOTP tokens from Google Authenticator or Yubikey.</Text>
                </div>
                <Switch checked={mfaEnabled} onChange={(val) => {
                  setMfaEnabled(val);
                  notification.success({ message: "MFA Status Changed", description: val ? "MFA has been enabled on your account." : "MFA has been disabled." });
                }} />
              </div>
              <Divider />
              <Title level={5} style={{ color: isDarkMode ? "#ffffff" : "#0f172a" }}>Active Device Sessions</Title>
              <div style={{ background: isDarkMode ? "rgba(15, 23, 42, 0.6)" : "#ffffff", padding: 12, borderRadius: 8, marginTop: 12, border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "#E2E8F0"}` }}>
                <Text style={{ fontWeight: 600, display: "block", color: isDarkMode ? "#ffffff" : "#0f172a" }}>Chrome on Windows (Current Session)</Text>
                <code style={{ fontSize: 11, color: "#06B6D4" }}>IP Address: 127.0.0.1 • Location: Localhost</code>
                <Button danger type="primary" size="small" style={{ marginTop: 12, borderRadius: 6 }} onClick={() => {
                  notification.success({ message: "Sessions Purged", description: "Logged out of all other enterprise devices." });
                }}>
                  Logout Other Sessions
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: "notifications",
      label: (
        <span>
          <BellOutlined /> Notification Settings
        </span>
      ),
      children: (
        <Card
          bordered={false}
          style={{ background: "transparent", padding: 0 }}
        >
          <Title level={4} style={{ color: isDarkMode ? "#ffffff" : "#0f172a" }}>Alert & Telemetry Routing Notifications</Title>
          <Paragraph style={{ color: isDarkMode ? "#94A3B8" : "#64748B" }}>Choose which incident vectors trigger immediate email alerts.</Paragraph>
          <Space direction="vertical" size="large" style={{ width: "100%", marginTop: 20 }}>
            {[
              { title: "Critical Vulnerabilities Detected", desc: "Notify immediately when CVE severity rating exceeds CVSS 9.0." },
              { title: "SLA Due Date Warnings", desc: "Remind 48 hours before task resolution deadline limits." },
              { title: "Asset Compliance Shifts", desc: "Trigger notifications if servers or databases shift out of audit compliance." },
              { title: "System Audit Ledger Dumps", desc: "Receive weekly PDF digest reports of administrative actions." }
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Text style={{ fontWeight: 700, display: "block", color: isDarkMode ? "#ffffff" : "#0f172a" }}>{item.title}</Text>
                  <Text style={{ fontSize: 12, color: isDarkMode ? "#94A3B8" : "#64748B" }}>{item.desc}</Text>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </Space>
        </Card>
      )
    },
    {
      key: "appearance",
      label: (
        <span>
          <EyeOutlined /> Appearance Preferences
        </span>
      ),
      children: (
        <Card
          bordered={false}
          style={{ background: "transparent", padding: 0 }}
        >
          <Title level={4} style={{ color: isDarkMode ? "#ffffff" : "#0f172a" }}>SOC Theme Settings</Title>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, marginTop: 16 }}>
            <div>
              <Text style={{ fontWeight: 700, display: "block", color: isDarkMode ? "#ffffff" : "#0f172a" }}>Dark / Light Cyber Mode</Text>
              <Text style={{ fontSize: 12, color: isDarkMode ? "#94A3B8" : "#64748B" }}>Toggle visual contrast settings of the VulnGuard dashboard layout.</Text>
            </div>
            <Switch checked={isDarkMode} onChange={toggleTheme} checkedChildren="Dark" unCheckedChildren="Light" />
          </div>
          <Divider />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Text style={{ fontWeight: 700, display: "block", color: isDarkMode ? "#ffffff" : "#0f172a" }}>Compact Grid Layout</Text>
              <Text style={{ fontSize: 12, color: isDarkMode ? "#94A3B8" : "#64748B" }}>Fit more telemetry metrics on high resolution dashboard screens.</Text>
            </div>
            <Switch checked={compactLayout} onChange={setCompactLayout} />
          </div>
        </Card>
      )
    },
    {
      key: "preferences",
      label: (
        <span>
          <GlobalOutlined /> Preferences
        </span>
      ),
      children: (
        <Card
          bordered={false}
          style={{ background: "transparent", padding: 0 }}
        >
          <Title level={4} style={{ color: isDarkMode ? "#ffffff" : "#0f172a" }}>Locale & Global Scope Settings</Title>
          <Form layout="vertical" style={{ marginTop: 20, maxWidth: 600 }}>
            <Form.Item label="Time Zone Grid">
              <Select defaultValue="UTC" style={{ borderRadius: 8 }}>
                <Select.Option value="UTC">Coordinated Universal Time (UTC)</Select.Option>
                <Select.Option value="EST">Eastern Standard Time (EST)</Select.Option>
                <Select.Option value="GMT">Greenwich Mean Time (GMT)</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Date & Time Formatting Format">
              <Select defaultValue="YYYY-MM-DD" style={{ borderRadius: 8 }}>
                <Select.Option value="YYYY-MM-DD">YYYY-MM-DD (2026-07-22)</Select.Option>
                <Select.Option value="DD/MM/YYYY">DD/MM/YYYY (22/07/2026)</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Language">
              <Select defaultValue="en" style={{ borderRadius: 8 }}>
                <Select.Option value="en">English (US/UK)</Select.Option>
                <Select.Option value="de">German (Deutsch)</Select.Option>
              </Select>
            </Form.Item>
            <Button type="primary" onClick={() => notification.success({ message: "Preferences Saved", description: "Locale preferences updated successfully." })} style={{ borderRadius: 8, height: 42, background: "linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)", border: "none" }}>
              Save Regional Preferences
            </Button>
          </Form>
        </Card>
      )
    },
    {
      key: "audit",
      label: (
        <span>
          <HistoryOutlined /> Audit Logs
        </span>
      ),
      children: (
        <Card
          bordered={false}
          style={{ background: "transparent", padding: 0 }}
        >
          <Title level={4} style={{ color: isDarkMode ? "#ffffff" : "#0f172a" }}>Personal Security Incident Logs</Title>
          <Paragraph style={{ color: isDarkMode ? "#94A3B8" : "#64748B" }}>Review administrative and credential operations mapped to your session.</Paragraph>
          <Table dataSource={auditLogsData} columns={auditColumns} pagination={false} size="middle" style={{ marginTop: 16 }} />
        </Card>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ padding: "4px" }}
    >
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 800, color: isDarkMode ? "#FFFFFF" : "#0F172A" }}>
          Settings & Security Command
        </Title>
        <Paragraph style={{ margin: 0, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
          Manage your organizational profile parameters, audit trailing logbooks, and multi-factor credentials.
        </Paragraph>
      </div>

      <Card
        bordered={false}
        style={{
          background: isDarkMode ? "rgba(15, 23, 42, 0.75)" : "#FFFFFF",
          border: `1px solid ${isDarkMode ? "rgba(6, 182, 212, 0.18)" : "#E2E8F0"}`,
          borderRadius: 20,
          boxShadow: isDarkMode ? "0 8px 30px rgba(0, 0, 0, 0.2)" : "0 8px 30px rgba(0, 0, 0, 0.015)",
          padding: "16px 20px"
        }}
      >
        <Tabs defaultActiveKey="account" items={tabItems} size="large" />
      </Card>
    </motion.div>
  );
};

export default Settings;
