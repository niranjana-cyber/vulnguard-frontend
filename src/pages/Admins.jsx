import React, { useState, useEffect } from "react";
import { Table, Button, Card, Space, Input, Modal, Form, notification, Switch, Typography, Popconfirm, Tag, Tooltip, Avatar } from "antd";
import { PlusOutlined, DeleteOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, UserOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

const { Title, Paragraph, Text } = Typography;

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { isDarkMode } = useTheme();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/owner/admins/list/");
      if (res.data.success) {
        setAdmins(res.data.data);
      }
    } catch (err) {
      notification.error({
        message: "Error fetching admins",
        description: err.response?.data?.message || "Failed to load admin users.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleOpenAdd = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (values) => {
    try {
      const res = await api.post("/auth/owner/admins/", values);
      if (res.data.success) {
        notification.success({ message: "Admin created successfully" });
        setIsModalOpen(false);
        fetchAdmins();
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const formErrors = Object.keys(errors).map((key) => ({
          name: key,
          errors: Array.isArray(errors[key]) ? errors[key] : [errors[key]],
        }));
        form.setFields(formErrors);
      } else {
        notification.error({
          message: "Registration failed",
          description: err.response?.data?.message || "An error occurred during registry.",
        });
      }
    }
  };

  const handleToggleStatus = async (record) => {
    try {
      const res = await api.patch(`/auth/owner/admins/${record.id}/status/`);
      if (res.data.success) {
        notification.success({
          message: res.data.message || "Admin status updated.",
        });
        fetchAdmins();
      }
    } catch (err) {
      notification.error({
        message: "Failed to change admin status",
        description: err.response?.data?.message || "Toggle operation failed.",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/auth/owner/admins/${id}/delete/`);
      if (res.data.success) {
        notification.success({ message: "Admin deleted successfully" });
        fetchAdmins();
      }
    } catch (err) {
      notification.error({
        message: "Delete failed",
        description: err.response?.data?.message || "Failed to delete administrator.",
      });
    }
  };

  const filteredData = admins.filter((admin) => {
    const fullName = `${admin.first_name || ""} ${admin.last_name || ""}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchText.toLowerCase()) ||
      (admin.username || "").toLowerCase().includes(searchText.toLowerCase()) ||
      admin.employee_id.toLowerCase().includes(searchText.toLowerCase()) ||
      (admin.email || "").toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

  const getInitials = (first, last) => {
    return `${(first || "").charAt(0)}${(last || "").charAt(0)}`.toUpperCase() || "?";
  };

  const columns = [
    {
      title: "Employee ID",
      dataIndex: "employee_id",
      key: "employee_id",
      render: (text) => <Tag color="blue" style={{ borderRadius: 6, fontWeight: 600 }}>{text}</Tag>,
    },
    {
      title: "Admin Name",
      key: "name",
      render: (_, record) => (
        <Space size="middle">
          <Avatar
            style={{
              backgroundColor: isDarkMode ? "#3B82F6" : "#2563EB",
              verticalAlign: "middle",
              fontWeight: 600,
            }}
          >
            {getInitials(record.first_name, record.last_name)}
          </Avatar>
          <strong style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>
            {record.first_name} {record.last_name}
          </strong>
        </Space>
      ),
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text) => <span style={{ color: isDarkMode ? "#94A3B8" : "#475569" }}>{text}</span>,
    },
    {
      title: "Email Address",
      dataIndex: "email",
      key: "email",
      render: (text) => <span style={{ color: isDarkMode ? "#94A3B8" : "#475569" }}>{text}</span>,
    },
    {
      title: "Phone Number",
      dataIndex: "phone_number",
      key: "phone_number",
      render: (text) => <span style={{ color: isDarkMode ? "#94A3B8" : "#475569" }}>{text || "N/A"}</span>,
    },
    {
      title: "Active Status",
      dataIndex: "is_active_employee",
      key: "is_active",
      render: (isActive, record) => (
        <Space size="middle">
          <Switch
            checked={isActive}
            onChange={() => handleToggleStatus(record)}
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<CloseCircleOutlined />}
          />
          <Tag color={isActive ? "green" : "red"} style={{ borderRadius: 6, fontWeight: 600 }}>
            {isActive ? "ACTIVE" : "INACTIVE"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Popconfirm
          title="Delete Admin Account"
          description="Are you sure you want to delete this administrator?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes, Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true, shape: "round" }}
          cancelButtonProps={{ shape: "round" }}
        >
          <Tooltip title="Delete Admin">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        bordered={false}
        style={{
          background: isDarkMode ? "#1E293B" : "#FFFFFF",
          border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
          borderRadius: 16,
          boxShadow: isDarkMode ? "0 8px 30px rgba(0, 0, 0, 0.2)" : "0 8px 30px rgba(0, 0, 0, 0.015)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 800, color: isDarkMode ? "#FFFFFF" : "#0F172A" }}>
              System Administrators
            </Title>
            <Paragraph style={{ margin: 0, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
              Register and monitor platform Admin accounts. OWNER permission scope.
            </Paragraph>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenAdd}
            style={{
              borderRadius: 10,
              background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
              border: "none",
              height: 42,
              fontWeight: 600,
              boxShadow: "0 4px 15px rgba(37, 99, 235, 0.2)",
            }}
          >
            Add Admin Account
          </Button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <Input
            placeholder="Search by ID, name, email, or username..."
            prefix={<SearchOutlined style={{ color: "#94A3B8" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              maxWidth: 320,
              borderRadius: 10,
              height: 40,
              background: isDarkMode ? "#0F172A" : "#FFFFFF",
              border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
            }}
          />
        </div>

        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          size="middle"
          scroll={{ x: true }}
        />

        <Modal
          title="Register System Admin"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={() => form.submit()}
          okText="Create Admin"
          cancelText="Cancel"
          okButtonProps={{
            style: {
              background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
              border: "none",
              borderRadius: 8,
            },
          }}
          cancelButtonProps={{ style: { borderRadius: 8 } }}
          style={{ borderRadius: 16 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleModalSubmit}
            style={{ marginTop: 16 }}
          >
            <Space style={{ display: "flex", width: "100%" }} align="start">
              <Form.Item
                name="first_name"
                label="First Name"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="e.g. Alice" style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item
                name="last_name"
                label="Last Name"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="e.g. Smith" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Space>

            <Space style={{ display: "flex", width: "100%" }} align="start">
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="e.g. alice_admin" style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: "Required" },
                  { type: "email", message: "Enter a valid email address." },
                ]}
                style={{ flex: 1 }}
              >
                <Input placeholder="e.g. alice@company.com" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Space>

            <Space style={{ display: "flex", width: "100%" }} align="start">
              <Form.Item
                name="password"
                label="Login Password"
                rules={[
                  { required: true, message: "Required" },
                  { min: 8, message: "Password must be at least 8 characters long." },
                ]}
                style={{ flex: 1 }}
              >
                <Input.Password placeholder="Enter password" style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item
                name="employee_id"
                label="Employee ID Code"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="e.g. ADM-05" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Space>

            <Space style={{ display: "flex", width: "100%" }} align="start">
              <Form.Item
                name="designation"
                label="Corporate Designation"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="e.g. Lead Devops Architect" style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item
                name="phone_number"
                label="Phone Number"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="e.g. +14150000" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Space>
          </Form>
        </Modal>
      </Card>
    </motion.div>
  );
};

export default Admins;
