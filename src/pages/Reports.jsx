import React, { useState } from "react";
import { Card, Row, Col, Button, Table, Typography, Radio, Space, Spin, Empty, notification, Divider, Tag, Progress, Skeleton } from "antd";
import { DownloadOutlined, EyeOutlined, FileTextOutlined, SafetyCertificateOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

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
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: isDarkMode ? "#FFFFFF" : "#0F172A" }}>
            Compliance & Auditing Reports
          </Title>
          <Paragraph style={{ margin: 0, color: isDarkMode ? "#94A3B8" : "#64748B", marginTop: 4 }}>
            Generate executive compliance spreadsheets and real-time security registry exports.
          </Paragraph>
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
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownloadCSV}
                loading={isExporting}
                size="large"
                style={{
                  flex: 1,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                  border: "none",
                  fontWeight: 700,
                  height: 48,
                  boxShadow: "0 6px 20px rgba(37, 99, 235, 0.3)",
                }}
              >
                Export CSV
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
