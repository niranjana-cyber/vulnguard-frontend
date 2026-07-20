import React, { useState } from "react";
import { Card, Form, Input, Button, Row, Col, Descriptions, Avatar, Typography, notification, Space, Tag, Divider } from "antd";
import { UserOutlined, LockOutlined, SaveOutlined, SafetyOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const { Title, Text, Paragraph } = Typography;

const Profile = () => {
  const { user, role, changePassword } = useAuth();
  const { isDarkMode } = useTheme();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

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

  const getInitials = (first, last) => {
    return `${(first || "").charAt(0)}${(last || "").charAt(0)}`.toUpperCase() || "VG";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Row gutter={[24, 24]}>
        {/* Profile Info Card */}
        <Col xs={24} lg={10}>
          <Card
            bordered={false}
            style={{
              background: isDarkMode ? "#1E293B" : "#FFFFFF",
              border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
              borderRadius: 20,
              boxShadow: isDarkMode ? "0 8px 30px rgba(0, 0, 0, 0.2)" : "0 8px 30px rgba(0, 0, 0, 0.015)",
              textAlign: "center",
              padding: "24px 0",
            }}
          >
            <Avatar
              size={110}
              style={{
                backgroundColor: isDarkMode ? "#3B82F6" : "#2563EB",
                marginBottom: 20,
                boxShadow: "0 10px 25px rgba(37, 99, 235, 0.3)",
                fontSize: 32,
                fontWeight: 700,
              }}
            >
              {getInitials(user?.first_name, user?.last_name)}
            </Avatar>
            <Title level={3} style={{ margin: 0, fontWeight: 800, color: isDarkMode ? "#FFFFFF" : "#0F172A" }}>
              {user?.first_name} {user?.last_name}
            </Title>
            <Paragraph style={{ marginBottom: 16, color: isDarkMode ? "#94A3B8" : "#64748B", fontWeight: 500 }}>
              {user?.designation || "Cybersecurity Professional"}
            </Paragraph>
            <Tag
              color={getRoleColor(role)}
              style={{
                fontSize: 12,
                padding: "4px 20px",
                borderRadius: 16,
                color: "#ffffff",
                fontWeight: 600,
                border: "none",
                marginBottom: 24,
              }}
            >
              {role?.replace("_", " ")}
            </Tag>

            <Divider style={{ margin: "12px 0 24px 0" }} />

            <Descriptions column={1} size="small" bordered={false} style={{ textAlign: "left", padding: "0 24px" }}>
              <Descriptions.Item label={<span style={{ color: isDarkMode ? "#64748B" : "#94A3B8", fontWeight: 600 }}>Employee ID</span>}>
                <strong style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{user?.employee_id}</strong>
              </Descriptions.Item>
              <Descriptions.Item label={<span style={{ color: isDarkMode ? "#64748B" : "#94A3B8", fontWeight: 600 }}>Username</span>}>
                <span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{user?.username}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<span style={{ color: isDarkMode ? "#64748B" : "#94A3B8", fontWeight: 600 }}>Email Address</span>}>
                <span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{user?.email}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<span style={{ color: isDarkMode ? "#64748B" : "#94A3B8", fontWeight: 600 }}>Phone Number</span>}>
                <span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{user?.phone_number || "N/A"}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<span style={{ color: isDarkMode ? "#64748B" : "#94A3B8", fontWeight: 600 }}>Department</span>}>
                <span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{user?.department || user?.department_name || "N/A"}</span>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Change Password Card */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <SafetyOutlined style={{ color: isDarkMode ? "#3B82F6" : "#2563EB", fontSize: 18 }} />
                <span style={{ color: isDarkMode ? "#FFFFFF" : "#0F172A", fontWeight: 700 }}>Console Security settings</span>
              </Space>
            }
            bordered={false}
            style={{
              background: isDarkMode ? "#1E293B" : "#FFFFFF",
              border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
              borderRadius: 20,
              boxShadow: isDarkMode ? "0 8px 30px rgba(0, 0, 0, 0.2)" : "0 8px 30px rgba(0, 0, 0, 0.015)",
            }}
          >
            <Paragraph style={{ color: isDarkMode ? "#94A3B8" : "#64748B" }}>
              Change your account password below. Passwords must be at least 8 characters long and secure.
            </Paragraph>

            <Form
              form={form}
              layout="vertical"
              onFinish={handlePasswordSubmit}
              style={{ marginTop: 24 }}
            >
              <Form.Item
                name="old_password"
                label="Current Password"
                rules={[{ required: true, message: "Enter your current password." }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#94A3B8" }} />}
                  placeholder="Enter current password"
                  style={{
                    borderRadius: 10,
                    height: 44,
                    background: isDarkMode ? "#0F172A" : "#FFFFFF",
                    border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
                  }}
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
                  style={{
                    borderRadius: 10,
                    height: 44,
                    background: isDarkMode ? "#0F172A" : "#FFFFFF",
                    border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
                  }}
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
                  style={{
                    borderRadius: 10,
                    height: 44,
                    background: isDarkMode ? "#0F172A" : "#FFFFFF",
                    border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
                  }}
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
        </Col>
      </Row>
    </motion.div>
  );
};

export default Profile;
