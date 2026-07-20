import React, { useState, useEffect } from "react";
import { Row, Col, Card, Table, Tag, Typography, Spin, Empty, Alert, Button, Space } from "antd";
import { BugOutlined, ApartmentOutlined, UserSwitchOutlined, TeamOutlined, LaptopOutlined, PlusOutlined, FilePdfOutlined } from "@ant-design/icons";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";
import { motion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { role } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/stats/");
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError(res.data.message || "Failed to load dashboard metrics.");
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Error communicating with security backend.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "70vh", gap: 16 }}>
        <Spin size="large" />
        <Text style={{ color: isDarkMode ? "#94A3B8" : "#64748B", fontWeight: 500 }}>Aggregating VulnGuard telemetry logs...</Text>
      </div>
    );
  }

  if (error) {
    return <Alert message="System Sync Failure" description={error} type="error" showIcon style={{ borderRadius: 16 }} />;
  }

  if (!data) {
    return <Empty description="No metrics database found." />;
  }

  const {
    total_departments,
    total_admins,
    total_employees,
    total_assets,
    total_vulnerabilities,
    severities,
    statuses,
    charts,
    recent_activities,
  } = data;

  // Calculate Security Health Score: Start at 100, deduct points for open vulnerabilities based on severity weightings
  const calculateHealthScore = () => {
    let score = 100;
    if (severities) {
      score -= (severities.Critical || 0) * 15;
      score -= (severities.High || 0) * 8;
      score -= (severities.Medium || 0) * 3;
      score -= (severities.Low || 0) * 1;
    }
    return Math.max(10, score);
  };

  const healthScore = calculateHealthScore();

  // Premium colors
  const SEVERITY_COLORS = {
    Critical: "#EF4444", // Danger red
    High: "#F59E0B",     // Warning orange
    Medium: "#3B82F6",   // Info blue
    Low: "#22C55E",      // Success green
  };

  const STATUS_COLORS = {
    Open: "#EF4444",
    "In Progress": "#6366F1",
    Resolved: "#22C55E",
    Closed: "#64748B",
  };

  const activityColumns = [
    {
      title: "User",
      dataIndex: "username",
      key: "user",
      render: (text) => <strong style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{text || "System"}</strong>,
    },
    {
      title: "Module",
      dataIndex: "module",
      key: "module",
      render: (text) => <Tag color="blue" style={{ borderRadius: 6, fontWeight: 500 }}>{text}</Tag>,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action) => {
        let color = "default";
        if (action === "CREATE" || action === "LOGIN") color = "green";
        if (action === "DELETE" || action === "DEACTIVATE") color = "red";
        if (action === "UPDATE" || action === "STATUS_UPDATE") color = "orange";
        return <Tag color={color} style={{ borderRadius: 6, fontWeight: 600 }}>{action}</Tag>;
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <span style={{ color: isDarkMode ? "#94A3B8" : "#475569" }}>{text}</span>,
    },
    {
      title: "IP Address",
      dataIndex: "ip_address",
      key: "ip_address",
      render: (ip) => <span style={{ fontFamily: "monospace", color: isDarkMode ? "#64748B" : "#94A3B8" }}>{ip || "127.0.0.1"}</span>,
    },
    {
      title: "Timestamp",
      dataIndex: "created_at",
      key: "timestamp",
      render: (time) => dayjs(time).format("YYYY-MM-DD HH:mm:ss"),
    },
  ];

  const getHealthText = (score) => {
    if (score >= 90) return { label: "EXCELLENT", color: "#22C55E", desc: "No critical vulnerabilities active. Asset compliance is optimal." };
    if (score >= 75) return { label: "GOOD", color: "#3B82F6", desc: "Minor patches required. Security vector is stable." };
    if (score >= 50) return { label: "WARNING", color: "#F59E0B", desc: "Unpatched high CVE scores detected. Immediate remediation required." };
    return { label: "COMPROMISED", color: "#EF4444", desc: "Critical vectors active. Assets are highly vulnerable." };
  };

  const healthMeta = getHealthText(healthScore);

  // Framer Motion presets
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ padding: "4px" }}
    >
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: isDarkMode ? "#FFFFFF" : "#0F172A" }}>
            Security Operations Dashboard
          </Title>
          <Paragraph style={{ margin: 0, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
            Continuous vulnerability scanner logs and organization infrastructure health.
          </Paragraph>
        </div>
        <div style={{ fontSize: 12, color: isDarkMode ? "#64748B" : "#94A3B8", textAlign: "right" }}>
          <span>Telemetry Stream: </span>
          <Tag color="processing" style={{ borderRadius: 6, fontWeight: 600 }}>ACTIVE</Tag>
        </div>
      </div>

      {/* Main post deck: Stats & Security health meter */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} xl={16}>
          <Row gutter={[16, 16]}>
            {/* Asset card */}
            <Col xs={12} md={6}>
              <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
                <Card
                  bordered={false}
                  style={{
                    background: isDarkMode ? "#1E293B" : "#FFFFFF",
                    border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
                    borderRadius: 16,
                  }}
                >
                  <Space direction="vertical" size="small">
                    <LaptopOutlined style={{ fontSize: 24, color: "#2563EB" }} />
                    <span style={{ color: isDarkMode ? "#94A3B8" : "#64748B", fontSize: 13, display: "block" }}>Total Assets</span>
                    <h2 style={{ fontSize: 28, margin: 0, fontWeight: 800, color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{total_assets}</h2>
                  </Space>
                </Card>
              </motion.div>
            </Col>

            {/* CVE card */}
            <Col xs={12} md={6}>
              <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
                <Card
                  bordered={false}
                  style={{
                    background: isDarkMode ? "#1E293B" : "#FFFFFF",
                    border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
                    borderRadius: 16,
                  }}
                >
                  <Space direction="vertical" size="small">
                    <BugOutlined style={{ fontSize: 24, color: "#EF4444" }} />
                    <span style={{ color: isDarkMode ? "#94A3B8" : "#64748B", fontSize: 13, display: "block" }}>CVEs Active</span>
                    <h2 style={{ fontSize: 28, margin: 0, fontWeight: 800, color: "#EF4444" }}>{total_vulnerabilities}</h2>
                  </Space>
                </Card>
              </motion.div>
            </Col>

            {/* Employees */}
            <Col xs={12} md={6}>
              <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
                <Card
                  bordered={false}
                  style={{
                    background: isDarkMode ? "#1E293B" : "#FFFFFF",
                    border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
                    borderRadius: 16,
                  }}
                >
                  <Space direction="vertical" size="small">
                    <TeamOutlined style={{ fontSize: 24, color: "#14B8A6" }} />
                    <span style={{ color: isDarkMode ? "#94A3B8" : "#64748B", fontSize: 13, display: "block" }}>Security Teams</span>
                    <h2 style={{ fontSize: 28, margin: 0, fontWeight: 800, color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{total_employees}</h2>
                  </Space>
                </Card>
              </motion.div>
            </Col>

            {/* Departments */}
            <Col xs={12} md={6}>
              <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
                <Card
                  bordered={false}
                  style={{
                    background: isDarkMode ? "#1E293B" : "#FFFFFF",
                    border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
                    borderRadius: 16,
                  }}
                >
                  <Space direction="vertical" size="small">
                    <ApartmentOutlined style={{ fontSize: 24, color: "#6366F1" }} />
                    <span style={{ color: isDarkMode ? "#94A3B8" : "#64748B", fontSize: 13, display: "block" }}>Departments</span>
                    <h2 style={{ fontSize: 28, margin: 0, fontWeight: 800, color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{total_departments}</h2>
                  </Space>
                </Card>
              </motion.div>
            </Col>
          </Row>

          {/* Quick actions panel */}
          <motion.div variants={itemVariants} style={{ marginTop: 16 }}>
            <Card
              bordered={false}
              style={{
                background: isDarkMode ? "#1E293B" : "#FFFFFF",
                border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
                borderRadius: 16,
              }}
            >
              <h4 style={{ margin: "0 0 16px 0", fontWeight: 700, color: isDarkMode ? "#F1F5F9" : "#0F172A", fontSize: 15 }}>
                Security Center Operations Deck
              </h4>
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={8}>
                  <Button
                    type="primary"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => navigate("/vulnerabilities")}
                    style={{
                      borderRadius: 10,
                      height: 42,
                      background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                      border: "none",
                      fontWeight: 600,
                    }}
                  >
                    {role === "IT_ENGINEER" ? "View Assigned CVEs" : "Report Vulnerability"}
                  </Button>
                </Col>
                <Col xs={24} sm={8}>
                  <Button
                    block
                    icon={<LaptopOutlined />}
                    onClick={() => navigate("/assets")}
                    style={{
                      borderRadius: 10,
                      height: 42,
                      background: isDarkMode ? "#0F172A" : "#F1F5F9",
                      border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
                      color: isDarkMode ? "#F1F5F9" : "#0F172A",
                      fontWeight: 600,
                    }}
                  >
                    {["OWNER", "ADMIN", "SECURITY_MANAGER"].includes(role) ? "Register System Asset" : "View System Assets"}
                  </Button>
                </Col>
                <Col xs={24} sm={8}>
                  <Button
                    block
                    icon={<FilePdfOutlined />}
                    onClick={() => navigate(["OWNER", "ADMIN", "SECURITY_MANAGER"].includes(role) ? "/reports" : "/profile")}
                    style={{
                      borderRadius: 10,
                      height: 42,
                      background: isDarkMode ? "#0F172A" : "#F1F5F9",
                      border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
                      color: isDarkMode ? "#F1F5F9" : "#0F172A",
                      fontWeight: 600,
                    }}
                  >
                    {["OWNER", "ADMIN", "SECURITY_MANAGER"].includes(role) ? "Export Compliance Reports" : "My Profile Settings"}
                  </Button>
                </Col>
              </Row>
            </Card>
          </motion.div>
        </Col>

        {/* Security Health Score Radial Meter */}
        <Col xs={24} xl={8}>
          <motion.div variants={itemVariants}>
            <Card
              bordered={false}
              style={{
                background: isDarkMode ? "#1E293B" : "#FFFFFF",
                border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
                borderRadius: 16,
                height: 242,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>
                <div style={{ position: "relative", width: 120, height: 120 }}>
                  {/* Radial progress stroke */}
                  <svg width="120" height="120" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke={isDarkMode ? "#334155" : "#F1F5F9"} strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke={healthMeta.color}
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - healthScore / 100)}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      style={{ transition: "stroke-dashoffset 0.8s ease" }}
                    />
                  </svg>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 26, fontWeight: 900, color: isDarkMode ? "#F1F5F9" : "#0F172A", lineHeight: 1 }}>
                      {healthScore}
                    </span>
                    <span style={{ fontSize: 10, color: isDarkMode ? "#64748B" : "#94A3B8", fontWeight: 600, marginTop: 4 }}>
                      HEALTH SCORE
                    </span>
                  </div>
                </div>
                <div style={{ maxWidth: "50%" }}>
                  <Space direction="vertical" size="2">
                    <span style={{ fontSize: 12, fontWeight: 700, color: isDarkMode ? "#64748B" : "#94A3B8" }}>POSTURE RATING</span>
                    <span style={{ color: healthMeta.color, fontSize: 18, fontWeight: 800 }}>{healthMeta.label}</span>
                    <Paragraph style={{ margin: 0, fontSize: 12, color: isDarkMode ? "#94A3B8" : "#64748B", lineHeight: "1.4" }}>
                      {healthMeta.desc}
                    </Paragraph>
                  </Space>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Analytics Graphs */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        {/* Severity Pie Chart */}
        <Col xs={24} lg={8}>
          <motion.div variants={itemVariants}>
            <Card
              title={<span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A", fontWeight: 700 }}>Severity Distribution</span>}
              bordered={false}
              style={{
                background: isDarkMode ? "#1E293B" : "#FFFFFF",
                border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
                borderRadius: 16,
                height: 380,
              }}
            >
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.severity_pie.filter((item) => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {charts.severity_pie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || "#ccc"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Issues`, "Count"]} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
                {charts.severity_pie.every((item) => item.value === 0) && (
                  <Empty description="No threat data recorded." style={{ marginTop: -150 }} />
                )}
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* Status Bar Chart */}
        <Col xs={24} lg={8}>
          <motion.div variants={itemVariants}>
            <Card
              title={<span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A", fontWeight: 700 }}>Remediation Statuses</span>}
              bordered={false}
              style={{
                background: isDarkMode ? "#1E293B" : "#FFFFFF",
                border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
                borderRadius: 16,
                height: 380,
              }}
            >
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.status_bar} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#F1F5F9"} vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? "#64748B" : "#94A3B8" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? "#64748B" : "#94A3B8" }} />
                    <Tooltip cursor={{ fill: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }} />
                    <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]}>
                      {charts.status_bar.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#2563EB"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* Trend Area Chart */}
        <Col xs={24} lg={8}>
          <motion.div variants={itemVariants}>
            <Card
              title={<span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A", fontWeight: 700 }}>30-Day Occurrence Trend</span>}
              bordered={false}
              style={{
                background: isDarkMode ? "#1E293B" : "#FFFFFF",
                border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
                borderRadius: 16,
                height: 380,
              }}
            >
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.trend_line} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#F1F5F9"} vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tickFormatter={(val) => dayjs(val).format("MMM DD")} tick={{ fill: isDarkMode ? "#64748B" : "#94A3B8" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? "#64748B" : "#94A3B8" }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" dot={{ r: 0 }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Recent Activity Table */}
      <motion.div variants={itemVariants}>
        <Card
          title={<span style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A", fontWeight: 700 }}>Audited Security Event Ledger</span>}
          bordered={false}
          style={{
            background: isDarkMode ? "#1E293B" : "#FFFFFF",
            border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
            borderRadius: 16,
            boxShadow: isDarkMode ? "0 8px 30px rgba(0, 0, 0, 0.2)" : "0 8px 30px rgba(0, 0, 0, 0.015)",
          }}
        >
          <Table
            dataSource={recent_activities}
            columns={activityColumns}
            rowKey="id"
            pagination={false}
            size="middle"
            scroll={{ x: true }}
            locale={{ emptyText: <Empty description="No security activity logs yet." /> }}
          />
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
