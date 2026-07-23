import React, { useState, useEffect } from "react";
import { Table, Card, Space, Input, Select, Drawer, Descriptions, Tag, Typography, Button, notification, Avatar } from "antd";
import { SearchOutlined, EyeOutlined, SyncOutlined, UserOutlined, FileExcelOutlined, FileTextOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import dayjs from "dayjs";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();
  
  // Filters
  const [searchText, setSearchText] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  // Drawer detail state
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      let url = "/audit-logs/export/excel/";
      const params = new URLSearchParams();
      if (moduleFilter) params.append("module", moduleFilter);
      if (actionFilter) params.append("action", actionFilter);
      if (searchText) params.append("search", searchText);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url, { responseType: "blob" });
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `Audit_Logs_${dayjs().format("YYYY-MM-DD")}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      notification.success({
        message: "Excel Export Complete",
        description: "Successfully downloaded Audit Logs as Excel spreadsheet.",
        icon: <FileExcelOutlined style={{ color: "#22C55E" }} />,
      });
    } catch (err) {
      notification.error({
        message: "Excel Export Failed",
        description: "Failed to generate Audit Logs Excel report.",
      });
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    try {
      const res = await api.get("/reports/export/?type=audit_logs&format=csv", {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `Audit_Logs_${dayjs().format("YYYY-MM-DD")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      notification.success({
        message: "CSV Export Complete",
        description: "Successfully downloaded Audit Logs as CSV file.",
        icon: <FileTextOutlined style={{ color: "#3B82F6" }} />,
      });
    } catch (err) {
      notification.error({
        message: "CSV Export Failed",
        description: "Failed to generate CSV file.",
      });
    } finally {
      setIsExportingCSV(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchText) params.username = searchText;
      if (moduleFilter) params.module = moduleFilter;
      if (actionFilter) params.action = actionFilter;

      const res = await api.get("/audit-logs/", { params });
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      notification.error({
        message: "Error fetching audit logs",
        description: err.response?.data?.message || "Failed to load audit logs.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [searchText, moduleFilter, actionFilter]);

  const handleOpenDetail = (record) => {
    setSelectedLog(record);
    setIsDrawerOpen(true);
  };

  const getActionColor = (action) => {
    switch (action) {
      case "CREATE": case "LOGIN": return "green";
      case "DELETE": case "DEACTIVATE": return "red";
      case "UPDATE": case "STATUS_UPDATE": return "orange";
      case "ACTIVATE": return "cyan";
      default: return "default";
    }
  };

  const getInitials = (username) => {
    return (username || "SYS").slice(0, 2).toUpperCase();
  };

  const columns = [
    {
      title: "Timestamp",
      dataIndex: "created_at",
      key: "timestamp",
      render: (text) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      defaultSortOrder: "descend",
    },
    {
      title: "Executor",
      dataIndex: "username",
      key: "user",
      render: (text) => (
        <Space size="middle">
          <Avatar
            size="small"
            style={{
              backgroundColor: isDarkMode ? "#3B82F6" : "#2563EB",
              verticalAlign: "middle",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {getInitials(text)}
          </Avatar>
          <strong style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{text || "System"}</strong>
        </Space>
      ),
    },
    {
      title: "Module Area",
      dataIndex: "module",
      key: "module",
      render: (text) => <Tag color="blue" style={{ borderRadius: 6, fontWeight: 500 }}>{text}</Tag>,
    },
    {
      title: "Action Event",
      dataIndex: "action",
      key: "action",
      render: (text) => <Tag color={getActionColor(text)} style={{ borderRadius: 6, fontWeight: 600 }}>{text}</Tag>,
    },
    {
      title: "Description Ledger",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => <span style={{ color: isDarkMode ? "#94A3B8" : "#475569" }}>{text}</span>,
    },
    {
      title: "Client IP",
      dataIndex: "ip_address",
      key: "ip_address",
      render: (ip) => <span style={{ fontFamily: "monospace", color: isDarkMode ? "#64748B" : "#94A3B8" }}>{ip || "127.0.0.1"}</span>,
    },
    {
      title: "Inspect",
      key: "inspect",
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined style={{ color: "#8B5CF6" }} />}
          onClick={() => handleOpenDetail(record)}
        />
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
              Audit Activity Logs
            </Title>
            <Paragraph style={{ margin: 0, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
              Review real-time system changes, database CRUD, and console sessions.
            </Paragraph>
          </div>
          <Button
            icon={<SyncOutlined />}
            onClick={fetchLogs}
            loading={loading}
            style={{
              borderRadius: 10,
              height: 40,
              background: isDarkMode ? "#0F172A" : "#FFFFFF",
              border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
              color: isDarkMode ? "#F1F5F9" : "#0F172A",
              fontWeight: 600,
            }}
          >
            Refresh Logs
          </Button>
        </div>

        {/* Filters bar */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          <Input
            placeholder="Search by Executor..."
            prefix={<SearchOutlined style={{ color: "#94A3B8" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              maxWidth: 240,
              borderRadius: 10,
              height: 40,
              background: isDarkMode ? "#0F172A" : "#FFFFFF",
              border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
            }}
            allowClear
          />

          <Select
            placeholder="Filter Module"
            allowClear
            value={moduleFilter || undefined}
            onChange={(val) => setModuleFilter(val || "")}
            style={{ width: 180 }}
          >
            <Option value="Authentication">Authentication</Option>
            <Option value="Department">Department</Option>
            <Option value="Admin">Admin</Option>
            <Option value="Employee">Employee</Option>
            <Option value="Asset">Asset</Option>
            <Option value="Vulnerability">Vulnerability</Option>
          </Select>

          <Select
            placeholder="Filter Action"
            allowClear
            value={actionFilter || undefined}
            onChange={(val) => setActionFilter(val || "")}
            style={{ width: 180 }}
          >
            <Option value="LOGIN">LOGIN</Option>
            <Option value="LOGOUT">LOGOUT</Option>
            <Option value="CREATE">CREATE</Option>
            <Option value="UPDATE">UPDATE</Option>
            <Option value="DELETE">DELETE</Option>
            <Option value="RESTORE">RESTORE</Option>
            <Option value="ACTIVATE">ACTIVATE</Option>
            <Option value="DEACTIVATE">DEACTIVATE</Option>
          </Select>

          <Space wrap>
            <Button
              icon={<FileTextOutlined />}
              onClick={handleExportCSV}
              loading={isExportingCSV}
              disabled={isExportingCSV || isExportingExcel}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Export CSV
            </Button>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={handleExportExcel}
              loading={isExportingExcel}
              disabled={isExportingCSV || isExportingExcel}
              style={{
                borderRadius: 8,
                fontWeight: 600,
                background: "#16A34A",
                borderColor: "#16A34A",
              }}
            >
              Export Excel
            </Button>
          </Space>
        </div>

        <Table
          dataSource={logs}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="middle"
          scroll={{ x: true }}
        />

        {/* Detail Drawer */}
        <Drawer
          title={<span style={{ color: isDarkMode ? "#FFFFFF" : "#0F172A" }}>Audit Log Inspector</span>}
          placement="right"
          width={500}
          onClose={() => setIsDrawerOpen(false)}
          open={isDrawerOpen}
        >
          {selectedLog && (
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Tag color={getActionColor(selectedLog.action)} style={{ marginBottom: 8, borderRadius: 6, fontWeight: 700 }}>
                  {selectedLog.action} ACTION
                </Tag>
                <Title level={4} style={{ margin: 0, color: isDarkMode ? "#FFFFFF" : "#0F172A" }}>
                  Log Record #{selectedLog.id}
                </Title>
              </div>

              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Target Module">
                  <span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{selectedLog.module}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Executor">
                  <strong style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{selectedLog.username || "System/Deleted User"}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="IP Address">
                  <span style={{ fontFamily: "monospace", color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{selectedLog.ip_address || "127.0.0.1"}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Timestamp">
                  <span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{new Date(selectedLog.created_at).toLocaleString()}</span>
                </Descriptions.Item>
              </Descriptions>

              <div>
                <Text strong style={{ display: "block", marginBottom: 8, color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>Action Description Details</Text>
                <Paragraph style={{ padding: "12px", background: isDarkMode ? "#0F172A" : "#f8f9fa", borderRadius: 8, border: `1px solid ${isDarkMode ? "#334155" : "#ebecf0"}`, color: isDarkMode ? "#94A3B8" : "#475569" }}>
                  {selectedLog.description}
                </Paragraph>
              </div>
            </Space>
          )}
        </Drawer>
      </Card>
    </motion.div>
  );
};

export default AuditLogs;
