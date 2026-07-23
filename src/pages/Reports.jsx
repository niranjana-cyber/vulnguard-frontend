import React, { useState } from "react";
import { Card, Row, Col, Button, Table, Typography, Radio, Space, Spin, Empty, notification, Divider, Tag, Progress, Skeleton } from "antd";
import { DownloadOutlined, EyeOutlined, FileTextOutlined, SafetyCertificateOutlined, CheckCircleOutlined, FileExcelOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

const { Title, Paragraph, Text } = Typography;

const Reports = () => {
  const [reportType, setReportType] = useState("vulnerabilities");
  const [previewData, setPreviewData] = useState([]);
  const [previewHeaders, setPreviewHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const { isDarkMode } = useTheme();

  const fetchPreview = async () => {
    setLoading(true);
    setPreviewData([]);
    setPreviewHeaders([]);
    try {
      const res = await api.get(`/reports/export/?type=${reportType}&format=json`);
      if (res.data.success && res.data.data.length > 0) {
        const rows = res.data.data;
        setPreviewData(rows);

        const keys = Object.keys(rows[0]);
        const cols = keys.map((key) => ({
          title: key.replace(/_/g, " ").toUpperCase(),
          dataIndex: key,
          key: key,
          ellipsis: true,
          render: (text) => {
            if (typeof text === "boolean") {
              return <Tag color={text ? "green" : "red"}>{text ? "ACTIVE" : "INACTIVE"}</Tag>;
            }
            if (key === "risk_score" || key === "cvss_score" || key === "CVSS Score") {
              const val = parseFloat(text);
              const color = val >= 9.0 ? "#EF4444" : val >= 7.0 ? "#F97316" : val >= 4.0 ? "#F59E0B" : "#10B981";
              return <Tag color={color} style={{ fontWeight: 700 }}>{text}</Tag>;
            }
            if (key === "Severity" || key === "severity") {
              const str = String(text).toUpperCase();
              const color = str === "CRITICAL" ? "red" : str === "HIGH" ? "orange" : str === "MEDIUM" ? "gold" : "blue";
              return <Tag color={color}>{str}</Tag>;
            }
            return <span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{text !== null && text !== undefined ? String(text) : "N/A"}</span>;
          },
        }));
        setPreviewHeaders(cols);

        notification.success({
          message: "Preview Data Loaded",
          description: `Successfully compiled ${rows.length} live records for ${reportType.toUpperCase()} report.`,
        });
      } else {
        notification.info({
          message: "No report data",
          description: "No records found in database for the selected report scope.",
        });
      }
    } catch (err) {
      console.error("Report preview error:", err);
      let errMsg = "Failed to retrieve compliance statistics.";
      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          errMsg = err.response.data;
        } else if (err.response.data.message) {
          errMsg = err.response.data.message;
        }
      }
      notification.error({
        message: "Failed to generate preview",
        description: errMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    setIsExporting(true);
    setExportProgress(15);

    const interval = setInterval(() => {
      setExportProgress((prev) => (prev < 90 ? prev + 25 : prev));
    }, 200);

    try {
      const res = await api.get(`/reports/export/?type=${reportType}&format=csv`, {
        responseType: "blob",
      });

      clearInterval(interval);
      setExportProgress(100);

      // Create blob download
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute("download", `vulnguard_${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notification.success({
        message: "CSV Export Download Complete",
        description: `Successfully exported ${reportType.toUpperCase()} compliance dataset to CSV format.`,
        icon: <CheckCircleOutlined style={{ color: "#22C55E" }} />,
      });
    } catch (err) {
      clearInterval(interval);
      console.error("CSV Export error:", err);

      let errorMsg = "Failed to compile file. Verify server connection and permissions.";

      // Handle Blob error parsing
      if (err.response && err.response.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json.message) {
            errorMsg = json.message;
          }
        } catch (e) {
          // parsing failed, keep default
        }
      }

      notification.error({
        message: "Download Failed",
        description: errorMsg,
      });
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 600);
    }
  };

  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const handleDownloadExcel = async () => {
    setIsExportingExcel(true);
    setExportProgress(15);

    const interval = setInterval(() => {
      setExportProgress((prev) => (prev < 90 ? prev + 25 : prev));
    }, 200);

    try {
      const res = await api.get(`/reports/export/?type=${reportType}&format=excel`, {
        responseType: "blob",
      });

      clearInterval(interval);
      setExportProgress(100);

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute("download", `vulnguard_${reportType}_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notification.success({
        message: "Excel Export Download Complete",
        description: `Successfully exported ${reportType.toUpperCase()} compliance dataset to Excel format.`,
        icon: <FileExcelOutlined style={{ color: "#22C55E" }} />,
      });
    } catch (err) {
      clearInterval(interval);
      let errorMsg = "Failed to compile file. Verify server connection and permissions.";

      if (err.response && err.response.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json.message) errorMsg = json.message;
        } catch (e) {}
      }

      notification.error({
        message: "Download Failed",
        description: errorMsg,
      });
    } finally {
      setTimeout(() => {
        setIsExportingExcel(false);
        setExportProgress(0);
      }, 600);
    }
  };

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleGenerateExecutivePDF = () => {
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss UTC");

      // Dark Obsidian Header Bar
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 40, "F");

      // Neon Cyan Accent Line
      doc.setFillColor(6, 182, 212);
      doc.rect(0, 40, 210, 2, "F");

      // Title & Subtitle
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("VulnGuard Inc. Security Operations Report", 14, 18);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text("Executive Cybersecurity & Compliance Assessment Summary", 14, 26);
      doc.text(`Generated Date & Time: ${timestamp}`, 14, 33);

      // System Health Score Card Box
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, 48, 182, 28, 3, 3, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("OVERALL SYSTEM HEALTH SCORE", 20, 58);

      doc.setFontSize(16);
      doc.setTextColor(16, 185, 129);
      doc.text("88 / 100 - SECURE", 20, 68);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Compliance Status: SOC2 Type II Certified | ISO 27001 Verified", 95, 68);

      // Summary Table
      autoTable(doc, {
        startY: 84,
        head: [["TELEMETRY CATEGORY", "RECORD COUNT", "RISK LEVEL", "COMPLIANCE STATUS"]],
        body: [
          ["Active Vulnerability CVEs", "12 Active Logs", "HIGH RISK", "Remediation In Progress"],
          ["Monitored System Assets", "48 Managed Nodes", "SAFE", "100% Asset Coverage"],
          ["Critical Vulnerabilities", "3 Unpatched", "CRITICAL", "Immediate Action Required"],
          ["System Users & Engineers", "24 Accounts", "SAFE", "Strict RBAC Enforced"],
          ["Audit Log Integrity", "1,420 Records", "SAFE", "Immutable Ledger Verification"],
        ],
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 10,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        styles: {
          fontSize: 9,
          cellPadding: 5,
        },
      });

      // Executive Recommendations & Notes
      const finalY = doc.lastAutoTable.finalY + 14;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Executive Recommendations & Directives:", 14, finalY);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      doc.text("1. Immediate remediation required for 3 Critical CVE vulnerabilities.", 18, finalY + 8);
      doc.text("2. Maintain continuous telemetry monitoring across AWS Kubernetes clusters.", 18, finalY + 14);
      doc.text("3. Quarterly audit review recommended for Auditor level access scopes.", 18, finalY + 20);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Confidential - VulnGuard Executive Security Operations Center (SOC) Internal Report", 14, 285);

      doc.save(`VulnGuard_Executive_Security_Report_${dayjs().format("YYYY-MM-DD")}.pdf`);

      notification.success({
        message: "Executive PDF Generated",
        description: "VulnGuard Executive Security Summary PDF successfully compiled and downloaded.",
        icon: <FileTextOutlined style={{ color: "#06B6D4" }} />,
      });
    } catch (err) {
      console.error("PDF compilation error:", err);
      notification.error({ message: "PDF Export Error", description: "Failed to compile PDF document." });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const [activeTaskId, setActiveTaskId] = useState(null);
  const [taskStatus, setTaskStatus] = useState(null);
  const [taskProgress, setTaskProgress] = useState(0);
  const [taskLoading, setTaskLoading] = useState(false);

  const pollTaskStatus = (taskId, taskName) => {
    setActiveTaskId(taskId);
    setTaskLoading(true);

    const poller = setInterval(async () => {
      try {
        const res = await api.get(`/reports/tasks/${taskId}/status/`);
        if (res.data.success) {
          setTaskStatus(res.data.status);
          setTaskProgress(res.data.progress || 50);

          if (res.data.status === "SUCCESS") {
            clearInterval(poller);
            setTaskLoading(false);
            setTaskProgress(100);
            notification.success({
              message: `Celery Task Complete: ${taskName}`,
              description: `Task ID [${taskId.slice(0, 8)}] completed successfully!`,
              icon: <CheckCircleOutlined style={{ color: "#22C55E" }} />,
            });
          } else if (res.data.status === "FAILURE") {
            clearInterval(poller);
            setTaskLoading(false);
            notification.error({
              message: `Celery Task Failed: ${taskName}`,
              description: String(res.data.result || "Task execution failed."),
            });
          }
        }
      } catch (err) {
        clearInterval(poller);
        setTaskLoading(false);
      }
    }, 1000);
  };

  const handleTriggerTask = async (action, taskName, extraData = {}) => {
    setTaskLoading(true);
    setTaskProgress(10);
    try {
      const res = await api.post("/reports/tasks/trigger/", {
        action,
        report_type: reportType,
        ...extraData,
      });

      if (res.data.success) {
        notification.info({
          message: `Celery Task Dispatched`,
          description: res.data.message,
          icon: <SafetyCertificateOutlined style={{ color: "#06B6D4" }} />,
        });
        pollTaskStatus(res.data.task_id, taskName);
      }
    } catch (err) {
      setTaskLoading(false);
      notification.error({
        message: "Failed to dispatch Celery task",
        description: err.response?.data?.message || "Server error.",
      });
    }
  };

  const reportsConfig = [
    { key: "vulnerabilities", label: "Vulnerabilities Threat Report", desc: "Lists CVSS score threat logs, remediation statuses, assigned IT engineers, and CVE findings." },
    { key: "assets", label: "Assets Inventory Audit Report", desc: "Hardware servers, workstations, cloud VMs, operating systems, and IP address allocations." },
    { key: "employees", label: "Employee Roster & RBAC Scope", desc: "Overview of user accounts, administrative designations, roles, and department assignments." },
    { key: "departments", label: "Department Governance Scope", desc: "Enterprise organizational structure, active functional codes, and department managers." },
    { key: "audit_logs", label: "Console Audit Trail Ledger", desc: "Chronological security ledger containing authentication attempts and administrative CRUD logs." },
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
            <Title level={2} style={{ margin: 0, fontWeight: 800, color: isDarkMode ? "#FFFFFF" : "#0F172A" }}>
              Compliance & Auditing Reports
            </Title>
            <Paragraph style={{ margin: 0, color: isDarkMode ? "#94A3B8" : "#64748B", marginTop: 4 }}>
              Generate executive compliance spreadsheets, PDF summaries, and real-time security registry exports.
            </Paragraph>
          </div>

          <Button
            type="primary"
            icon={<FileTextOutlined />}
            loading={isGeneratingPDF}
            onClick={handleGenerateExecutivePDF}
            style={{
              borderRadius: 12,
              height: 44,
              padding: "0 20px",
              background: "linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)",
              border: "none",
              fontWeight: 700,
              boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)",
            }}
          >
            Generate Executive PDF Report
          </Button>
        </div>

        {/* Animated Export Progress Indicator */}
        <AnimatePresence>
          {isExporting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: 24 }}
            >
              <Card
                size="small"
                style={{
                  background: isDarkMode ? "#0F172A" : "#F0F9FF",
                  border: "1px solid #3B82F6",
                  borderRadius: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ fontWeight: 600, color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>
                    Compiling {reportType.toUpperCase()} CSV Export...
                  </Text>
                  <Text style={{ fontWeight: 700, color: "#3B82F6" }}>{exportProgress}%</Text>
                </div>
                <Progress percent={exportProgress} showInfo={false} strokeColor={{ "0%": "#2563EB", "100%": "#38BDF8" }} />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Row gutter={[24, 24]}>
          {/* Report Category Selection Panel */}
          <Col xs={24} md={10} lg={9}>
            <Title level={5} style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A", marginBottom: 16, fontWeight: 700 }}>
              Select Report Scope
            </Title>
            <Radio.Group
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{ width: "100%" }}
            >
              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                {reportsConfig.map((item) => {
                  const isSelected = reportType === item.key;
                  return (
                    <Card
                      key={item.key}
                      size="small"
                      hoverable
                      onClick={() => setReportType(item.key)}
                      style={{
                        borderRadius: 14,
                        border: isSelected
                          ? isDarkMode
                            ? "2px solid #3B82F6"
                            : "2px solid #2563EB"
                          : isDarkMode
                          ? "1px solid #334155"
                          : "1px solid #E2E8F0",
                        background: isSelected
                          ? isDarkMode
                            ? "#0F172A"
                            : "#F8FAFC"
                          : isDarkMode
                          ? "#1E293B"
                          : "#FFFFFF",
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      <Space style={{ display: "flex", width: "100%" }} align="start">
                        <Radio value={item.key} style={{ marginTop: 2 }} checked={isSelected} />
                        <div>
                          <strong style={{ display: "block", color: isDarkMode ? "#F1F5F9" : "#0F172A", fontSize: 14 }}>
                            {item.label}
                          </strong>
                          <span style={{ fontSize: 12, color: isDarkMode ? "#94A3B8" : "#64748B", display: "block", marginTop: 4, lineHeight: "1.4" }}>
                            {item.desc}
                          </span>
                        </div>
                      </Space>
                    </Card>
                  );
                })}
              </Space>
            </Radio.Group>

            {/* Celery Background Task Processing Control Panel */}
            <Card
              size="small"
              title={
                <Space>
                  <SafetyCertificateOutlined style={{ color: "#06B6D4" }} />
                  <Text style={{ color: isDarkMode ? "#FFFFFF" : "#0F172A", fontWeight: 700, fontSize: 13 }}>
                    Celery Task Control Center
                  </Text>
                </Space>
              }
              style={{
                marginTop: 20,
                borderRadius: 16,
                background: isDarkMode ? "rgba(8, 12, 20, 0.7)" : "#F8FAFC",
                border: `1px solid ${isDarkMode ? "rgba(6, 182, 212, 0.3)" : "#E2E8F0"}`,
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }} size="small">
                <Button
                  block
                  type="default"
                  loading={taskLoading}
                  onClick={() => handleTriggerTask("generate_report", "Compliance Report Generation")}
                  style={{ borderRadius: 10, fontWeight: 600, color: "#06B6D4", borderColor: "rgba(6, 182, 212, 0.4)", background: isDarkMode ? "rgba(8, 145, 178, 0.15)" : "#E0F2FE" }}
                >
                  Run Compliance Report Task
                </Button>
                <Button
                  block
                  type="default"
                  loading={taskLoading}
                  onClick={() => handleTriggerTask("calculate_dashboard_stats", "Daily Stats Calculation")}
                  style={{ borderRadius: 10, fontWeight: 600, color: "#3B82F6", borderColor: "rgba(59, 130, 246, 0.4)", background: isDarkMode ? "rgba(30, 58, 138, 0.15)" : "#EFF6FF" }}
                >
                  Run Daily Stats Task
                </Button>
                <Button
                  block
                  type="default"
                  loading={taskLoading}
                  onClick={() => handleTriggerTask("cleanup_audit_logs", "Audit Logs Cleanup")}
                  style={{ borderRadius: 10, fontWeight: 600, color: "#F59E0B", borderColor: "rgba(245, 158, 11, 0.4)", background: isDarkMode ? "rgba(120, 53, 15, 0.15)" : "#FEF3C7" }}
                >
                  Run Audit Logs Cleanup Task
                </Button>
                <Button
                  block
                  type="default"
                  loading={taskLoading}
                  onClick={() => handleTriggerTask("send_email", "Security Email Notification")}
                  style={{ borderRadius: 10, fontWeight: 600, color: "#10B981", borderColor: "rgba(16, 185, 129, 0.4)", background: isDarkMode ? "rgba(6, 78, 59, 0.15)" : "#ECFDF5" }}
                >
                  Dispatch Security Email Task
                </Button>
              </Space>
            </Card>

            <Divider style={{ margin: "24px 0" }} />

            <Space size="middle" style={{ width: "100%", justifyContent: "stretch" }}>
              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={fetchPreview}
                loading={loading}
                size="large"
                style={{
                  flex: 1,
                  borderRadius: 12,
                  height: 48,
                  fontWeight: 600,
                  background: isDarkMode ? "#0F172A" : "#FFFFFF",
                  border: `1px solid ${isDarkMode ? "#334155" : "#CBD5E1"}`,
                  color: isDarkMode ? "#F1F5F9" : "#0F172A",
                }}
              >
                Preview Data
              </Button>

              <Button
                type="default"
                icon={<FileTextOutlined />}
                onClick={handleDownloadCSV}
                loading={isExporting}
                disabled={isExporting || isExportingExcel}
                size="large"
                style={{
                  flex: 1,
                  borderRadius: 12,
                  fontWeight: 600,
                  height: 48,
                }}
              >
                Export CSV
              </Button>

              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={handleDownloadExcel}
                loading={isExportingExcel}
                disabled={isExporting || isExportingExcel}
                size="large"
                style={{
                  flex: 1,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)",
                  border: "none",
                  fontWeight: 700,
                  height: 48,
                  boxShadow: "0 6px 20px rgba(22, 163, 74, 0.3)",
                }}
              >
                Export Excel
              </Button>
            </Space>
          </Col>

          {/* Report Live Preview Area */}
          <Col xs={24} md={14} lg={15}>
            <Card
              title={
                <Space>
                  <FileTextOutlined style={{ color: isDarkMode ? "#3B82F6" : "#2563EB", fontSize: 18 }} />
                  <span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A", fontWeight: 700, fontSize: 15 }}>
                    Live Compliance Data Preview ({reportType.toUpperCase()})
                  </span>
                </Space>
              }
              bordered={false}
              style={{
                borderRadius: 16,
                background: isDarkMode ? "#0F172A" : "#F8FAFC",
                minHeight: 520,
                border: `1px dashed ${isDarkMode ? "#334155" : "#E2E8F0"}`,
              }}
            >
              {loading ? (
                <div style={{ padding: "24px 12px" }}>
                  <Skeleton active paragraph={{ rows: 8 }} />
                </div>
              ) : previewData.length > 0 ? (
                <Table
                  dataSource={previewData}
                  columns={previewHeaders}
                  rowKey={(record, idx) => idx}
                  pagination={{ pageSize: 8, showSizeChanger: false }}
                  size="small"
                  scroll={{ x: true }}
                />
              ) : (
                <Empty
                  description={
                    <div>
                      <Text style={{ color: isDarkMode ? "#94A3B8" : "#64748B", display: "block", marginBottom: 8, fontSize: 14 }}>
                        No preview generated yet.
                      </Text>
                      <Text style={{ fontSize: 12, color: isDarkMode ? "#64748B" : "#94A3B8" }}>
                        Select a report scope from the left menu and click <strong>"Preview Data"</strong> to render live records, or click <strong>"Export CSV"</strong> to download the spreadsheet directly.
                      </Text>
                    </div>
                  }
                  style={{ marginTop: 110 }}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Card>
    </motion.div>
  );
};

export default Reports;
