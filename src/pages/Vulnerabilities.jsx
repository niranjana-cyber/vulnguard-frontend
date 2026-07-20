import React, { useState, useEffect } from "react";
import { Table, Button, Card, Space, Input, Modal, Form, notification, Switch, Typography, Popconfirm, Tag, Select, Tooltip, Drawer, Descriptions, InputNumber, Timeline, Divider, Empty, Row, Col } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UndoOutlined, SearchOutlined, EyeOutlined, CheckCircleOutlined, UserOutlined, MessageOutlined, HistoryOutlined, BugOutlined, AlertOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import dayjs from "dayjs";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const Vulnerabilities = () => {
  const { role, user } = useAuth();
  const { isDarkMode } = useTheme();
  
  // Role checks
  const canManage = ["OWNER", "ADMIN", "SECURITY_MANAGER"].includes(role);
  const isAnalyst = role === "SECURITY_ANALYST";
  const isEngineer = role === "IT_ENGINEER";

  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [assets, setAssets] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  
  // Search and Filter States
  const [searchText, setSearchText] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Drawer detail states
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Modal create/edit states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVuln, setEditingVuln] = useState(null);
  const [form] = Form.useForm();

  // Quick Status Transition Modal state
  const [statusVuln, setStatusVuln] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusForm] = Form.useForm();

  // Quick Assignment Modal state
  const [assignVuln, setAssignVuln] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm] = Form.useForm();

  const fetchVulnerabilities = async () => {
    setLoading(true);
    try {
      const res = await api.get("/vulnerabilities/list/");
      if (res.data.success) {
        setVulnerabilities(res.data.data);
      }
    } catch (err) {
      notification.error({
        message: "Error fetching vulnerabilities",
        description: err.response?.data?.message || "Failed to load vulnerabilities data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [assetRes, empRes] = await Promise.all([
        api.get("/assets/list/"),
        api.get("/auth/employees/list/"),
      ]);
      if (assetRes.data.success) setAssets(assetRes.data.data);
      if (empRes.data.success) {
        const itEngineers = empRes.data.data.filter(e => e.role === "IT_ENGINEER");
        setEngineers(itEngineers);
      }
    } catch (err) {
      console.error("Dependency fetching failed:", err);
    }
  };

  useEffect(() => {
    fetchVulnerabilities();
    fetchDependencies();
  }, []);

  const handleOpenAdd = () => {
    setEditingVuln(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingVuln(record);

    // Map target asset name to id
    const matchedAsset = assets.find(a => a.asset_name === record.asset_name);
    const assetValue = matchedAsset ? matchedAsset.id : record.asset;

    // Map assignee name to id
    const matchedEng = engineers.find(e => `${e.first_name} ${e.last_name}` === record.assigned_to_name);
    const assigneeValue = matchedEng ? matchedEng.id : record.assigned_to;

    form.setFieldsValue({
      title: record.title,
      cve_id: record.cve_id,
      description: record.description,
      asset: assetValue,
      severity: record.severity,
      cvss_score: record.cvss_score,
      assigned_to: assigneeValue,
      status: record.status,
      remediation: record.remediation,
      comments: record.comments,
    });
    setIsModalOpen(true);
  };

  const handleOpenStatusModal = (record) => {
    setStatusVuln(record);
    statusForm.setFieldsValue({ status: record.status });
    setIsStatusModalOpen(true);
  };

  const handleOpenAssignModal = (record) => {
    setAssignVuln(record);
    assignForm.setFieldsValue({ assigned_to: record.assigned_to });
    setIsAssignModalOpen(true);
  };

  const handleModalSubmit = async (values) => {
    try {
      const historyItem = {
        action: editingVuln ? "Vulnerability detail modified" : "Vulnerability reported",
        user: user?.username || "System",
        timestamp: new Date().toISOString(),
      };
      
      const payload = {
        ...values,
        history: editingVuln 
          ? [...(editingVuln.history || []), historyItem]
          : [historyItem],
      };

      if (editingVuln) {
        const res = await api.put(`/vulnerabilities/${editingVuln.id}/update/`, payload);
        if (res.data.success) {
          notification.success({ message: "Vulnerability details updated" });
          setIsModalOpen(false);
          fetchVulnerabilities();
          if (selectedVuln && selectedVuln.id === editingVuln.id) {
            setSelectedVuln(res.data.data);
          }
        }
      } else {
        const res = await api.post("/vulnerabilities/", payload);
        if (res.data.success) {
          notification.success({ message: "Vulnerability registered successfully" });
          setIsModalOpen(false);
          fetchVulnerabilities();
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
          description: err.response?.data?.message || "Check fields and CVE format requirements.",
        });
      }
    }
  };

  const handleStatusSubmit = async (values) => {
    try {
      const historyItem = {
        action: `Status transitioned to: ${values.status}`,
        user: user?.username || "System",
        timestamp: new Date().toISOString(),
      };
      
      const updatedHistory = [...(statusVuln.history || []), historyItem];
      const res = await api.patch(`/vulnerabilities/${statusVuln.id}/status/`, { status: values.status });
      await api.put(`/vulnerabilities/${statusVuln.id}/update/`, { history: updatedHistory });

      if (res.data.success) {
        notification.success({ message: res.data.message || "Status updated" });
        setIsStatusModalOpen(false);
        fetchVulnerabilities();
        if (selectedVuln && selectedVuln.id === statusVuln.id) {
          setSelectedVuln(prev => ({ ...prev, status: values.status, history: updatedHistory }));
        }
      }
    } catch (err) {
      notification.error({
        message: "Status change failed",
        description: err.response?.data?.message || "Operation failed.",
      });
    }
  };

  const handleAssignSubmit = async (values) => {
    try {
      const selectedEng = engineers.find(e => e.id === values.assigned_to);
      const assigneeName = selectedEng ? `${selectedEng.first_name} ${selectedEng.last_name}` : "Unassigned";

      const historyItem = {
        action: `Task assigned to: ${assigneeName}`,
        user: user?.username || "System",
        timestamp: new Date().toISOString(),
      };

      const updatedHistory = [...(assignVuln.history || []), historyItem];
      const res = await api.patch(`/vulnerabilities/${assignVuln.id}/assign/`, values);
      await api.put(`/vulnerabilities/${assignVuln.id}/update/`, { history: updatedHistory });

      if (res.data.success) {
        notification.success({ message: res.data.message || "Assignee updated" });
        setIsAssignModalOpen(false);
        fetchVulnerabilities();
        if (selectedVuln && selectedVuln.id === assignVuln.id) {
          setSelectedVuln(prev => ({
            ...prev,
            assigned_to: values.assigned_to,
            assigned_to_name: assigneeName,
            history: updatedHistory
          }));
        }
      }
    } catch (err) {
      notification.error({
        message: "Assignment failed",
        description: err.response?.data?.message || "Operation failed.",
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const commentHeader = `\n[${user?.username || "Staff"} at ${dayjs().format("YYYY-MM-DD HH:mm")}]\n`;
      const appendedComments = (selectedVuln.comments || "") + commentHeader + newComment.trim();

      const historyItem = {
        action: "Security comment added",
        user: user?.username || "System",
        timestamp: new Date().toISOString(),
      };

      const updatedHistory = [...(selectedVuln.history || []), historyItem];

      const res = await api.put(`/vulnerabilities/${selectedVuln.id}/update/`, {
        comments: appendedComments,
        history: updatedHistory,
      });

      if (res.data.success) {
        notification.success({ message: "Comment recorded successfully" });
        setSelectedVuln(res.data.data);
        setNewComment("");
        fetchVulnerabilities();
      }
    } catch (err) {
      notification.error({
        message: "Comment failed",
        description: err.response?.data?.message || "Failed to record comment.",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/vulnerabilities/${id}/delete/`);
      if (res.data.success) {
        notification.success({ message: "Vulnerability soft deleted successfully" });
        fetchVulnerabilities();
        if (selectedVuln && selectedVuln.id === id) {
          setIsDrawerOpen(false);
        }
      }
    } catch (err) {
      notification.error({
        message: "Delete failed",
        description: err.response?.data?.message || "Failed to delete vulnerability.",
      });
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await api.patch(`/vulnerabilities/${id}/restore/`);
      if (res.data.success) {
        notification.success({ message: "Vulnerability restored successfully" });
        fetchVulnerabilities();
      }
    } catch (err) {
      notification.error({
        message: "Restore failed",
        description: err.response?.data?.message || "Failed to restore vulnerability.",
      });
    }
  };

  const handleDeleteLocal = async (record) => {
    await handleDelete(record.id);
    setVulnerabilities(prev => 
      prev.map(v => v.id === record.id ? { ...v, is_deleted: true } : v)
    );
  };

  const filteredData = vulnerabilities.filter((v) => {
    const title = (v.title || "").toLowerCase();
    const cve = (v.cve_id || "").toLowerCase();
    const search = searchText.toLowerCase();

    const matchesSearch = title.includes(search) || cve.includes(search);
    const matchesSeverity = severityFilter ? v.severity === severityFilter : true;
    const matchesStatus = statusFilter ? v.status === statusFilter : true;

    return matchesSearch && matchesSeverity && matchesStatus && (showDeleted ? v.is_deleted : !v.is_deleted);
  });

  // Analytics for active vulnerability profiles
  const activeCVEList = vulnerabilities.filter(v => !v.is_deleted);
  const criticalCVEs = activeCVEList.filter(v => v.severity === "CRITICAL").length;
  const highCVEs = activeCVEList.filter(v => v.severity === "HIGH").length;
  const unresolvedCVEs = activeCVEList.filter(v => v.status !== "RESOLVED" && v.status !== "CLOSED").length;
  const resolvedCVEs = activeCVEList.filter(v => v.status === "RESOLVED" || v.status === "CLOSED").length;

  const getSeverityColor = (sev) => {
    switch (sev) {
      case "CRITICAL": return "red";
      case "HIGH": return "orange";
      case "MEDIUM": return "gold";
      case "LOW": return "green";
      default: return "default";
    }
  };

  const getStatusColor = (stat) => {
    switch (stat) {
      case "OPEN": return "blue";
      case "IN_PROGRESS": return "purple";
      case "RESOLVED": return "green";
      case "CLOSED": return "default";
      default: return "default";
    }
  };

  const columns = [
    {
      title: "CVE ID",
      dataIndex: "cve_id",
      key: "cve_id",
      render: (text) => <Tag color="blue" style={{ fontWeight: 600, borderRadius: 6 }}>{text}</Tag>,
    },
    {
      title: "Vulnerability Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <strong style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{text}</strong>,
    },
    {
      title: "Target Asset",
      dataIndex: "asset_name",
      key: "asset_name",
      render: (text) => <span style={{ color: isDarkMode ? "#94A3B8" : "#475569" }}>{text}</span>,
    },
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      render: (text) => <Tag color={getSeverityColor(text)} style={{ borderRadius: 6, fontWeight: 500 }}>{text}</Tag>,
    },
    {
      title: "CVSS Score",
      dataIndex: "cvss_score",
      key: "cvss_score",
      render: (val) => <strong style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{val}</strong>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => <Tag color={getStatusColor(text)} style={{ borderRadius: 6, fontWeight: 600 }}>{text.replace("_", " ")}</Tag>,
    },
    {
      title: "Assignee",
      dataIndex: "assigned_to_name",
      key: "assigned_to",
      render: (name) => name || <span style={{ color: "#94A3B8", fontSize: 12, fontStyle: "italic" }}>Unassigned</span>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Inspect Details">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: "#8B5CF6" }} />}
              onClick={() => {
                setSelectedVuln(record);
                setIsDrawerOpen(true);
              }}
            />
          </Tooltip>

          {!record.is_deleted ? (
            <>
              {(canManage || isAnalyst || (isEngineer && record.assigned_to_name && record.assigned_to_name.includes(user?.first_name))) && (
                <Tooltip title="Update Vulnerability">
                  <Button
                    type="text"
                    icon={<EditOutlined style={{ color: "#3B82F6" }} />}
                    onClick={() => handleOpenEdit(record)}
                  />
                </Tooltip>
              )}

              {canManage && (
                <Tooltip title="Assign Custody Engineer">
                  <Button
                    type="text"
                    icon={<UserOutlined style={{ color: "#F59E0B" }} />}
                    onClick={() => handleOpenAssignModal(record)}
                  />
                </Tooltip>
              )}

              {canManage && (
                <Tooltip title="Soft Delete">
                  <Popconfirm
                    title="Soft delete this vulnerability?"
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
              )}
            </>
          ) : (
            canManage && (
              <Tooltip title="Restore Vulnerability">
                <Button
                  type="text"
                  icon={<UndoOutlined style={{ color: "#22C55E" }} />}
                  onClick={() => handleRestore(record.id)}
                />
              </Tooltip>
            )
          )}
        </Space>
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
              Vulnerability Management
            </Title>
            <Paragraph style={{ margin: 0, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
              {isEngineer ? "Resolve vulnerabilities assigned to your custody workspace." : "Create, track, and remediate CVE risks across system assets."}
            </Paragraph>
          </div>
          {canManage && (
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
              Report Vulnerability
            </Button>
          )}
        </div>

        {/* Dynamic metrics threat deck */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ background: isDarkMode ? "rgba(239, 68, 68, 0.08)" : "rgba(239, 68, 68, 0.04)", borderRadius: 10, border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              <Space>
                <BugOutlined style={{ color: "#EF4444", fontSize: 18 }} />
                <div>
                  <div style={{ fontSize: 10, color: isDarkMode ? "#94A3B8" : "#64748B" }}>CRITICAL CVEs</div>
                  <strong style={{ fontSize: 16, color: "#EF4444" }}>{criticalCVEs}</strong>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ background: isDarkMode ? "rgba(245, 158, 11, 0.08)" : "rgba(245, 158, 11, 0.04)", borderRadius: 10, border: "1px solid rgba(245, 158, 11, 0.2)" }}>
              <Space>
                <AlertOutlined style={{ color: "#F59E0B", fontSize: 18 }} />
                <div>
                  <div style={{ fontSize: 10, color: isDarkMode ? "#94A3B8" : "#64748B" }}>HIGH SEVERITY</div>
                  <strong style={{ fontSize: 16, color: "#F59E0B" }}>{highCVEs}</strong>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ background: isDarkMode ? "rgba(99, 102, 241, 0.08)" : "rgba(99, 102, 241, 0.04)", borderRadius: 10, border: "1px solid rgba(99, 102, 241, 0.2)" }}>
              <Space>
                <AlertOutlined style={{ color: "#6366F1", fontSize: 18 }} />
                <div>
                  <div style={{ fontSize: 10, color: isDarkMode ? "#94A3B8" : "#64748B" }}>ACTIVE / UNRESOLVED</div>
                  <strong style={{ fontSize: 16, color: "#6366F1" }}>{unresolvedCVEs}</strong>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ background: isDarkMode ? "rgba(34, 197, 94, 0.08)" : "rgba(34, 197, 94, 0.04)", borderRadius: 10, border: "1px solid rgba(34, 197, 94, 0.2)" }}>
              <Space>
                <SafetyCertificateOutlined style={{ color: "#22C55E", fontSize: 18 }} />
                <div>
                  <div style={{ fontSize: 10, color: isDarkMode ? "#94A3B8" : "#64748B" }}>RESOLVED / CLOSED</div>
                  <strong style={{ fontSize: 16, color: "#22C55E" }}>{resolvedCVEs}</strong>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
          <Space size="middle" style={{ flexWrap: "wrap" }}>
            <Input
              placeholder="Search CVE ID or title..."
              prefix={<SearchOutlined style={{ color: "#94A3B8" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                minWidth: 240,
                borderRadius: 10,
                height: 40,
                background: isDarkMode ? "#0F172A" : "#FFFFFF",
                border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
              }}
            />

            <Select
              placeholder="Filter Severity"
              allowClear
              value={severityFilter || undefined}
              onChange={(val) => setSeverityFilter(val || "")}
              style={{ width: 150 }}
            >
              <Option value="LOW">Low</Option>
              <Option value="MEDIUM">Medium</Option>
              <Option value="HIGH">High</Option>
              <Option value="CRITICAL">Critical</Option>
            </Select>

            <Select
              placeholder="Filter Status"
              allowClear
              value={statusFilter || undefined}
              onChange={(val) => setStatusFilter(val || "")}
              style={{ width: 150 }}
            >
              <Option value="OPEN">Open</Option>
              <Option value="IN_PROGRESS">In Progress</Option>
              <Option value="RESOLVED">Resolved</Option>
              <Option value="CLOSED">Closed</Option>
            </Select>
          </Space>

          {canManage && (
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

        {/* Drawer Details */}
        <Drawer
          title={<span style={{ color: isDarkMode ? "#FFFFFF" : "#0F172A" }}>Vulnerability Analysis & Custody</span>}
          placement="right"
          width={620}
          onClose={() => setIsDrawerOpen(false)}
          open={isDrawerOpen}
        >
          {selectedVuln && (
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Tag color={getSeverityColor(selectedVuln.severity)} style={{ marginBottom: 8, fontSize: 13, padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>
                  {selectedVuln.severity} SEVERITY
                </Tag>
                <Title level={4} style={{ margin: 0, color: isDarkMode ? "#FFFFFF" : "#0F172A", fontWeight: 700 }}>
                  [{selectedVuln.cve_id}] {selectedVuln.title}
                </Title>
              </div>

              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="CVSS v3.1 score">
                  <strong style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{selectedVuln.cvss_score} / 10.0</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Target Asset">
                  <span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{selectedVuln.asset_name}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Remediation Status">
                  <Tag color={getStatusColor(selectedVuln.status)} style={{ borderRadius: 6, fontWeight: 600 }}>{selectedVuln.status.replace("_", " ")}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Assigned Engineer">
                  <span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{selectedVuln.assigned_to_name || "Unassigned"}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Discovered Date">
                  <span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{new Date(selectedVuln.created_at).toLocaleString()}</span>
                </Descriptions.Item>
              </Descriptions>

              <div>
                <Text strong style={{ display: "block", marginBottom: 8, color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>CVE Vulnerability Description</Text>
                <Paragraph style={{ padding: "12px", background: isDarkMode ? "#0F172A" : "#f8f9fa", borderRadius: 8, border: `1px solid ${isDarkMode ? "#334155" : "#ebecf0"}`, color: isDarkMode ? "#94A3B8" : "#475569" }}>
                  {selectedVuln.description}
                </Paragraph>
              </div>

              <div>
                <Text strong style={{ display: "block", marginBottom: 8, color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>Remediation Protocol</Text>
                <Paragraph style={{ padding: "12px", background: isDarkMode ? "rgba(34,197,94,0.08)" : "#eef9f0", borderRadius: 8, border: `1px solid ${isDarkMode ? "rgba(34,197,94,0.2)" : "#d4ebd5"}`, color: isDarkMode ? "#22C55E" : "#1B5E20" }}>
                  {selectedVuln.remediation || "No remediation protocols entered yet."}
                </Paragraph>
              </div>

              {/* Interactive Comments Ledger */}
              <div>
                <Divider orientation="left" style={{ margin: "12px 0" }}>
                  <Space><MessageOutlined style={{ color: isDarkMode ? "#3B82F6" : "#2563EB" }} /><span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>Security Discussion Log</span></Space>
                </Divider>
                {selectedVuln.comments ? (
                  <div style={{ maxHeight: 180, overflowY: "auto", padding: "10px", background: isDarkMode ? "#0F172A" : "#f8fafc", borderRadius: 8, border: `1px solid ${isDarkMode ? "#334155" : "#e2e8f0"}`, marginBottom: 12 }}>
                    {selectedVuln.comments.split("\n").filter(Boolean).map((line, idx) => {
                      const isHeader = line.startsWith("[") && line.endsWith("]");
                      return (
                        <div key={idx} style={{ marginBottom: isHeader ? 2 : 10, fontSize: isHeader ? 11 : 13 }}>
                          {isHeader ? (
                            <Text type="secondary" style={{ fontWeight: 600 }}>{line}</Text>
                          ) : (
                            <Paragraph style={{ margin: 0, paddingLeft: 4, color: isDarkMode ? "#F1F5F9" : "#475569" }}>{line}</Paragraph>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Empty description="No thread logs on this CVE yet." image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
                
                <Space.Compact style={{ width: "100%", marginTop: 8 }}>
                  <Input
                    placeholder="Type an advisory or remediation update comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onPressEnter={handleAddComment}
                    style={{ background: isDarkMode ? "#0F172A" : "#FFFFFF", border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}` }}
                  />
                  <Button type="primary" onClick={handleAddComment}>Post Node</Button>
                </Space.Compact>
              </div>

              {/* Activity History Timeline */}
              <div>
                <Divider orientation="left" style={{ margin: "12px 0" }}>
                  <Space><HistoryOutlined style={{ color: isDarkMode ? "#3B82F6" : "#2563EB" }} /><span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>Audited Event History</span></Space>
                </Divider>
                {selectedVuln.history && selectedVuln.history.length > 0 ? (
                  <Timeline
                    style={{ marginTop: 12, paddingLeft: 8 }}
                    items={selectedVuln.history.map((item, idx) => ({
                      color: "blue",
                      children: (
                        <div>
                          <strong style={{ color: isDarkMode ? "#F1F5F9" : "#475569" }}>{item.action}</strong>
                          <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>
                            by {item.user} at {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ),
                    }))}
                  />
                ) : (
                  <Timeline
                    style={{ marginTop: 12, paddingLeft: 8 }}
                    items={[{
                      color: "green",
                      children: (
                        <div>
                          <strong style={{ color: isDarkMode ? "#F1F5F9" : "#475569" }}>Vulnerability Log Created</strong>
                          <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>
                            {new Date(selectedVuln.created_at).toLocaleString()}
                          </span>
                        </div>
                      )
                    }]}
                  />
                )}
              </div>

              <Space>
                {canManage && (
                  <Button type="primary" icon={<EditOutlined />} onClick={() => { setIsDrawerOpen(false); handleOpenEdit(selectedVuln); }}>
                    Full Edit
                  </Button>
                )}
                {(canManage || isAnalyst || (isEngineer && selectedVuln.assigned_to_name && selectedVuln.assigned_to_name.includes(user?.first_name))) && (
                  <Button icon={<CheckCircleOutlined />} onClick={() => handleOpenStatusModal(selectedVuln)}>
                    Change Status
                  </Button>
                )}
              </Space>
            </Space>
          )}
        </Drawer>

        {/* Create/Edit Modal */}
        <Modal
          title={editingVuln ? "Modify Vulnerability Details" : "Report New Vulnerability (CVE)"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={() => form.submit()}
          okText={editingVuln ? "Save Changes" : "Submit Report"}
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
            <Form.Item
              name="title"
              label="Vulnerability Title"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="e.g. Remote Code Execution in Apache Server" style={{ borderRadius: 8 }} disabled={!canManage} />
            </Form.Item>

            <Space style={{ display: "flex", width: "100%" }} align="start">
              <Form.Item
                name="cve_id"
                label="CVE ID"
                rules={[
                  { required: true, message: "Required" },
                  { pattern: /^CVE-[0-9]{4}-[0-9]{4,7}$/, message: "Format: CVE-YYYY-NNNN" }
                ]}
                style={{ flex: 1 }}
              >
                <Input placeholder="CVE-2024-1234" style={{ borderRadius: 8 }} disabled={!canManage || !!editingVuln} />
              </Form.Item>

              <Form.Item
                name="asset"
                label="Target Asset"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="Select asset" style={{ borderRadius: 8 }} disabled={!canManage}>
                  {assets.map((a) => (
                    <Option key={a.id} value={a.id}>{a.asset_name} ({a.asset_code})</Option>
                  ))}
                </Select>
              </Form.Item>
            </Space>

            <Space style={{ display: "flex", width: "100%" }} align="start">
              <Form.Item
                name="severity"
                label="Severity"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="Select severity" style={{ borderRadius: 8 }} disabled={!canManage}>
                  <Option value="LOW">Low</Option>
                  <Option value="MEDIUM">Medium</Option>
                  <Option value="HIGH">High</Option>
                  <Option value="CRITICAL">Critical</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="cvss_score"
                label="CVSS Score (0.0 - 10.0)"
                rules={[
                  { required: true, message: "Required" },
                ]}
                style={{ flex: 1 }}
              >
                <InputNumber min={0.0} max={10.0} step={0.1} style={{ width: "100%", borderRadius: 8 }} disabled={!canManage} />
              </Form.Item>
            </Space>

            {canManage && (
              <Form.Item
                name="assigned_to"
                label="Assigned Custody Engineer"
              >
                <Select placeholder="Select engineer" allowClear style={{ borderRadius: 8 }}>
                  {engineers.map((e) => (
                    <Option key={e.id} value={e.id}>{e.first_name} {e.last_name}</Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Form.Item
              name="status"
              label="Remediation Status"
              rules={[{ required: true, message: "Required" }]}
            >
              <Select placeholder="Select status" style={{ borderRadius: 8 }}>
                <Option value="OPEN">Open</Option>
                <Option value="IN_PROGRESS">In Progress</Option>
                <Option value="RESOLVED">Resolved</Option>
                <Option value="CLOSED">Closed</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label="CVE Description"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input.TextArea placeholder="Describe the vulnerability details..." rows={4} style={{ borderRadius: 8 }} disabled={!canManage} />
            </Form.Item>

            <Form.Item
              name="remediation"
              label="Remediation Protocol"
            >
              <Input.TextArea placeholder="Enter instructions to resolve this CVE..." rows={4} style={{ borderRadius: 8 }} disabled={isAnalyst} />
            </Form.Item>

            <Form.Item
              name="comments"
              label="Thread Logs / Discovered Comments"
            >
              <Input.TextArea placeholder="Add initial threat comments..." rows={3} style={{ borderRadius: 8 }} disabled={!canManage} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Quick Status Modal */}
        <Modal
          title="Update Status"
          open={isStatusModalOpen}
          onCancel={() => setIsStatusModalOpen(false)}
          onOk={() => statusForm.submit()}
          okText="Update Status"
          cancelText="Cancel"
          okButtonProps={{ style: { borderRadius: 8 } }}
          cancelButtonProps={{ style: { borderRadius: 8 } }}
        >
          <Form form={statusForm} layout="vertical" onFinish={handleStatusSubmit} style={{ marginTop: 16 }}>
            <Form.Item name="status" label="Remediation Status" rules={[{ required: true }]}>
              <Select style={{ borderRadius: 8 }}>
                <Option value="OPEN">Open</Option>
                <Option value="IN_PROGRESS">In Progress</Option>
                <Option value="RESOLVED">Resolved</Option>
                <Option value="CLOSED">Closed</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* Quick Assign Modal */}
        <Modal
          title="Assign Custody Engineer"
          open={isAssignModalOpen}
          onCancel={() => setIsAssignModalOpen(false)}
          onOk={() => assignForm.submit()}
          okText="Assign Engineer"
          cancelText="Cancel"
          okButtonProps={{ style: { borderRadius: 8 } }}
          cancelButtonProps={{ style: { borderRadius: 8 } }}
        >
          <Form form={assignForm} layout="vertical" onFinish={handleAssignSubmit} style={{ marginTop: 16 }}>
            <Form.Item name="assigned_to" label="Custodian Engineer" rules={[{ required: true, message: "Select an engineer" }]}>
              <Select placeholder="Choose engineer" allowClear style={{ borderRadius: 8 }}>
                {engineers.map((e) => (
                  <Option key={e.id} value={e.id}>{e.first_name} {e.last_name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </motion.div>
  );
};

export default Vulnerabilities;
