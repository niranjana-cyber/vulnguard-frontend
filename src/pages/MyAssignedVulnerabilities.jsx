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
  Typography,
  Tag,
  Select,
  Tooltip,
  Row,
  Col,
  Drawer,
  Spin,
  Empty,
  Badge,
  Upload,
  Divider,
  Timeline,
  DatePicker
} from "antd";
import {
  BugOutlined,
  SearchOutlined,
  EyeOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  ThunderboltOutlined,
  FilterOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useDebounce } from "../hooks/useDebounce";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const MyAssignedVulnerabilities = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [severityFilter, setSeverityFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState(null);

  // Remediation Modal / Drawer State
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRemediationModalOpen, setIsRemediationModalOpen] = useState(false);

  // Forms
  const [remediationForm] = Form.useForm();
  const [uploadingFile, setUploadingFile] = useState(false);

  const debouncedSearchText = useDebounce(searchText, 500);

  const fetchAssignedVulnerabilities = async () => {
    setLoading(true);
    try {
      let url = "/vulnerabilities/assigned/";
      const params = new URLSearchParams();
      if (debouncedSearchText) params.append("search", debouncedSearchText);
      if (statusFilter) params.append("status", statusFilter);
      if (severityFilter) params.append("severity", severityFilter);
      if (priorityFilter) params.append("priority", priorityFilter);

      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.data.success) {
        setVulnerabilities(res.data.data);
      }
    } catch (err) {
      notification.error({
        message: "Failed to load assigned vulnerabilities",
        description: err.response?.data?.message || "Server communication error.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedVulnerabilities();
  }, [debouncedSearchText, statusFilter, severityFilter, priorityFilter]);

  const handleOpenRemediationModal = (vuln) => {
    setSelectedVuln(vuln);
    remediationForm.setFieldsValue({
      status: vuln.status === "ASSIGNED" ? "IN_PROGRESS" : vuln.status,
      root_cause: vuln.root_cause || "",
      remediation_steps: vuln.remediation_steps || vuln.remediation || "",
      patch_version: vuln.patch_version || "",
      work_performed: vuln.work_performed || "",
      remediation_notes: vuln.remediation_notes || "",
    });
    setIsRemediationModalOpen(true);
  };

  const handleRemediationSubmit = async (values) => {
    if (!selectedVuln) return;
    try {
      const res = await api.put(`/vulnerabilities/${selectedVuln.id}/remediation/`, values);
      if (res.data.success) {
        notification.success({
          message: "Remediation Saved Successfully",
          description: `Remediation details updated for ${selectedVuln.cve_id}. Status set to ${values.status}.`,
          icon: <CheckCircleOutlined style={{ color: "#10B981" }} />,
        });
        setIsRemediationModalOpen(false);
        fetchAssignedVulnerabilities();
        if (selectedVuln && selectedVuln.id === res.data.data.id) {
          setSelectedVuln(res.data.data);
        }
      }
    } catch (err) {
      notification.error({
        message: "Failed to save remediation",
        description: err.response?.data?.message || "Error submitting remediation protocol.",
      });
    }
  };

  const handleFileUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    if (!selectedVuln) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);

    let ext = file.name.split(".").pop().toLowerCase();
    let fileType = "OTHER";
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) fileType = "SCREENSHOT";
    else if (["pdf"].includes(ext)) fileType = "PDF";
    else if (["log", "txt"].includes(ext)) fileType = "LOG_FILE";
    else if (["csv", "xlsx", "doc", "docx"].includes(ext)) fileType = "PATCH_REPORT";

    formData.append("file_type", fileType);
    formData.append("description", `Evidence upload by ${user?.first_name || "Engineer"}`);

    try {
      const res = await api.post(`/vulnerabilities/${selectedVuln.id}/evidence/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        onSuccess("Uploaded successfully");
        notification.success({
          message: "Evidence File Uploaded",
          description: `Uploaded file '${file.name}' to vulnerability evidence store.`,
          icon: <PaperClipOutlined style={{ color: "#06B6D4" }} />,
        });
        // Refresh details
        const detailRes = await api.get(`/vulnerabilities/${selectedVuln.id}/`);
        if (detailRes.data.success) {
          setSelectedVuln(detailRes.data.data);
        }
        fetchAssignedVulnerabilities();
      }
    } catch (err) {
      onError(err);
      notification.error({
        message: "Upload Failed",
        description: err.response?.data?.message || "Error uploading evidence file.",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const getSeverityBadge = (sev) => {
    const s = (sev || "").toUpperCase();
    if (s === "CRITICAL") return <span className="tag-critical">CRITICAL</span>;
    if (s === "HIGH") return <span className="tag-high">HIGH</span>;
    if (s === "MEDIUM") return <span className="tag-medium">MEDIUM</span>;
    return <span className="tag-active">LOW</span>;
  };

  const getPriorityBadge = (prio) => {
    const p = (prio || "MEDIUM").toUpperCase();
    if (p === "URGENT") return <Tag color="red" style={{ fontWeight: 800, borderRadius: 6 }}>URGENT ⚡</Tag>;
    if (p === "HIGH") return <Tag color="orange" style={{ fontWeight: 700, borderRadius: 6 }}>HIGH</Tag>;
    if (p === "MEDIUM") return <Tag color="blue" style={{ fontWeight: 600, borderRadius: 6 }}>MEDIUM</Tag>;
    return <Tag style={{ borderRadius: 6 }}>LOW</Tag>;
  };

  const getStatusTag = (stat) => {
    const st = (stat || "").toUpperCase();
    let color = "default";
    if (st === "OPEN") color = "red";
    else if (st === "ASSIGNED") color = "blue";
    else if (st === "IN_PROGRESS") color = "purple";
    else if (st === "RESOLVED") color = "amber";
    else if (st === "VERIFIED" || st === "CLOSED") color = "green";
    else if (st === "REOPENED") color = "magenta";

    return (
      <Tag color={color} style={{ borderRadius: 6, fontWeight: 700, textTransform: "uppercase" }}>
        {st.replace("_", " ")}
      </Tag>
    );
  };

  const columns = [
    {
      title: "CVE ID",
      dataIndex: "cve_id",
      key: "cve_id",
      render: (text) => <Tag color="cyan" style={{ fontWeight: 800, borderRadius: 6, letterSpacing: 0.5 }}>{text}</Tag>,
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
      render: (text, record) => (
        <span>
          <Text style={{ color: isDarkMode ? "#F1F5F9" : "#1E293B", fontWeight: 600 }}>{text}</Text>
          <Text style={{ display: "block", fontSize: 11, color: isDarkMode ? "#64748B" : "#94A3B8", fontFamily: "monospace" }}>
            {record.asset_hostname || record.asset_code}
          </Text>
        </span>
      ),
    },
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      render: (val) => getSeverityBadge(val),
    },
    {
      title: "CVSS Score",
      dataIndex: "cvss_score",
      key: "cvss_score",
      render: (score) => (
        <span style={{ fontWeight: 800, color: Number(score) >= 9.0 ? "#EF4444" : Number(score) >= 7.0 ? "#F97316" : "#3B82F6" }}>
          {score} / 10.0
        </span>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (prio) => getPriorityBadge(prio),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (st) => getStatusTag(st),
    },
    {
      title: "Assigned Date",
      dataIndex: "assigned_date",
      key: "assigned_date",
      render: (date) => (
        <span style={{ fontSize: 12, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
          {date ? dayjs(date).format("YYYY-MM-DD") : "N/A"}
        </span>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date) => {
        if (!date) return <span style={{ fontSize: 12, color: "#94A3B8" }}>No SLA</span>;
        const isOverdue = dayjs(date).isBefore(dayjs()) && !["CLOSED", "VERIFIED"].includes(status);
        return (
          <Tag color={isOverdue ? "red" : "default"} style={{ borderRadius: 6, fontWeight: 600 }}>
            {dayjs(date).format("YYYY-MM-DD")} {isOverdue && "⚠️ OVERDUE"}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 170,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Remediation Protocol">
            <Button
              size="small"
              type="primary"
              style={{ background: "linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 11 }}
              onClick={() => handleOpenRemediationModal(record)}
            >
              Fix / Update
            </Button>
          </Tooltip>
          <Tooltip title="Timeline & Evidence">
            <Button
              size="small"
              type="default"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedVuln(record);
                setIsDrawerOpen(true);
              }}
            />
          </Tooltip>
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
          borderRadius: 20,
          boxShadow: isDarkMode ? "0 8px 30px rgba(0, 0, 0, 0.25)" : "0 8px 30px rgba(0, 0, 0, 0.02)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div>
            <Space align="center" size="middle">
              <Title level={2} style={{ margin: 0, fontWeight: 800, color: isDarkMode ? "#FFFFFF" : "#0F172A" }}>
                My Assigned Vulnerabilities
              </Title>
              <Badge count={vulnerabilities.length} overflowCount={99} style={{ backgroundColor: "#06B6D4" }} />
            </Space>
            <Paragraph style={{ margin: 0, color: isDarkMode ? "#94A3B8" : "#64748B", marginTop: 4 }}>
              Direct custody workspace for technical remediation, patch application, and evidence submission.
            </Paragraph>
          </div>

          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAssignedVulnerabilities}
            loading={loading}
            style={{ borderRadius: 10, fontWeight: 600 }}
          >
            Refresh Task Queue
          </Button>
        </div>

        {/* Filter Controls Bar */}
        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search CVE ID, Title, or Asset..."
              prefix={<SearchOutlined style={{ color: "#06B6D4" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ borderRadius: 10, height: 40, background: isDarkMode ? "#0F172A" : "#F8FAFC" }}
            />
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Select
              placeholder="Filter Status"
              allowClear
              style={{ width: "100%", borderRadius: 10 }}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
            >
              <Option value="ASSIGNED">Assigned</Option>
              <Option value="IN_PROGRESS">In Progress</Option>
              <Option value="RESOLVED">Resolved</Option>
              <Option value="REOPENED">Reopened</Option>
              <Option value="CLOSED">Closed</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Select
              placeholder="Filter Severity"
              allowClear
              style={{ width: "100%", borderRadius: 10 }}
              value={severityFilter}
              onChange={(v) => setSeverityFilter(v)}
            >
              <Option value="CRITICAL">Critical</Option>
              <Option value="HIGH">High</Option>
              <Option value="MEDIUM">Medium</Option>
              <Option value="LOW">Low</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Priority"
              allowClear
              style={{ width: "100%", borderRadius: 10 }}
              value={priorityFilter}
              onChange={(v) => setPriorityFilter(v)}
            >
              <Option value="URGENT">Urgent ⚡</Option>
              <Option value="HIGH">High</Option>
              <Option value="MEDIUM">Medium</Option>
              <Option value="LOW">Low</Option>
            </Select>
          </Col>
        </Row>

        {/* Vulnerability Roster Table */}
        <Table
          columns={columns}
          dataSource={vulnerabilities}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: true }}
          scroll={{ x: 1100 }}
          locale={{
            emptyText: (
              <Empty
                description="No assigned vulnerabilities in your queue."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      {/* Remediation & Fix Protocol Modal */}
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: "#06B6D4" }} />
            <span>Remediation Protocol — {selectedVuln?.cve_id}</span>
          </Space>
        }
        open={isRemediationModalOpen}
        onCancel={() => setIsRemediationModalOpen(false)}
        onOk={() => remediationForm.submit()}
        okText="Submit & Save Fix"
        cancelText="Cancel"
        width={720}
        okButtonProps={{ style: { background: "linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)", border: "none", borderRadius: 8, fontWeight: 700 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        centered
      >
        {selectedVuln && (
          <Form form={remediationForm} layout="vertical" onFinish={handleRemediationSubmit} style={{ marginTop: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="status" label="Remediation Status" rules={[{ required: true }]}>
                  <Select style={{ borderRadius: 8 }}>
                    <Option value="IN_PROGRESS">In Progress</Option>
                    <Option value="RESOLVED">Resolved (Ready for Verification)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="patch_version" label="Patch / Version Reference">
                  <Input placeholder="e.g. kernel-5.15.0-102 or KB5034441" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="root_cause" label="Root Cause Analysis">
              <Input.TextArea placeholder="Describe root cause (e.g. Unpatched buffer overflow in liblzma)..." rows={2} style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item name="remediation_steps" label="Remediation Steps Taken">
              <Input.TextArea placeholder="Outline exact steps performed (e.g. Downgraded XZ Utils to 5.4.5, rotated SSH host keys)..." rows={3} style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item name="work_performed" label="Technical Work & Validation Log">
              <Input.TextArea placeholder="Enter verification commands & test output log..." rows={2} style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item name="remediation_notes" label="Engineer Notes for Security Manager">
              <Input.TextArea placeholder="Additional context or notes for manager review..." rows={2} style={{ borderRadius: 8 }} />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Detail, Evidence Upload & Activity Timeline Drawer */}
      <Drawer
        title={
          <Space>
            <BugOutlined style={{ color: "#06B6D4" }} />
            <span>CVE Custody Ledger — {selectedVuln?.cve_id}</span>
          </Space>
        }
        width={680}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        style={{ background: isDarkMode ? "#0F172A" : "#FFFFFF" }}
      >
        {selectedVuln && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Header info */}
            <div>
              <Title level={4} style={{ color: isDarkMode ? "#FFFFFF" : "#0F172A", margin: 0 }}>
                {selectedVuln.title}
              </Title>
              <Space style={{ marginTop: 8 }} wrap>
                {getSeverityBadge(selectedVuln.severity)}
                {getStatusTag(selectedVuln.status)}
                {getPriorityBadge(selectedVuln.priority)}
                <Tag color="cyan">Asset: {selectedVuln.asset_name}</Tag>
              </Space>
            </div>

            <Divider style={{ margin: "12px 0" }} />

            {/* Description */}
            <div>
              <Text style={{ fontWeight: 700, color: isDarkMode ? "#06B6D4" : "#0284C7" }}>CVE Description</Text>
              <Paragraph style={{ color: isDarkMode ? "#CBD5E1" : "#334155", marginTop: 4 }}>
                {selectedVuln.description}
              </Paragraph>
            </div>

            {/* Evidence Upload Section */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontWeight: 700, color: isDarkMode ? "#06B6D4" : "#0284C7" }}>
                  <PaperClipOutlined /> Remediation Proof & Evidence Files
                </Text>
              </div>

              <Upload customRequest={handleFileUpload} showUploadList={false}>
                <Button icon={<UploadOutlined />} loading={uploadingFile} style={{ borderRadius: 8, marginBottom: 12 }}>
                  Upload Evidence (Screenshot, PDF, Log)
                </Button>
              </Upload>

              {selectedVuln.evidence_files && selectedVuln.evidence_files.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedVuln.evidence_files.map((file) => (
                    <div
                      key={file.id}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: isDarkMode ? "#1E293B" : "#F8FAFC",
                        border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Space>
                        {file.file_type === "SCREENSHOT" ? <FileImageOutlined style={{ color: "#3B82F6" }} /> : <FilePdfOutlined style={{ color: "#EF4444" }} />}
                        <div>
                          <Text style={{ fontWeight: 600, color: isDarkMode ? "#F1F5F9" : "#0F172A", display: "block", fontSize: 13 }}>
                            {file.file_name}
                          </Text>
                          <Text style={{ fontSize: 11, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
                            Uploaded by {file.uploaded_by_display} on {dayjs(file.uploaded_at).format("YYYY-MM-DD HH:mm")}
                          </Text>
                        </div>
                      </Space>

                      {file.file_url && (
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                          <Button size="small" type="link">Download</Button>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Text style={{ color: isDarkMode ? "#64748B" : "#94A3B8", fontStyle: "italic", fontSize: 12 }}>
                  No evidence files attached yet.
                </Text>
              )}
            </div>

            <Divider style={{ margin: "12px 0" }} />

            {/* Activity Timeline */}
            <div>
              <Text style={{ fontWeight: 700, color: isDarkMode ? "#06B6D4" : "#0284C7", display: "block", marginBottom: 12 }}>
                <ClockCircleOutlined /> Vulnerability Activity Timeline
              </Text>

              {selectedVuln.activities && selectedVuln.activities.length > 0 ? (
                <Timeline
                  items={selectedVuln.activities.map((act) => ({
                    color: act.action === "MANAGER_APPROVED" ? "green" : act.action === "MANAGER_REJECTED" ? "red" : "blue",
                    children: (
                      <div>
                        <strong style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{act.action.replace("_", " ")}</strong>
                        <Text style={{ fontSize: 11, color: "#94A3B8", marginLeft: 8 }}>
                          by {act.user_name} ({act.user_role}) on {dayjs(act.created_at).format("YYYY-MM-DD HH:mm")}
                        </Text>
                        {act.comment && (
                          <Paragraph style={{ margin: "4px 0 0 0", color: isDarkMode ? "#CBD5E1" : "#475569", fontSize: 12, background: isDarkMode ? "rgba(0,0,0,0.2)" : "#F1F5F9", padding: "4px 8px", borderRadius: 6 }}>
                            {act.comment}
                          </Paragraph>
                        )}
                      </div>
                    ),
                  }))}
                />
              ) : (
                <Text style={{ color: "#94A3B8", fontStyle: "italic", fontSize: 12 }}>No activity recorded yet.</Text>
              )}
            </div>
          </Space>
        )}
      </Drawer>
    </motion.div>
  );
};

export default MyAssignedVulnerabilities;
