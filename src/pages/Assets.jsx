import React, { useState, useEffect } from "react";
import { Table, Button, Card, Space, Input, Modal, Form, notification, Switch, Typography, Popconfirm, Tag, Select, Tooltip, InputNumber, Row, Col } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UndoOutlined, SearchOutlined, LaptopOutlined, AlertOutlined, SafetyCertificateOutlined, CloudServerOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const Assets = () => {
  const { role } = useAuth();
  const { isDarkMode } = useTheme();
  const isReadOnly = role === "SECURITY_MANAGER";

  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [form] = Form.useForm();

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/assets/list/");
      if (res.data.success) {
        setAssets(res.data.data);
      }
    } catch (err) {
      notification.error({
        message: "Error fetching assets",
        description: err.response?.data?.message || "Failed to load assets inventory.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        api.get("/departments/list/"),
        api.get("/auth/employees/list/"),
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (empRes.data.success) setEmployees(empRes.data.data);
    } catch (err) {
      console.error("Dependency fetching failed:", err);
    }
  };

  useEffect(() => {
    fetchAssets();
    if (!isReadOnly) {
      fetchDependencies();
    }
  }, [isReadOnly]);

  const handleOpenAdd = () => {
    setEditingAsset(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingAsset(record);
    form.setFieldsValue({
      asset_name: record.asset_name,
      asset_code: record.asset_code,
      asset_type: record.asset_type,
      department: record.department,
      owner: record.owner,
      ip_address: record.ip_address,
      operating_system: record.operating_system,
      hostname: record.hostname,
      risk_score: record.risk_score,
      status: record.status,
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (values) => {
    try {
      if (editingAsset) {
        const res = await api.put(`/assets/${editingAsset.id}/update/`, values);
        if (res.data.success) {
          notification.success({ message: "Asset inventory updated" });
          setIsModalOpen(false);
          fetchAssets();
        }
      } else {
        const res = await api.post("/assets/", values);
        if (res.data.success) {
          notification.success({ message: "Asset registered successfully" });
          setIsModalOpen(false);
          fetchAssets();
        }
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
          message: "Operation failed",
          description: err.response?.data?.message || "Verify field requirements or unique IP constraints.",
        });
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/assets/${id}/delete/`);
      if (res.data.success) {
        notification.success({ message: "Asset soft deleted successfully" });
        fetchAssets();
      }
    } catch (err) {
      notification.error({
        message: "Delete failed",
        description: err.response?.data?.message || "Failed to delete asset.",
      });
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await api.patch(`/assets/${id}/restore/`);
      if (res.data.success) {
        notification.success({ message: "Asset restored successfully" });
        fetchAssets();
      }
    } catch (err) {
      notification.error({
        message: "Restore failed",
        description: err.response?.data?.message || "Failed to restore asset.",
      });
    }
  };

  const handleDeleteLocal = async (record) => {
    await handleDelete(record.id);
    setAssets(prev => 
      prev.map(a => a.id === record.id ? { ...a, is_deleted: true } : a)
    );
  };

  const filteredData = assets.filter((asset) => {
    const name = (asset.asset_name || "").toLowerCase();
    const code = (asset.asset_code || "").toLowerCase();
    const hostname = (asset.hostname || "").toLowerCase();
    const ip = (asset.ip_address || "").toLowerCase();
    const os = (asset.operating_system || "").toLowerCase();
    const search = searchText.toLowerCase();

    const matchesSearch =
      name.includes(search) ||
      code.includes(search) ||
      hostname.includes(search) ||
      ip.includes(search) ||
      os.includes(search);

    return matchesSearch && (showDeleted ? asset.is_deleted : !asset.is_deleted);
  });

  // Dynamic calculations for infrastructure health headers
  const activeAssets = assets.filter(a => !a.is_deleted);
  const criticalCount = activeAssets.filter(a => (a.risk_score || 0) >= 9).length;
  const highCount = activeAssets.filter(a => (a.risk_score || 0) >= 7 && (a.risk_score || 0) <= 8).length;
  const mediumCount = activeAssets.filter(a => (a.risk_score || 0) >= 4 && (a.risk_score || 0) <= 6).length;
  const lowCount = activeAssets.filter(a => (a.risk_score || 0) < 4).length;

  const getAssetTypeColor = (type) => {
    switch (type) {
      case "SERVER": return "red";
      case "FIREWALL": return "volcano";
      case "ROUTER": return "orange";
      case "SWITCH": return "gold";
      case "DESKTOP": case "LAPTOP": return "blue";
      default: return "default";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE": return "green";
      case "INACTIVE": return "gray";
      case "UNDER_MAINTENANCE": return "warning";
      default: return "default";
    }
  };

  const getRiskScoreTag = (score) => {
    if (score >= 9) return <Tag color="#EF4444" style={{ fontWeight: 600 }}>{score} (CRITICAL)</Tag>;
    if (score >= 7) return <Tag color="#F59E0B" style={{ fontWeight: 600 }}>{score} (HIGH)</Tag>;
    if (score >= 4) return <Tag color="#3B82F6" style={{ fontWeight: 600 }}>{score} (MEDIUM)</Tag>;
    return <Tag color="#22C55E" style={{ fontWeight: 600 }}>{score} (LOW)</Tag>;
  };

  const columns = [
    {
      title: "Asset Code",
      dataIndex: "asset_code",
      key: "asset_code",
      render: (text) => <Tag color="blue" style={{ borderRadius: 6 }}>{text}</Tag>,
    },
    {
      title: "Asset Name",
      dataIndex: "asset_name",
      key: "asset_name",
      render: (text) => <strong style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{text}</strong>,
    },
    {
      title: "Hostname",
      dataIndex: "hostname",
      key: "hostname",
      render: (text) => <span style={{ fontFamily: "monospace", color: isDarkMode ? "#94A3B8" : "#475569" }}>{text || "N/A"}</span>,
    },
    {
      title: "Asset Type",
      dataIndex: "asset_type",
      key: "asset_type",
      render: (text) => <Tag color={getAssetTypeColor(text)} style={{ borderRadius: 6, fontWeight: 500 }}>{text}</Tag>,
    },
    {
      title: "IP Address",
      dataIndex: "ip_address",
      key: "ip_address",
      render: (text) => <span style={{ fontFamily: "monospace", color: isDarkMode ? "#94A3B8" : "#475569" }}>{text || "N/A"}</span>,
    },
    {
      title: "Risk Score",
      dataIndex: "risk_score",
      key: "risk_score",
      render: (score) => getRiskScoreTag(score || 1),
      sorter: (a, b) => (a.risk_score || 0) - (b.risk_score || 0),
    },
    {
      title: "Asset Status",
      dataIndex: "status",
      key: "status",
      render: (text) => <Tag color={getStatusColor(text)} style={{ borderRadius: 6, fontWeight: 600 }}>{text.replace("_", " ")}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        if (isReadOnly) {
          return <span style={{ color: "#94A3B8", fontStyle: "italic", fontSize: 12 }}>View Only</span>;
        }

        return (
          <Space size="middle">
            {!record.is_deleted ? (
              <>
                <Tooltip title="Modify Asset">
                  <Button
                    type="text"
                    icon={<EditOutlined style={{ color: "#3B82F6" }} />}
                    onClick={() => handleOpenEdit(record)}
                  />
                </Tooltip>
                <Tooltip title="Soft Delete">
                  <Popconfirm
                    title="Soft delete this asset?"
                    onConfirm={() => handleDeleteLocal(record)}
                    okText="Delete"
                    cancelText="No"
                    okButtonProps={{ danger: true, shape: "round" }}
                    cancelButtonProps={{ shape: "round" }}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Restore Asset">
                <Button
                  type="text"
                  icon={<UndoOutlined style={{ color: "#22C55E" }} />}
                  onClick={() => handleRestore(record.id)}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
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
              Corporate Asset Inventory
            </Title>
            <Paragraph style={{ margin: 0, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
              Identify network servers, endpoint devices, firewalls, and configure custody.
            </Paragraph>
          </div>
          {!isReadOnly && (
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
              Register Asset
            </Button>
          )}
        </div>

        {/* Dynamic risk assessment header cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ background: isDarkMode ? "rgba(239, 68, 68, 0.08)" : "rgba(239, 68, 68, 0.04)", borderRadius: 10, border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              <Space>
                <AlertOutlined style={{ color: "#EF4444", fontSize: 18 }} />
                <div>
                  <div style={{ fontSize: 10, color: isDarkMode ? "#94A3B8" : "#64748B" }}>CRITICAL ASSETS</div>
                  <strong style={{ fontSize: 16, color: "#EF4444" }}>{criticalCount}</strong>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ background: isDarkMode ? "rgba(245, 158, 11, 0.08)" : "rgba(245, 158, 11, 0.04)", borderRadius: 10, border: "1px solid rgba(245, 158, 11, 0.2)" }}>
              <Space>
                <AlertOutlined style={{ color: "#F59E0B", fontSize: 18 }} />
                <div>
                  <div style={{ fontSize: 10, color: isDarkMode ? "#94A3B8" : "#64748B" }}>HIGH RISK</div>
                  <strong style={{ fontSize: 16, color: "#F59E0B" }}>{highCount}</strong>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ background: isDarkMode ? "rgba(59, 130, 246, 0.08)" : "rgba(59, 130, 246, 0.04)", borderRadius: 10, border: "1px solid rgba(59, 130, 246, 0.2)" }}>
              <Space>
                <LaptopOutlined style={{ color: "#3B82F6", fontSize: 18 }} />
                <div>
                  <div style={{ fontSize: 10, color: isDarkMode ? "#94A3B8" : "#64748B" }}>MEDIUM RISK</div>
                  <strong style={{ fontSize: 16, color: "#3B82F6" }}>{mediumCount}</strong>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ background: isDarkMode ? "rgba(34, 197, 94, 0.08)" : "rgba(34, 197, 94, 0.04)", borderRadius: 10, border: "1px solid rgba(34, 197, 94, 0.2)" }}>
              <Space>
                <SafetyCertificateOutlined style={{ color: "#22C55E", fontSize: 18 }} />
                <div>
                  <div style={{ fontSize: 10, color: isDarkMode ? "#94A3B8" : "#64748B" }}>LOW / SECURE</div>
                  <strong style={{ fontSize: 16, color: "#22C55E" }}>{lowCount}</strong>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
          <Input
            placeholder="Search by name, OS, IP, hostname..."
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
          {!isReadOnly && (
            <Space>
              <span style={{ color: isDarkMode ? "#94A3B8" : "#64748B", fontSize: 13 }}>View Deleted:</span>
              <Switch checked={showDeleted} onChange={(checked) => setShowDeleted(checked)} />
            </Space>
          )}
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
          title={editingAsset ? "Modify Asset Details" : "Register Corporate Asset"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={() => form.submit()}
          okText={editingAsset ? "Save Changes" : "Register Asset"}
          cancelText="Discard"
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
                name="asset_name"
                label="Asset Name"
                rules={[{ required: true, message: "Asset Name is required." }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="e.g. Core LDAP Database" style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item
                name="asset_code"
                label="Asset Code"
                rules={[{ required: true, message: "Asset Code is required." }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="e.g. SRV-LDAP-01" style={{ borderRadius: 8 }} disabled={!!editingAsset} />
              </Form.Item>
            </Space>

            <Space style={{ display: "flex", width: "100%" }} align="start">
              <Form.Item
                name="hostname"
                label="Hostname"
                rules={[{ required: true, message: "Hostname is required." }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="e.g. ldap.prod.internal" style={{ borderRadius: 8 }} />
              </Form.Item>

              <Form.Item
                name="risk_score"
                label="Asset Risk Score (1-10)"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <InputNumber min={1} max={10} style={{ width: "100%", borderRadius: 8 }} />
              </Form.Item>
            </Space>

            <Space style={{ display: "flex", width: "100%" }} align="start">
              <Form.Item
                name="asset_type"
                label="Asset Type"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="Select type" style={{ borderRadius: 8 }}>
                  <Option value="SERVER">Server</Option>
                  <Option value="FIREWALL">Firewall</Option>
                  <Option value="ROUTER">Router</Option>
                  <Option value="SWITCH">Switch</Option>
                  <Option value="DESKTOP">Desktop</Option>
                  <Option value="LAPTOP">Laptop</Option>
                  <Option value="MOBILE">Mobile</Option>
                  <Option value="OTHER">Other</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="status"
                label="Asset Status"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="Select status" style={{ borderRadius: 8 }}>
                  <Option value="ACTIVE">Active</Option>
                  <Option value="INACTIVE">Inactive</Option>
                  <Option value="UNDER_MAINTENANCE">Under Maintenance</Option>
                </Select>
              </Form.Item>
            </Space>

            <Space style={{ display: "flex", width: "100%" }} align="start">
              <Form.Item
                name="ip_address"
                label="IP Address (IPv4)"
                rules={[
                  { required: true, message: "IP Address is required." },
                  { pattern: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, message: "Enter a valid IPv4 address." },
                ]}
                style={{ flex: 1 }}
              >
                <Input placeholder="e.g. 192.168.1.50" style={{ borderRadius: 8 }} />
              </Form.Item>

              <Form.Item
                name="operating_system"
                label="Operating System"
                rules={[{ required: true, message: "OS is required." }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="e.g. Ubuntu 22.04 LTS" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Space>

            <Space style={{ display: "flex", width: "100%" }} align="start">
              <Form.Item
                name="department"
                label="Department Assignment"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="Select department" style={{ borderRadius: 8 }}>
                  {departments.map((d) => (
                    <Option key={d.id} value={d.id}>
                      {d.department_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="owner"
                label="Custodian / Custody Owner"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="Select employee" style={{ borderRadius: 8 }}>
                  {employees.map((e) => (
                    <Option key={e.id} value={e.id}>
                      {e.first_name} {e.last_name} ({e.role.replace("_", " ")})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Space>
          </Form>
        </Modal>
      </Card>
    </motion.div>
  );
};

export default Assets;
