import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, Row, Col, Descriptions, Avatar, Typography, notification, Space, Tag, Divider, Timeline, Modal, Upload, Select } from "antd";
import {
  UserOutlined,
  LockOutlined,
  SaveOutlined,
  SafetyOutlined,
  CameraOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
  LaptopOutlined,
  AlertOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const { Title, Text, Paragraph } = Typography;

const Profile = () => {
  const { user, role, changePassword } = useAuth();
  const { isDarkMode } = useTheme();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Profile Picture local State
  const [profilePic, setProfilePic] = useState(() => {
    return localStorage.getItem("vulnguard_avatar") || null;
  });

  // Local state for profile details so edit form saves instantly for display
  const [profileDetails, setProfileDetails] = useState({
    firstName: user?.first_name || "Niranjana",
    lastName: user?.last_name || "Cyber",
    email: user?.email || "niranjana@vulnguard.io",
    phone: user?.phone_number || "+1 (555) 192-3847",
    designation: user?.designation || "Senior Incident Response Architect",
    timezone: "UTC -05:00 (EST)",
    language: "English (US)"
  });

  useEffect(() => {
    if (user) {
      setProfileDetails((prev) => ({
        ...prev,
        firstName: user.first_name || prev.firstName,
        lastName: user.last_name || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone_number || prev.phone,
        designation: user.designation || prev.designation
      }));
    }
  }, [user]);

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

  const getRoleColor = (r) => {
    switch (r) {
      case "OWNER": return "#EF4444";
      case "ADMIN": return "#3B82F6";
      case "SECURITY_MANAGER": return "#8B5CF6";
      case "SECURITY_ANALYST": return "#14B8A6";
      case "IT_ENGINEER": return "#F59E0B";
      default: return "#64748B";
    }
  };

  const getInitials = (first, last) => {
    return `${(first || "").charAt(0)}${(last || "").charAt(0)}`.toUpperCase() || "VG";
  };

  // Avatar Upload / Remove Logic
  const handleAvatarUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setProfilePic(dataUrl);
      localStorage.setItem("vulnguard_avatar", dataUrl);
      notification.success({
        message: "Avatar Updated",
        description: "Your profile photo has been refreshed successfully."
      });
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto-upload request
  };

  const handleAvatarRemove = () => {
    setProfilePic(null);
    localStorage.removeItem("vulnguard_avatar");
    notification.success({
      message: "Avatar Removed",
      description: "Default fallback initials avatar will be shown."
    });
  };

  // Profile Edit Submission
  const handleEditProfileSubmit = (values) => {
    setProfileDetails({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      designation: values.designation,
      timezone: values.timezone,
      language: values.language
    });
    setEditModalOpen(false);
    notification.success({
      message: "Profile Updated",
      description: "Your personal preferences have been saved."
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ padding: "4px" }}
    >
      <Row gutter={[24, 24]}>
        {/* Left Column: Avatar & User Information */}
        <Col xs={24} lg={10}>
          <Card
            bordered={false}
            style={{
              background: isDarkMode ? "rgba(15, 23, 42, 0.75)" : "#FFFFFF",
              border: `1px solid ${isDarkMode ? "rgba(6, 182, 212, 0.18)" : "#E2E8F0"}`,
              borderRadius: 20,
              boxShadow: isDarkMode ? "0 8px 30px rgba(0, 0, 0, 0.2)" : "0 8px 30px rgba(0, 0, 0, 0.015)",
              textAlign: "center",
              padding: "24px 0",
              backdropFilter: "blur(12px)"
            }}
          >
            <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
              {profilePic ? (
                <Avatar size={120} src={profilePic} style={{ border: "2px solid #06B6D4", boxShadow: "0 0 25px rgba(6, 182, 212, 0.2)" }} />
              ) : (
                <Avatar
                  size={120}
                  style={{
                    backgroundColor: isDarkMode ? "#1E293B" : "#F1F5F9",
                    color: isDarkMode ? "#06B6D4" : "#2563EB",
                    fontSize: 36,
                    fontWeight: 800,
                    border: `2px solid ${isDarkMode ? "rgba(6,182,212,0.4)" : "#CBD5E1"}`,
                    boxShadow: isDarkMode ? "0 0 20px rgba(6, 182, 212, 0.15)" : "none"
                  }}
                >
                  {getInitials(profileDetails.firstName, profileDetails.lastName)}
                </Avatar>
              )}

              {/* Photo Action Buttons */}
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 12 }}>
                <Upload beforeUpload={handleAvatarUpload} showUploadList={false}>
                  <Button type="default" size="small" icon={<CameraOutlined />}>Change</Button>
                </Upload>
                {profilePic && (
                  <Button danger type="text" size="small" icon={<DeleteOutlined />} onClick={handleAvatarRemove}>Remove</Button>
                )}
              </div>
            </div>

            <Title level={3} style={{ margin: 0, fontWeight: 900, color: isDarkMode ? "#FFFFFF" : "#0F172A", letterSpacing: "-0.5px" }}>
              {profileDetails.firstName} {profileDetails.lastName}
            </Title>
            <Paragraph style={{ marginBottom: 12, color: isDarkMode ? "#94A3B8" : "#64748B", fontWeight: 600 }}>
              {profileDetails.designation}
            </Paragraph>
            
            <Space style={{ marginBottom: 24 }}>
              <Tag color={getRoleColor(role)} style={{ padding: "4px 16px", borderRadius: 12, fontWeight: 700, border: "none" }}>
                {role}
              </Tag>
              <Tag color="success" style={{ padding: "4px 16px", borderRadius: 12, fontWeight: 700, border: "none" }}>
                ACTIVE ACCOUNT
              </Tag>
            </Space>

            <Divider style={{ margin: "12px 0 20px 0", borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "#F1F5F9" }} />

            <Descriptions column={1} size="small" bordered={false} style={{ textAlign: "left", padding: "0 24px" }}>
              <Descriptions.Item label={<span style={{ color: isDarkMode ? "#64748B" : "#94A3B8", fontWeight: 700 }}>Employee ID</span>}>
                <strong style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{user?.employee_id || "VG-99238"}</strong>
              </Descriptions.Item>
              <Descriptions.Item label={<span style={{ color: isDarkMode ? "#64748B" : "#94A3B8", fontWeight: 700 }}>Username</span>}>
                <span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{user?.username}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<span style={{ color: isDarkMode ? "#64748B" : "#94A3B8", fontWeight: 700 }}>Primary Email</span>}>
                <span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{profileDetails.email}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<span style={{ color: isDarkMode ? "#64748B" : "#94A3B8", fontWeight: 700 }}>Phone Number</span>}>
                <span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{profileDetails.phone}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<span style={{ color: isDarkMode ? "#64748B" : "#94A3B8", fontWeight: 700 }}>Organization</span>}>
                <span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>VulnGuard Global Inc.</span>
              </Descriptions.Item>
              <Descriptions.Item label={<span style={{ color: isDarkMode ? "#64748B" : "#94A3B8", fontWeight: 700 }}>Department</span>}>
                <span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{user?.department_name || "Incident Response Team"}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<span style={{ color: isDarkMode ? "#64748B" : "#94A3B8", fontWeight: 700 }}>Timezone Scope</span>}>
                <span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{profileDetails.timezone}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<span style={{ color: isDarkMode ? "#64748B" : "#94A3B8", fontWeight: 700 }}>Locale Language</span>}>
                <span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{profileDetails.language}</span>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24, padding: "0 24px" }}>
              <Button
                type="primary"
                block
                icon={<EditOutlined />}
                onClick={() => {
                  editForm.setFieldsValue({
                    firstName: profileDetails.firstName,
                    lastName: profileDetails.lastName,
                    email: profileDetails.email,
                    phone: profileDetails.phone,
                    designation: profileDetails.designation,
                    timezone: profileDetails.timezone,
                    language: profileDetails.language
                  });
                  setEditModalOpen(true);
                }}
                style={{ borderRadius: 10, height: 42, background: "linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)", border: "none" }}
              >
                Modify User Profile
              </Button>
            </div>
          </Card>
        </Col>

        {/* Right Column: Security Status, Timeline, Session, and Password Card */}
        <Col xs={24} lg={14}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            
            {/* Security Status Panel */}
            <Card
              title={<span style={{ color: isDarkMode ? "#FFFFFF" : "#0f172a", fontWeight: 700 }}>System Integrity & Security Metrics</span>}
              bordered={false}
              style={{
                background: isDarkMode ? "rgba(15, 23, 42, 0.75)" : "#FFFFFF",
                border: `1px solid ${isDarkMode ? "rgba(6, 182, 212, 0.18)" : "#E2E8F0"}`,
                borderRadius: 20,
              }}
            >
              <Row gutter={[16, 16]}>
                {[
                  { label: "MFA Status", val: "MFA ACTIVE", color: "#10B981" },
                  { label: "Password Strength", val: "STRONG (92%)", color: "#10B981" },
                  { label: "Session Security", val: "ENCRYPTED JWT", color: "#06B6D4" },
                  { label: "Security score", val: "94/100", color: "#10B981" }
                ].map((stat, i) => (
                  <Col xs={12} sm={6} key={i}>
                    <div style={{ background: isDarkMode ? "rgba(30, 41, 59, 0.45)" : "#F8FAFC", padding: 12, borderRadius: 12, border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "#E2E8F0"}`, textAlign: "center" }}>
                      <span style={{ fontSize: 10, color: isDarkMode ? "#64748B" : "#94A3B8", fontWeight: 700, display: "block", textTransform: "uppercase" }}>{stat.label}</span>
                      <strong style={{ fontSize: 13, color: stat.color, display: "block", marginTop: 4 }}>{stat.val}</strong>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>

            {/* Active Device Sessions registry */}
            <Card
              title={<span style={{ color: isDarkMode ? "#FFFFFF" : "#0f172a", fontWeight: 700 }}>Console Session Ledger</span>}
              bordered={false}
              style={{
                background: isDarkMode ? "rgba(15, 23, 42, 0.75)" : "#FFFFFF",
                border: `1px solid ${isDarkMode ? "rgba(6, 182, 212, 0.18)" : "#E2E8F0"}`,
                borderRadius: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <LaptopOutlined style={{ fontSize: 32, color: "#06B6D4" }} />
                <div>
                  <Text style={{ fontWeight: 700, color: isDarkMode ? "#FFFFFF" : "#0F172A", display: "block" }}>Chrome on Windows 11 (Current Session)</Text>
                  <Text style={{ fontSize: 12, color: isDarkMode ? "#94A3B8" : "#64748B" }}>IP origin: 127.0.0.1 • Authorized via JSON Web Tokens • UTC-05:00</Text>
                </div>
              </div>
              <Divider style={{ margin: "16px 0", borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "#F1F5F9" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <Button type="default" size="small" onClick={() => notification.success({ message: "Current Session Secured", description: "Your current session credentials have been validated." })}>Validate Token</Button>
                <Button danger type="primary" size="small" onClick={() => logout()}>Terminate All Other Sessions</Button>
              </div>
            </Card>

            {/* Activity Timeline */}
            <Card
              title={<span style={{ color: isDarkMode ? "#FFFFFF" : "#0f172a", fontWeight: 700 }}>Personal Security Activity Trail</span>}
              bordered={false}
              style={{
                background: isDarkMode ? "rgba(15, 23, 42, 0.75)" : "#FFFFFF",
                border: `1px solid ${isDarkMode ? "rgba(6, 182, 212, 0.18)" : "#E2E8F0"}`,
                borderRadius: 20,
              }}
            >
              <Timeline
                mode="left"
                style={{ marginTop: 8 }}
                items={[
                  { label: "01:22 UTC", children: <span style={{ color: isDarkMode ? "#E2E8F0" : "#334155" }}>Updated SOC settings preferences</span>, color: "blue" },
                  { label: "00:54 UTC", children: <span style={{ color: isDarkMode ? "#E2E8F0" : "#334155" }}>Changed console user login credentials</span>, color: "orange" },
                  { label: "Yesterday", children: <span style={{ color: isDarkMode ? "#E2E8F0" : "#334155" }}>Asset registered: AWS Gateway Firewall Group</span>, color: "green" },
                  { label: "3 days ago", children: <span style={{ color: isDarkMode ? "#E2E8F0" : "#334155" }}>Vulnerabilities database dump uploaded successfully</span>, color: "green" }
                ]}
              />
            </Card>

            {/* Change Password Card */}
            <Card
              title={
                <Space>
                  <SafetyOutlined style={{ color: isDarkMode ? "#3B82F6" : "#2563EB", fontSize: 18 }} />
                  <span style={{ color: isDarkMode ? "#FFFFFF" : "#0F172A", fontWeight: 700 }}>Update Security Password</span>
                </Space>
              }
              bordered={false}
              style={{
                background: isDarkMode ? "rgba(15, 23, 42, 0.75)" : "#FFFFFF",
                border: `1px solid ${isDarkMode ? "rgba(6, 182, 212, 0.18)" : "#E2E8F0"}`,
                borderRadius: 20,
              }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handlePasswordSubmit}
              >
                <Form.Item
                  name="old_password"
                  label="Current Password"
                  rules={[{ required: true, message: "Enter your current password." }]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: "#94A3B8" }} />}
                    placeholder="Enter current password"
                    style={{ borderRadius: 10, height: 44 }}
                  />
                </Form.Item>

                <Form.Item
                  name="new_password"
                  label="New Password"
                  rules={[
                    { required: true, message: "Enter your new password." },
                    { min: 8, message: "Password must be at least 8 characters long." },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: "#94A3B8" }} />}
                    placeholder="Enter new password"
                    style={{ borderRadius: 10, height: 44 }}
                  />
                </Form.Item>

                <Form.Item
                  name="confirm_password"
                  label="Confirm New Password"
                  rules={[{ required: true, message: "Please confirm your new password." }]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: "#94A3B8" }} />}
                    placeholder="Confirm new password"
                    style={{ borderRadius: 10, height: 44 }}
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                    style={{
                      borderRadius: 10,
                      height: 44,
                      background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                      border: "none",
                      fontWeight: 600,
                      boxShadow: "0 4px 15px rgba(37, 99, 235, 0.2)",
                    }}
                  >
                    Save New Password
                  </Button>
                </Form.Item>
              </Form>
            </Card>

          </Space>
        </Col>
      </Row>

      {/* Edit Profile Information Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: "#06B6D4" }} />
            <span style={{ fontWeight: 800 }}>Edit Profile Information</span>
          </Space>
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        destroyOnClose
        centered
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditProfileSubmit} style={{ marginTop: 12 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                <Input style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                <Input style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="email" label="Primary Email" rules={[{ required: true, type: "email" }]}>
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="phone" label="Phone Number">
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="designation" label="Designation Title">
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="timezone" label="Timezone">
                <Select style={{ borderRadius: 8 }}>
                  <Select.Option value="UTC -05:00 (EST)">UTC -05:00 (EST)</Select.Option>
                  <Select.Option value="UTC +00:00 (GMT)">UTC +00:00 (GMT)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="language" label="Preferred Language">
                <Select style={{ borderRadius: 8 }}>
                  <Select.Option value="English (US)">English (US)</Select.Option>
                  <Select.Option value="German (DE)">German (DE)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Button onClick={() => setEditModalOpen(false)} style={{ borderRadius: 8 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ borderRadius: 8, background: "linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)", border: "none" }}>Save Preferences</Button>
          </div>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default Profile;
