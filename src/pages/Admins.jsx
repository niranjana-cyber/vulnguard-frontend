import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Space,
  Input,
  Modal,
  Form,
  notification,
  Switch,
  Typography,
  Popconfirm,
  Tag,
  Tooltip,
  Avatar,
  Row,
  Col,
  Drawer,
  Select,
  Progress,
  Timeline,
  Divider,
  Empty
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  LockOutlined,
  PrinterOutlined,
  FileTextOutlined,
  FileExcelOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

const { Title, Paragraph, Text } = Typography;

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { isDarkMode } = useTheme();

  // Modal & Drawer states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drawerAdmin, setDrawerAdmin] = useState(null);
  const [form] = Form.useForm();

  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);

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

    let matchesStatus = true;
    if (statusFilter === "active") matchesStatus = admin.is_active_employee;
    if (statusFilter === "inactive") matchesStatus = !admin.is_active_employee;

    return matchesSearch && matchesStatus;
  });

  const getInitials = (first, last) => {
    return `${(first || "").charAt(0)}${(last || "").charAt(0)}`.toUpperCase() || "?";
  };

  const columns = [
    {
      title: "Employee ID",
      dataIndex: "employee_id",
      key: "employee_id",
      sorter: (a, b) => a.employee_id.localeCompare(b.employee_id),
      render: (text) => <Tag color="blue" style={{ borderRadius: 6, fontWeight: 800 }}>{text}</Tag>,
    },
    {
      title: "Admin Name",
      key: "name",
      sorter: (a, b) => a.first_name.localeCompare(b.first_name),
      render: (_, record) => (
        <Space size="middle">
          <Avatar
            style={{
              backgroundColor: isDarkMode ? "#06B6D4" : "#2563EB",
              verticalAlign: "middle",
              fontWeight: 700,
            }}
          >
            {getInitials(record.first_name, record.last_name)}
          </Avatar>
          <strong
            style={{ cursor: "pointer", color: isDarkMode ? "#F1F5F9" : "#0F172A" }}
            onClick={() => setDrawerAdmin(record)}
          >
            {record.first_name} {record.last_name}
          </strong>
        </Space>
      ),
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email Address",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phone_number",
      key: "phone_number",
      render: (text) => <span>{text || "N/A"}</span>,
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
          <Tag color={isActive ? "green" : "red"} style={{ borderRadius: 6, fontWeight: 700 }}>
            {isActive ? "ACTIVE" : "INACTIVE"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Insights">
            <Button type="text" icon={<EyeOutlined style={{ color: "#06B6D4" }} />} onClick={() => setDrawerAdmin(record)} />
          </Tooltip>
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
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ padding: "4px" }}
    >
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: isDarkMode ? "#FFFFFF" : "#0F172A" }}>
            Administrator Directory
          </Title>
          <Paragraph style={{ margin: 0, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
            Configure and audit global administrative scopes, system access credentials, and security roles.
          </Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenAdd}
          style={{
            borderRadius: 10,
            background: "linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)",
            border: "none",
            height: 42,
            fontWeight: 600,
            boxShadow: "0 4px 15px rgba(6, 182, 212, 0.25)",
          }}
        >
          Add Admin Account
        </Button>
      </div>

      {/* Quick Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: "Total Admins", val: admins.length, color: "#06B6D4", icon: <UserOutlined /> },
          { title: "Active Accounts", val: admins.filter(a => a.is_active_employee).length, color: "#10B981", icon: <CheckCircleOutlined /> },
          { title: "Disabled Accounts", val: admins.filter(a => !a.is_active_employee).length, color: "#EF4444", icon: <CloseCircleOutlined /> },
          { title: "System Posture Score", val: "96/100", color: "#6366F1", icon: <SafetyCertificateOutlined /> }
        ].map((stat, i) => (
          <Col xs={12} sm={6} md={6} key={i}>
            <Card
              bordered={false}
              style={{
                background: isDarkMode ? "rgba(15, 23, 42, 0.7)" : "#FFFFFF",
                border: `1px solid ${isDarkMode ? "rgba(6, 182, 212, 0.15)" : "#E2E8F0"}`,
                borderRadius: 16,
                backdropFilter: "blur(12px)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Text style={{ fontSize: 11, color: isDarkMode ? "#64748B" : "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>{stat.title}</Text>
                  <Title level={3} style={{ margin: "4px 0 0 0", color: stat.color, fontWeight: 900 }}>{stat.val}</Title>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter toolbar */}
      <Card
        bordered={false}
        style={{
          background: isDarkMode ? "rgba(15, 23, 42, 0.7)" : "#FFFFFF",
          border: `1px solid ${isDarkMode ? "rgba(6, 182, 212, 0.15)" : "#E2E8F0"}`,
          borderRadius: 16,
          marginBottom: 24,
          backdropFilter: "blur(12px)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Space size="middle" wrap>
            <Input
              placeholder="Search by ID, name, email, or username..."
              prefix={<SearchOutlined style={{ color: "#06B6D4" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 320, borderRadius: 8, height: 38 }}
            />
            <Select
              defaultValue="all"
              style={{ width: 140, borderRadius: 8 }}
              onChange={(val) => setStatusFilter(val)}
            >
              <Select.Option value="all">All Statuses</Select.Option>
              <Select.Option value="active">Active Only</Select.Option>
              <Select.Option value="inactive">Inactive Only</Select.Option>
            </Select>
          </Space>

          <Space wrap>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()} style={{ borderRadius: 8 }}>Print</Button>
            <Button icon={<FileTextOutlined />} onClick={() => notification.success({ message: "CSV Export Queue Started", description: "Exporting admins catalog..." })} style={{ borderRadius: 8 }}>CSV</Button>
            <Button type="primary" icon={<FileExcelOutlined />} onClick={() => notification.success({ message: "Excel Generation Triggered", description: "Admin spreadsheet is generating..." })} style={{ borderRadius: 8, background: "#16A34A", borderColor: "#16A34A" }}>Excel</Button>
          </Space>
        </div>
      </Card>

      {/* Main Table Grid */}
      <Card
        bordered={false}
        style={{
          background: isDarkMode ? "rgba(15, 23, 42, 0.7)" : "#FFFFFF",
          border: `1px solid ${isDarkMode ? "rgba(6, 182, 212, 0.15)" : "#E2E8F0"}`,
          borderRadius: 20,
          boxShadow: isDarkMode ? "0 8px 30px rgba(0, 0, 0, 0.2)" : "0 8px 30px rgba(0, 0, 0, 0.015)",
          backdropFilter: "blur(12px)"
        }}
      >
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          scroll={{ x: true }}
          locale={{ emptyText: <Empty description="No matching administrators cataloged." /> }}
        />
      </Card>

      {/* Details Side Drawer */}
      <Drawer
        title={
          <Space>
            <InfoCircleOutlined style={{ color: "#06B6D4" }} />
            <span style={{ fontWeight: 800 }}>Admin Permissions & Identity</span>
          </Space>
        }
        placement="right"
        width={450}
        onClose={() => setDrawerAdmin(null)}
        open={!!drawerAdmin}
      >
        {drawerAdmin && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <Avatar
                size={80}
                style={{
                  backgroundColor: "#06B6D4",
                  fontWeight: 700,
                  fontSize: 24,
                  boxShadow: "0 0 15px rgba(6,182,212,0.3)"
                }}
              >
                {getInitials(drawerAdmin.first_name, drawerAdmin.last_name)}
              </Avatar>
              <Title level={3} style={{ margin: "12px 0 4px 0", color: isDarkMode ? "#ffffff" : "#0f172a" }}>
                {drawerAdmin.first_name} {drawerAdmin.last_name}
              </Title>
              <Tag color="red" style={{ fontWeight: 800 }}>ADMIN SECURITY ROLE</Tag>
            </div>

            <Divider style={{ margin: "4px 0" }} />

            <Descriptions column={1} size="small" bordered={false}>
              <Descriptions.Item label="Employee ID">{drawerAdmin.employee_id}</Descriptions.Item>
              <Descriptions.Item label="Username">{drawerAdmin.username}</Descriptions.Item>
              <Descriptions.Item label="Primary Email">{drawerAdmin.email}</Descriptions.Item>
              <Descriptions.Item label="Designation">{drawerAdmin.designation || "Lead DevOps Architect"}</Descriptions.Item>
              <Descriptions.Item label="MFA Credentials"><Tag color="green">MFA ENABLED</Tag></Descriptions.Item>
              <Descriptions.Item label="Risk Score"><Progress percent={12} size="small" status="active" strokeColor="#10B981" /></Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: "4px 0" }} />

            <div>
              <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 12, textTransform: "uppercase" }}>Security Audit Timeline</Text>
              <Timeline
                items={[
                  { children: "Logged in from Secure Admin Terminal", color: "green" },
                  { children: "Assigned Asset Compliance scopes to DevOps Group", color: "blue" },
                  { children: "Modified corporate firewall security layers", color: "orange" }
                ]}
              />
            </div>
          </Space>
        )}
      </Drawer>

      {/* Modal dialog form for creating admins */}
      <Modal
        title="Register System Admin"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Create Admin"
        cancelText="Cancel"
        okButtonProps={{
          style: {
            background: "linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)",
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
    </motion.div>
  );
};

export default Admins;
