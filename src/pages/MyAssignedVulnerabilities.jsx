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
  DatePicker,
  Avatar,
  Progress,
  List
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
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  MessageOutlined,
  SendOutlined,
  FileZipOutlined,
  FileOutlined,
  AlertOutlined,
  CheckOutlined,
  BulbOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useDebounce } from "../hooks/useDebounce";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const getAICveRecommendations = (cveId, title, severity, cvss) => {
  const cve = (cveId || "").toUpperCase();
  
  let riskSummary = `This vulnerability represents a significant risk to target assets due to its accessibility.`;
  let recommendedRemediation = `Upgrade the package dependencies to the latest patch version containing security hotfixes.`;
  let patchRef = `Upgrade to version >= upstream patch or apply KB security cumulative update.`;
  let mitigation = [
    "Restrict ingress access on affected network ports.",
    "Implement rate-limiting and host-level IDS monitors.",
    "Verify integrity of existing service accounts."
  ];
  let score = cvss ? Math.round(Number(cvss) * 10) : 75;
  let fixTime = "2 hours";
  let businessImpact = "Medium - Possible denial of service or configuration exposure.";
  let confidence = "96%";
  let checklist = [
    "Download official vendor distribution source package.",
    "Test patch staging deployment in non-production cluster.",
    "Execute target vulnerability scan to confirm resolution."
  ];

  if (cve.includes("CVE-2024-3094") || title.toLowerCase().includes("xz")) {
    riskSummary = "CRITICAL: Downstream compromise via backdoored liblzma library in systemd SSH context. Allows remote unauthenticated execution.";
    recommendedRemediation = "Immediately downgrade xz-utils to 5.4.6 or upgrade to 5.6.4+.";
    patchRef = "Debian/Fedora upstream patch xz-utils-5.6.1-2+";
    mitigation = [
      "Disable passwordless SSH authentication.",
      "Isolate affected servers and analyze auth logs for suspicious active sessions.",
      "Re-key administrative deployment SSH key pairs."
    ];
    score = 98;
    fixTime = "30 mins";
    businessImpact = "CRITICAL - Direct compromise of perimeter infrastructure hosts.";
    confidence = "99%";
    checklist = [
      "Verify xz version via command line `xz --version`.",
      "Rebuild target SSH containers with clean static binaries.",
      "Inspect host logs for systemd backdoor indicators."
    ];
  } else if (cve.includes("CVE-2021-44228") || title.toLowerCase().includes("log4j") || title.toLowerCase().includes("log4shell")) {
    riskSummary = "CRITICAL: Remote Code Execution vulnerability in Apache Log4j 2.x via JNDI injection vectors.";
    recommendedRemediation = "Upgrade log4j-core dependencies to version 2.17.1 or higher.";
    patchRef = "Apache Log4j 2.17.1 release";
    mitigation = [
      "Set formatMsgNoLookups=true system configuration property.",
      "Remove JndiLookup class from classpath zip files.",
      "Block outbound LDAP/RMI connections to foreign endpoints."
    ];
    score = 97;
    fixTime = "1 hour";
    businessImpact = "HIGH - Potential unauthenticated target infrastructure control.";
    confidence = "98%";
    checklist = [
      "Scan application jars for embedded Log4j archives.",
      "Apply the JVM execution argument changes in deployment yaml.",
      "Perform mock JNDI injection test payload verification."
    ];
  } else if (cve.includes("CVE-2023") || severity === "CRITICAL" || Number(cvss) >= 9.0) {
    riskSummary = "High severity threat posing severe risk of compromise, session interception, or service outage.";
    recommendedRemediation = "Deploy latest service pack updates and restrict public access vectors.";
    patchRef = "Vendor Hotfix cumulative security rollup";
    mitigation = [
      "Enforce multi-factor authentication for administrative dashboards.",
      "Implement deep packet inspection via Web Application Firewall (WAF).",
      "Configure automated daily backup schedules for related datasets."
    ];
    score = 92;
    fixTime = "1.5 hours";
    businessImpact = "HIGH - Outage of primary department core assets.";
    confidence = "95%";
    checklist = [
      "Schedule change request ticket in ServiceNow console.",
      "Perform offline backup of the target database.",
      "Run patch application update commands."
    ];
  }

  return {
    riskSummary,
    recommendedRemediation,
    patchRef,
    mitigation,
    score,
    fixTime,
    businessImpact,
    confidence,
    checklist
  };
};

const AIRecommendationsPanel = ({ cveId, title, severity, cvssScore, isDarkMode }) => {
  const rec = getAICveRecommendations(cveId, title, severity, cvssScore);
  
  return (
    <Card
      style={{
        background: isDarkMode ? "rgba(6, 182, 212, 0.03)" : "rgba(2, 132, 199, 0.02)",
        border: `1px solid ${isDarkMode ? "rgba(6, 182, 212, 0.3)" : "rgba(2, 132, 199, 0.2)"}`,
        borderRadius: 12,
        boxShadow: isDarkMode ? "0 4px 20px rgba(6, 182, 212, 0.1)" : "0 4px 20px rgba(2, 132, 199, 0.05)",
        marginTop: 16,
        marginBottom: 16
      }}
      bodyStyle={{ padding: 16 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Space>
          <BulbOutlined style={{ color: "#06B6D4", fontSize: 18 }} />
          <Text strong style={{ color: isDarkMode ? "#06B6D4" : "#0284C7", fontSize: 13, letterSpacing: 0.5 }}>
            ✨ VULNGUARD AI RECOMMENDATION
          </Text>
        </Space>
        <Tag color="cyan" style={{ borderRadius: 6, fontWeight: 700 }}>
          AI Confidence: {rec.confidence}
        </Tag>
      </div>

      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ fontSize: 10, color: isDarkMode ? "#94A3B8" : "#64748B", textTransform: "uppercase", display: "block" }}>AI Risk Summary</Text>
        <Paragraph style={{ margin: 0, fontSize: 13, color: isDarkMode ? "#E2E8F0" : "#334155" }}>
          {rec.riskSummary}
        </Paragraph>
      </div>

      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ fontSize: 10, color: isDarkMode ? "#94A3B8" : "#64748B", textTransform: "uppercase", display: "block" }}>Recommended Remediation</Text>
        <Paragraph style={{ margin: 0, fontSize: 13, color: isDarkMode ? "#E2E8F0" : "#334155" }}>
          {rec.recommendedRemediation}
        </Paragraph>
      </div>

      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ fontSize: 10, color: isDarkMode ? "#94A3B8" : "#64748B", textTransform: "uppercase", display: "block" }}>Patch Recommendation</Text>
        <div style={{
          background: isDarkMode ? "#0F172A" : "#F1F5F9",
          padding: "8px 12px",
          borderRadius: 8,
          fontFamily: "monospace",
          fontSize: 12,
          color: isDarkMode ? "#38BDF8" : "#0369A1",
          border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
          marginTop: 4
        }}>
          {rec.patchRef}
        </div>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col span={12}>
          <Text strong style={{ fontSize: 9, color: isDarkMode ? "#94A3B8" : "#64748B", textTransform: "uppercase", display: "block" }}>Priority Score</Text>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <Progress percent={rec.score} showInfo={false} strokeColor={{ "0%": "#06B6D4", "100%": "#3B82F6" }} style={{ flex: 1, margin: 0 }} />
            <Text strong style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A", fontSize: 12 }}>{rec.score}/100</Text>
          </div>
        </Col>
        <Col span={12}>
          <Text strong style={{ fontSize: 9, color: isDarkMode ? "#94A3B8" : "#64748B", textTransform: "uppercase", display: "block" }}>Est. Fix Time</Text>
          <Tag color="purple" style={{ marginTop: 4, borderRadius: 6, fontWeight: 700 }}>
            {rec.fixTime}
          </Tag>
        </Col>
      </Row>

      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ fontSize: 10, color: isDarkMode ? "#94A3B8" : "#64748B", textTransform: "uppercase", display: "block" }}>Business Impact</Text>
        <Paragraph style={{ margin: 0, fontSize: 13, color: isDarkMode ? "#E2E8F0" : "#334155" }}>
          {rec.businessImpact}
        </Paragraph>
      </div>

      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ fontSize: 10, color: isDarkMode ? "#94A3B8" : "#64748B", textTransform: "uppercase", display: "block" }}>Mitigation Steps</Text>
        <ul style={{ paddingLeft: 16, margin: "4px 0 0 0", color: isDarkMode ? "#CBD5E1" : "#475569", fontSize: 12 }}>
          {rec.mitigation.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      </div>

      <div>
        <Text strong style={{ fontSize: 10, color: isDarkMode ? "#94A3B8" : "#64748B", textTransform: "uppercase", display: "block" }}>Verification Checklist</Text>
        <ul style={{ paddingLeft: 16, margin: "4px 0 0 0", color: isDarkMode ? "#CBD5E1" : "#475569", fontSize: 12 }}>
          {rec.checklist.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      </div>
    </Card>
  );
};

const MyAssignedVulnerabilities = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [severityFilter, setSeverityFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [assetFilter, setAssetFilter] = useState(null);
  const [dueDateFilter, setDueDateFilter] = useState(null);

  // Remediation Modal / Drawer State
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRemediationModalOpen, setIsRemediationModalOpen] = useState(false);

  // Comments State
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

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

  // Comments Actions
  const handlePostComment = async () => {
    if (!newComment.trim() || !selectedVuln) return;
    try {
      const res = await api.post(`/vulnerabilities/${selectedVuln.id}/activity/`, {
        comment: newComment.trim()
      });
      if (res.data.success) {
        notification.success({ message: "Comment posted" });
        setNewComment("");
        
        // Refresh detail
        const detailRes = await api.get(`/vulnerabilities/${selectedVuln.id}/`);
        if (detailRes.data.success) {
          setSelectedVuln(detailRes.data.data);
        }
        fetchAssignedVulnerabilities();
      }
    } catch (err) {
      notification.error({ message: "Failed to post comment" });
    }
  };

  const handleUpdateComment = async (activityId) => {
    if (!editingCommentText.trim() || !selectedVuln) return;
    try {
      const res = await api.put(`/vulnerabilities/activity/${activityId}/`, {
        comment: editingCommentText.trim()
      });
      if (res.data.success) {
        notification.success({ message: "Comment updated" });
        setEditingCommentId(null);
        setEditingCommentText("");
        
        // Refresh detail
        const detailRes = await api.get(`/vulnerabilities/${selectedVuln.id}/`);
        if (detailRes.data.success) {
          setSelectedVuln(detailRes.data.data);
        }
        fetchAssignedVulnerabilities();
      }
    } catch (err) {
      notification.error({ message: "Failed to update comment" });
    }
  };

  const handleDeleteComment = async (activityId) => {
    if (!selectedVuln) return;
    try {
      const res = await api.delete(`/vulnerabilities/activity/${activityId}/`);
      if (res.data.success) {
        notification.success({ message: "Comment deleted" });
        
        // Refresh detail
        const detailRes = await api.get(`/vulnerabilities/${selectedVuln.id}/`);
        if (detailRes.data.success) {
          setSelectedVuln(detailRes.data.data);
        }
        fetchAssignedVulnerabilities();
      }
    } catch (err) {
      notification.error({ message: "Failed to delete comment" });
    }
  };

  // Direct quick action workflows
  const handleUpdateStatusQuick = async (statusVal) => {
    if (!selectedVuln) return;
    try {
      const res = await api.patch(`/vulnerabilities/${selectedVuln.id}/status/`, {
        status: statusVal
      });
      if (res.data.success) {
        notification.success({ message: `Status updated to ${statusVal}` });
        
        // Refresh detail
        const detailRes = await api.get(`/vulnerabilities/${selectedVuln.id}/`);
        if (detailRes.data.success) {
          setSelectedVuln(detailRes.data.data);
        }
        fetchAssignedVulnerabilities();
      }
    } catch (err) {
      notification.error({ message: "Failed to update status" });
    }
  };

  const getSeverityBadge = (sev) => {
    const s = (sev || "").toUpperCase();
    if (s === "CRITICAL") return <Tag color="red" style={{ fontWeight: 800, borderRadius: 6 }}>CRITICAL</Tag>;
    if (s === "HIGH") return <Tag color="orange" style={{ fontWeight: 700, borderRadius: 6 }}>HIGH</Tag>;
    if (s === "MEDIUM") return <Tag color="blue" style={{ fontWeight: 600, borderRadius: 6 }}>MEDIUM</Tag>;
    return <Tag color="default" style={{ borderRadius: 6 }}>LOW</Tag>;
  };

  const getPriorityBadge = (prio) => {
    const p = (prio || "MEDIUM").toUpperCase();
    if (p === "URGENT") return <Tag color="purple" style={{ fontWeight: 800, borderRadius: 6 }}>URGENT ⚡</Tag>;
    if (p === "HIGH") return <Tag color="volcano" style={{ fontWeight: 700, borderRadius: 6 }}>HIGH</Tag>;
    if (p === "MEDIUM") return <Tag color="blue" style={{ fontWeight: 600, borderRadius: 6 }}>MEDIUM</Tag>;
    return <Tag style={{ borderRadius: 6 }}>LOW</Tag>;
  };

  const getStatusTag = (stat) => {
    const st = (stat || "").toUpperCase();
    let color = "default";
    if (st === "OPEN") color = "red";
    else if (st === "ASSIGNED") color = "blue";
    else if (st === "IN_PROGRESS") color = "purple";
    else if (st === "RESOLVED") color = "cyan";
    else if (st === "VERIFIED" || st === "CLOSED") color = "green";
    else if (st === "REOPENED") color = "magenta";

    return (
      <Tag color={color} style={{ borderRadius: 6, fontWeight: 800, textTransform: "uppercase" }}>
        {st.replace("_", " ")}
      </Tag>
    );
  };

  // Local Filter Logic
  const filteredData = (vulnerabilities || []).filter((emp) => {
    const fullName = `${emp.title || ""} ${emp.cve_id || ""}`.toLowerCase();
    const search = searchText.toLowerCase();
    const matchesSearch = fullName.includes(search);

    const matchesAsset = assetFilter ? emp.asset_name === assetFilter : true;
    const matchesDueDate = dueDateFilter ? dayjs(emp.due_date).isSame(dayjs(dueDateFilter), "day") : true;

    return matchesSearch && matchesAsset && matchesDueDate;
  });

  // KPI Calculations
  const stats = {
    total: filteredData.length,
    open: filteredData.filter(v => v.status === "OPEN" || v.status === "ASSIGNED").length,
    inProgress: filteredData.filter(v => v.status === "IN_PROGRESS").length,
    resolved: filteredData.filter(v => v.status === "RESOLVED").length,
    critical: filteredData.filter(v => v.severity === "CRITICAL").length,
    dueToday: filteredData.filter(v => v.due_date && dayjs(v.due_date).isSame(dayjs(), "day")).length
  };

  const columns = [
    {
      title: "CVE ID",
      dataIndex: "cve_id",
      key: "cve_id",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }} onClick={() => { setSelectedVuln(record); setIsDrawerOpen(true); }}>
          <Tag color="cyan" style={{ fontWeight: 900, borderRadius: 6, letterSpacing: 0.5 }}>{text}</Tag>
        </span>
      ),
    },
    {
      title: "Vulnerability Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <span style={{ cursor: "pointer" }} onClick={() => { setSelectedVuln(record); setIsDrawerOpen(true); }}>
          <strong style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{text}</strong>
        </span>
      ),
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
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      render: (val) => getSeverityBadge(val),
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
      title: "Department",
      dataIndex: "department_name",
      key: "department_name",
      render: (text) => <Tag color="purple">{text || "Global Operations"}</Tag>
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (prio) => getPriorityBadge(prio),
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date, record) => {
        if (!date) return <span style={{ fontSize: 12, color: "#94A3B8" }}>No SLA</span>;
        const isOverdue = dayjs(date).isBefore(dayjs()) && !["CLOSED", "VERIFIED"].includes(record.status);
        return (
          <Tag color={isOverdue ? "red" : "default"} style={{ borderRadius: 6, fontWeight: 600 }}>
            {dayjs(date).format("YYYY-MM-DD")} {isOverdue && "⚠️ OVERDUE"}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (st) => getStatusTag(st),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Remediation Protocol">
            <Button
              size="small"
              type="primary"
              style={{ background: "linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 11 }}
              onClick={() => handleOpenRemediationModal(record)}
            >
              Fix / Log
            </Button>
          </Tooltip>
          <Tooltip title="Discussion & Timeline Insights">
            <Button
              size="small"
              type="default"
              icon={<MessageOutlined style={{ color: "#3B82F6" }} />}
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
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: isDarkMode ? "#FFFFFF" : "#0F172A" }}>
            Vulnerability Remediation Workspace
          </Title>
          <Paragraph style={{ margin: 0, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
            Direct custody workspace for analyzing assigned CVE threats, applying validation patches, and uploading compliance evidence.
          </Paragraph>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchAssignedVulnerabilities}
          loading={loading}
          style={{ borderRadius: 8 }}
        >
          Sync Telemetry
        </Button>
      </div>

      {/* Statistics Cards Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: "Assigned CVEs", val: stats.total, color: "#06B6D4" },
          { title: "Open Tasks", val: stats.open, color: "#EF4444" },
          { title: "In Progress", val: stats.inProgress, color: "#8B5CF6" },
          { title: "Resolved Fixes", val: stats.resolved, color: "#10B981" },
          { title: "Critical Severity", val: stats.critical, color: "#EF4444" },
          { title: "Due Today", val: stats.dueToday, color: "#F59E0B" }
        ].map((stat, i) => (
          <Col xs={12} sm={8} md={4} key={i}>
            <Card
              bordered={false}
              style={{
                background: isDarkMode ? "rgba(15, 23, 42, 0.7)" : "#FFFFFF",
                border: `1px solid ${isDarkMode ? "rgba(6, 182, 212, 0.15)" : "#E2E8F0"}`,
                borderRadius: 16,
                backdropFilter: "blur(12px)",
                textAlign: "center"
              }}
            >
              <Text style={{ fontSize: 10, color: isDarkMode ? "#64748B" : "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>{stat.title}</Text>
              <Title level={3} style={{ margin: "4px 0 0 0", color: stat.color, fontWeight: 900 }}>{stat.val}</Title>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter Toolbar Card */}
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
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search CVE ID or Title..."
              prefix={<SearchOutlined style={{ color: "#06B6D4" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ borderRadius: 8, height: 38 }}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Filter Status"
              allowClear
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
            >
              <Option value="ASSIGNED">Assigned</Option>
              <Option value="IN_PROGRESS">In Progress</Option>
              <Option value="RESOLVED">Resolved</Option>
              <Option value="CLOSED">Closed</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Filter Severity"
              allowClear
              style={{ width: "100%" }}
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
              placeholder="Filter Asset"
              allowClear
              style={{ width: "100%" }}
              value={assetFilter}
              onChange={(v) => setAssetFilter(v)}
            >
              {Array.from(new Set(vulnerabilities.map(v => v.asset_name))).map(name => (
                <Option key={name} value={name}>{name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={6}>
            <DatePicker
              placeholder="Due Date Filter"
              style={{ width: "100%", borderRadius: 8 }}
              onChange={(date, dateStr) => setDueDateFilter(dateStr || null)}
            />
          </Col>
        </Row>
      </Card>

      {/* Main Roster Table */}
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
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1200 }}
          locale={{ emptyText: <Empty description="No assigned security vulnerability records mapped." /> }}
        />
      </Card>

      {/* Remediation Modal */}
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
        okButtonProps={{ style: { background: "linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)", border: "none", borderRadius: 8, fontWeight: 700 } }}
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
              <Input.TextArea placeholder="Outline exact steps performed..." rows={3} style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item name="work_performed" label="Technical Work & Validation Log">
              <Input.TextArea placeholder="Enter verification commands & test output log..." rows={2} style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item name="remediation_notes" label="Engineer Notes for Security Manager">
              <Input.TextArea placeholder="Additional context..." rows={2} style={{ borderRadius: 8 }} />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Details Side Drawer */}
      <Drawer
        title={
          <Space>
            <BugOutlined style={{ color: "#06B6D4" }} />
            <span>CVE Analysis Center — {selectedVuln?.cve_id}</span>
          </Space>
        }
        width={720}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        style={{ background: isDarkMode ? "#0F172A" : "#FFFFFF" }}
      >
        {selectedVuln && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Header section */}
            <div>
              <Title level={3} style={{ color: isDarkMode ? "#FFFFFF" : "#0F172A", margin: 0 }}>
                {selectedVuln.title}
              </Title>
              <Space style={{ marginTop: 8 }} wrap>
                {getSeverityBadge(selectedVuln.severity)}
                {getStatusTag(selectedVuln.status)}
                {getPriorityBadge(selectedVuln.priority)}
                <Tag color="cyan">Asset: {selectedVuln.asset_name}</Tag>
              </Space>
            </div>

            <Divider style={{ margin: "4px 0" }} />

            {/* Description & CVSS details */}
            <Row gutter={[16, 16]}>
              <Col span={16}>
                <Text style={{ fontWeight: 700, color: "#06B6D4", display: "block", marginBottom: 6 }}>CVE Details & Scope</Text>
                <Paragraph style={{ color: isDarkMode ? "#CBD5E1" : "#475569" }}>
                  {selectedVuln.description || "No CVE description registered."}
                </Paragraph>
              </Col>
              <Col span={8}>
                <div style={{ background: isDarkMode ? "rgba(255,255,255,0.03)" : "#F8FAFC", padding: 12, borderRadius: 12, textAlign: "center", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "#E2E8F0"}` }}>
                  <Text type="secondary" style={{ fontSize: 10, display: "block", textTransform: "uppercase" }}>CVSS v3.1 Score</Text>
                  <Title level={2} style={{ margin: 0, color: "#EF4444", fontWeight: 900 }}>{selectedVuln.cvss_score}</Title>
                  <Progress percent={Number(selectedVuln.cvss_score) * 10} showInfo={false} strokeColor="#EF4444" />
                </div>
              </Col>
            </Row>

            <AIRecommendationsPanel
              cveId={selectedVuln.cve_id}
              title={selectedVuln.title}
              severity={selectedVuln.severity}
              cvssScore={selectedVuln.cvss_score}
              isDarkMode={isDarkMode}
            />

            {/* Workflows Actions Deck */}
            <div>
              <Text style={{ fontWeight: 700, color: "#06B6D4", display: "block", marginBottom: 12 }}>REMEDIATION DECISIONS</Text>
              <Space wrap>
                {selectedVuln.status === "ASSIGNED" && (
                  <Button type="primary" onClick={() => handleUpdateStatusQuick("IN_PROGRESS")}>Investigate / Start Work</Button>
                )}
                {selectedVuln.status === "IN_PROGRESS" && (
                  <Button type="primary" style={{ background: "#10B981", borderColor: "#10B981" }} onClick={() => handleOpenRemediationModal(selectedVuln)}>Mark Fixed</Button>
                )}
                {selectedVuln.status === "RESOLVED" && ["OWNER", "ADMIN"].includes(user?.role) && (
                  <>
                    <Button type="primary" style={{ background: "#16A34A" }} onClick={() => handleUpdateStatusQuick("CLOSED")}>Verify & Close</Button>
                    <Button danger type="primary" onClick={() => handleUpdateStatusQuick("REOPENED")}>Reopen / Reject Fix</Button>
                  </>
                )}
              </Space>
            </div>

            <Divider style={{ margin: "4px 0" }} />

            {/* Discussion & Comments Area */}
            <div>
              <Text style={{ fontWeight: 700, color: "#06B6D4", display: "block", marginBottom: 12 }}>
                <MessageOutlined /> Collaborations & Comments
              </Text>
              
              {/* Activity Lists filtered as comments */}
              <List
                dataSource={selectedVuln.activities || []}
                renderItem={(item) => (
                  <List.Item style={{ padding: "12px 0", borderBottom: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "#F1F5F9"}` }}>
                    <div style={{ display: "flex", gap: 12, width: "100%" }}>
                      <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#3B82F6" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <Text strong style={{ color: isDarkMode ? "#FFFFFF" : "#0F172A" }}>{item.user_name}</Text>
                            <Tag color="blue" style={{ marginLeft: 8, fontSize: 10 }}>{item.user_role}</Tag>
                          </div>
                          <Text style={{ fontSize: 11, color: "#94A3B8" }}>{dayjs(item.created_at).format("YYYY-MM-DD HH:mm")}</Text>
                        </div>
                        
                        {editingCommentId === item.id ? (
                          <div style={{ marginTop: 8 }}>
                            <Input.TextArea value={editingCommentText} onChange={(e) => setEditingCommentText(e.target.value)} rows={2} style={{ borderRadius: 8 }} />
                            <Space style={{ marginTop: 8 }}>
                              <Button type="primary" size="small" onClick={() => handleUpdateComment(item.id)}>Save</Button>
                              <Button size="small" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                            </Space>
                          </div>
                        ) : (
                          <Paragraph style={{ margin: "4px 0 0 0", color: isDarkMode ? "#CBD5E1" : "#475569", fontSize: 13 }}>
                            {item.comment}
                          </Paragraph>
                        )}
                        
                        {item.user === user?.id && editingCommentId !== item.id && (
                          <Space style={{ marginTop: 6 }} size="middle">
                            <Button type="link" size="small" style={{ padding: 0, fontSize: 11 }} icon={<EditOutlined />} onClick={() => { setEditingCommentId(item.id); setEditingCommentText(item.comment); }}>Edit</Button>
                            <Popconfirm title="Delete comment?" onConfirm={() => handleDeleteComment(item.id)}>
                              <Button type="link" danger size="small" style={{ padding: 0, fontSize: 11 }} icon={<DeleteOutlined />}>Delete</Button>
                            </Popconfirm>
                          </Space>
                        )}
                      </div>
                    </div>
                  </List.Item>
                )}
              />

              {/* Add Comment Box */}
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <Input.TextArea
                  placeholder="Ask a question or post progress logs..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  style={{ borderRadius: 8, flex: 1 }}
                />
                <Button type="primary" icon={<SendOutlined />} onClick={handlePostComment} style={{ height: "auto" }}>Post</Button>
              </div>
            </div>

            <Divider style={{ margin: "4px 0" }} />

            {/* Attachments Store */}
            <div>
              <Text style={{ fontWeight: 700, color: "#06B6D4", display: "block", marginBottom: 12 }}>
                <PaperClipOutlined /> Verification Attachments
              </Text>
              
              <Upload customRequest={handleFileUpload} showUploadList={false}>
                <Button icon={<UploadOutlined />} loading={uploadingFile} style={{ borderRadius: 8, marginBottom: 16 }}>
                  Upload Verification Proof (Screenshot, PDF, Log, ZIP)
                </Button>
              </Upload>

              {selectedVuln.evidence_files && selectedVuln.evidence_files.length > 0 ? (
                <Row gutter={[12, 12]}>
                  {selectedVuln.evidence_files.map((file) => (
                    <Col span={12} key={file.id}>
                      <Card
                        size="small"
                        style={{
                          background: isDarkMode ? "rgba(255,255,255,0.02)" : "#F8FAFC",
                          border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "#E2E8F0"}`,
                          borderRadius: 8
                        }}
                      >
                        <Space>
                          {file.file_type === "SCREENSHOT" ? <FileImageOutlined style={{ color: "#3B82F6" }} /> : file.file_type === "PDF" ? <FilePdfOutlined style={{ color: "#EF4444" }} /> : <FileTextOutlined />}
                          <div>
                            <Text strong style={{ fontSize: 12, display: "block" }} ellipsis>{file.file_name}</Text>
                            <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                              <Button size="small" type="link" style={{ padding: 0, fontSize: 11 }}>Download</Button>
                            </a>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Text style={{ color: "#64748B", fontStyle: "italic", fontSize: 12 }}>No verification artifacts uploaded.</Text>
              )}
            </div>

            <Divider style={{ margin: "4px 0" }} />

            {/* Complete incident history timeline */}
            <div>
              <Text style={{ fontWeight: 700, color: "#06B6D4", display: "block", marginBottom: 12 }}>
                <ClockCircleOutlined /> Security Custody History
              </Text>
              
              {selectedVuln.activities && selectedVuln.activities.length > 0 ? (
                <Timeline
                  items={selectedVuln.activities.map((act) => ({
                    color: act.action.includes("APPROVED") ? "green" : act.action.includes("REJECTED") ? "red" : "blue",
                    children: (
                      <div>
                        <strong>{act.action.replace("_", " ")}</strong> — {act.comment || "Security trail validated."}
                        <Text style={{ fontSize: 11, color: "#94A3B8", display: "block" }}>
                          by {act.user_name} on {dayjs(act.created_at).format("YYYY-MM-DD HH:mm")}
                        </Text>
                      </div>
                    )
                  }))}
                />
              ) : (
                <Text style={{ color: "#94A3B8", fontStyle: "italic", fontSize: 12 }}>No history trails logged.</Text>
              )}
            </div>
          </Space>
        )}
      </Drawer>
    </motion.div>
  );
};

export default MyAssignedVulnerabilities;
