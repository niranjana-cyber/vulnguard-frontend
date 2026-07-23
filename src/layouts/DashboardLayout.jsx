import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Avatar, Dropdown, Breadcrumb, Space, Input, Badge, Tooltip, Popconfirm, Drawer, List, Tag } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  ApartmentOutlined,
  UserSwitchOutlined,
  TeamOutlined,
  LaptopOutlined,
  BugOutlined,
  HistoryOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  BellOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  CalendarOutlined,
  AlertOutlined,
  RadarChartOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Header, Sider, Content } = Layout;

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { user, logout, role } = useAuth();
  const [currentTime, setCurrentTime] = useState(dayjs().format("YYYY-MM-DD HH:mm:ss"));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleUserMenuClick = (info) => {
    if (info.key === "logout") {
      handleLogout();
    } else if (info.key === "profile") {
      navigate("/profile");
    } else if (info.key === "settings") {
      navigate("/settings");
    }
  };

  const userMenuItems = [
    { key: "profile", icon: <UserOutlined />, label: "Profile Details" },
    { key: "settings", icon: <SettingOutlined />, label: "Settings & Security" },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "Logout", danger: true },
  ];

  const rawMenuItems = [
    { key: "/dashboard", icon: <DashboardOutlined />, label: <Link to="/dashboard">SOC Dashboard</Link>, title: "SOC Dashboard", roles: ["OWNER", "ADMIN", "SECURITY_MANAGER", "SECURITY_ANALYST", "IT_ENGINEER"] },
    { key: "/departments", icon: <ApartmentOutlined />, label: <Link to="/departments">Departments</Link>, title: "Departments Scope", roles: ["OWNER", "ADMIN"] },
    { key: "/admins", icon: <UserSwitchOutlined />, label: <Link to="/admins">Admins</Link>, title: "System Admins", roles: ["OWNER"] },
    { key: "/employees", icon: <TeamOutlined />, label: <Link to="/employees">Employees</Link>, title: "Employee Directory", roles: ["OWNER", "ADMIN"] },
    { key: "/assets", icon: <LaptopOutlined />, label: <Link to="/assets">Assets Inventory</Link>, title: "Assets Inventory", roles: ["OWNER", "ADMIN", "SECURITY_MANAGER", "SECURITY_ANALYST", "IT_ENGINEER"] },
    { key: "/vulnerabilities", icon: <BugOutlined />, label: <Link to="/vulnerabilities">Vulnerabilities</Link>, title: "Vulnerabilities CVE", roles: ["OWNER", "ADMIN", "SECURITY_MANAGER", "SECURITY_ANALYST", "IT_ENGINEER"] },
    { key: "/my-vulnerabilities", icon: <CheckCircleOutlined />, label: <Link to="/my-vulnerabilities">My Assigned CVEs</Link>, title: "My Assigned Vulnerabilities", roles: ["OWNER", "ADMIN", "SECURITY_MANAGER", "SECURITY_ANALYST", "IT_ENGINEER"] },
    { key: "/threat-intel", icon: <RadarChartOutlined />, label: <Link to="/threat-intel">Threat Intel</Link>, title: "Threat Intelligence CVE", roles: ["OWNER", "ADMIN", "SECURITY_MANAGER", "SECURITY_ANALYST", "IT_ENGINEER"] },
    { key: "/audit-logs", icon: <HistoryOutlined />, label: <Link to="/audit-logs">Audit Trail</Link>, title: "Audit Trail Ledger", roles: ["OWNER", "ADMIN"] },
    { key: "/reports", icon: <FileTextOutlined />, label: <Link to="/reports">Compliance Reports</Link>, title: "Compliance Reports", roles: ["OWNER", "ADMIN", "SECURITY_MANAGER"] },
    { key: "/profile", icon: <UserOutlined />, label: <Link to="/profile">Profile</Link>, title: "User Profile", roles: ["OWNER", "ADMIN", "SECURITY_MANAGER", "SECURITY_ANALYST", "IT_ENGINEER"] },
  ];

  const filteredMenuItems = rawMenuItems
    .filter((item) => role && item.roles.includes(role))
    .filter((item) => item.title.toLowerCase().includes(menuSearch.toLowerCase()));

  const pathSnippets = location.pathname.split("/").filter((i) => i);
  const breadcrumbItems = [
    { title: <Link to="/dashboard">SOC Command</Link>, key: "home" },
    ...pathSnippets.map((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      const name = snippet.charAt(0).toUpperCase() + snippet.slice(1).replace("-", " ");
      return { title: <Link to={url}>{name}</Link>, key: url };
    }),
  ];

  const getRoleBadgeClass = (r) => {
    switch (r) {
      case "OWNER": return "badge-critical";
      case "ADMIN": return "badge-high";
      case "SECURITY_MANAGER": return "badge-medium";
      case "SECURITY_ANALYST": return "badge-active";
      default: return "badge-safe";
    }
  };

  const securityAlerts = [
    { id: 1, title: "Critical CVE-2024-3094 Detected", type: "CRITICAL", time: "10 mins ago", detail: "XZ Utils backdoor found on AWS K8s Node Group." },
    { id: 2, title: "Unusual SSH Authentication", type: "HIGH", time: "35 mins ago", detail: "Multiple failed root logins on Secondary DC." },
    { id: 3, title: "Audit Trail Backup Complete", type: "SAFE", time: "2 hours ago", detail: "Compliance ledger backed up to encrypted storage." },
    { id: 4, title: "New NGFW Asset Registered", type: "SAFE", time: "4 hours ago", detail: "Palo Alto NGFW Gateway added by Admin." },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: isDarkMode ? "#080C14" : "#F8FAFC" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        style={{
          zIndex: 10,
          position: "sticky",
          top: 0,
          height: "100vh",
          background: isDarkMode ? "#0B1120" : "#FFFFFF",
          borderRight: `1px solid ${isDarkMode ? "rgba(30, 58, 138, 0.4)" : "#E2E8F0"}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              padding: "0 20px",
              borderBottom: `1px solid ${isDarkMode ? "rgba(30, 58, 138, 0.4)" : "#F1F5F9"}`,
              background: isDarkMode ? "#080C14" : "#FFFFFF",
            }}
          >
            <SafetyCertificateOutlined style={{ fontSize: 26, color: "#06B6D4", marginRight: collapsed ? 0 : 10, filter: "drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))" }} />
            {!collapsed && (
              <span
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: isDarkMode ? "#FFFFFF" : "#0F172A",
                  letterSpacing: "0.5px",
                  background: isDarkMode ? "linear-gradient(135deg, #FFFFFF 0%, #06B6D4 100%)" : "none",
                  WebkitBackgroundClip: isDarkMode ? "text" : "none",
                  WebkitTextFillColor: isDarkMode ? "transparent" : "inherit",
                }}
              >
                VulnGuard <span style={{ fontSize: 10, color: "#06B6D4", fontWeight: 700, textTransform: "uppercase" }}>SOC</span>
              </span>
            )}
          </div>

          {!collapsed && (
            <div style={{ padding: "14px 14px 4px 14px" }}>
              <Input
                placeholder="Search SOC tools..."
                prefix={<SearchOutlined style={{ color: isDarkMode ? "#06B6D4" : "#94A3B8" }} />}
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                style={{
                  borderRadius: 8,
                  background: isDarkMode ? "rgba(15, 23, 42, 0.8)" : "#F8FAFC",
                  border: `1px solid ${isDarkMode ? "rgba(30, 58, 138, 0.5)" : "#E2E8F0"}`,
                  color: isDarkMode ? "#F8FAFC" : "#0F172A",
                }}
                allowClear
              />
            </div>
          )}

          <Menu
            theme={isDarkMode ? "dark" : "light"}
            mode="inline"
            selectedKeys={[location.pathname]}
            items={filteredMenuItems}
            style={{
              borderRight: 0,
              paddingTop: 8,
              background: "transparent",
            }}
          />
        </div>

        <div style={{ padding: "16px", borderTop: `1px solid ${isDarkMode ? "rgba(30, 58, 138, 0.4)" : "#E2E8F0"}` }}>
          <Popconfirm
            title="Log out of SOC session?"
            description="Are you sure you want to end your current session?"
            onConfirm={handleLogout}
            okText="Logout"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<LogoutOutlined />}
              block={!collapsed}
              style={{
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                fontWeight: 600,
              }}
            >
              {!collapsed && "Logout Session"}
            </Button>
          </Popconfirm>
        </div>
      </Sider>

      <Layout style={{ background: "transparent" }}>
        {["AUDITOR", "SUPPORT", "READ_ONLY", "SECURITY_MANAGER"].includes(role) && (
          <div
            style={{
              background: "linear-gradient(90deg, #1E293B 0%, #0F172A 100%)",
              borderBottom: "1px solid rgba(245, 158, 11, 0.4)",
              padding: "6px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "#FDE68A",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.4px",
              zIndex: 100,
            }}
          >
            <LockOutlined style={{ color: "#F59E0B", fontSize: 14 }} />
            <span>Viewing in Read-Only Mode (Auditor Level Access). Administrative mutation actions are restricted.</span>
          </div>
        )}
        <Header
          style={{
            background: isDarkMode ? "rgba(15, 23, 42, 0.85)" : "#FFFFFF",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.5)" : "0 2px 8px rgba(0,0,0,0.02)",
            position: "sticky",
            top: 0,
            zIndex: 9,
            height: 64,
            borderBottom: `1px solid ${isDarkMode ? "rgba(30, 58, 138, 0.4)" : "#E2E8F0"}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 40, height: 40, color: isDarkMode ? "#06B6D4" : "#0F172A" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: isDarkMode ? "#94A3B8" : "#64748B", fontSize: 13, fontWeight: 500 }}>
              <CalendarOutlined style={{ color: "#06B6D4" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{currentTime} UTC</span>
            </div>
            {isDarkMode && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Tag color="processing" style={{ borderRadius: 99, padding: "2px 10px", background: "rgba(6, 182, 212, 0.15)", border: "1px solid rgba(6, 182, 212, 0.4)", color: "#06B6D4", fontWeight: 700 }}>
                  <RadarChartOutlined spin style={{ marginRight: 4 }} /> TELEMETRY ONLINE
                </Tag>
                <Tag color="error" style={{ borderRadius: 99, padding: "2px 10px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#EF4444", fontWeight: 700 }}>
                  PRODUCTION
                </Tag>
              </div>
            )}
          </div>

          <Space size="middle" align="center">
            <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to SOC Dark Mode"}>
              <Button
                type="text"
                shape="circle"
                icon={isDarkMode ? <SunOutlined style={{ color: "#F59E0B" }} /> : <MoonOutlined style={{ color: "#64748B" }} />}
                onClick={toggleTheme}
                style={{ fontSize: 18, width: 40, height: 40 }}
              />
            </Tooltip>

            <Badge count={2} offset={[-2, 2]}>
              <Tooltip title="Security Operations Center Alerts">
                <Button
                  type="text"
                  shape="circle"
                  icon={<BellOutlined style={{ color: isDarkMode ? "#06B6D4" : "#64748B", fontSize: 18 }} />}
                  onClick={() => setIsNotifOpen(true)}
                  style={{ width: 40, height: 40 }}
                />
              </Tooltip>
            </Badge>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 600, color: isDarkMode ? "#FFFFFF" : "#0F172A", fontSize: 14 }}>
                {user?.first_name || user?.username || "SOC User"} {user?.last_name || ""}
              </div>
              <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", alignItems: "center", marginTop: 2 }}>
                <span className={getRoleBadgeClass(role)}>
                  {role}
                </span>
                {user?.designation && (
                  <span style={{ fontSize: 11, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
                    {user.designation}
                  </span>
                )}
              </div>
            </div>

            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight" trigger={["click"]}>
              <Avatar
                style={{
                  backgroundColor: "#06B6D4",
                  cursor: "pointer",
                  boxShadow: "0 0 12px rgba(6, 182, 212, 0.5)",
                  fontWeight: 700,
                  color: "#080C14",
                }}
                icon={<UserOutlined />}
              >
                {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
              </Avatar>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ margin: "24px 24px 0", overflow: "initial" }}>
          <div style={{ marginBottom: 16 }}>
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ minHeight: "calc(100vh - 170px)" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>

          <footer
            style={{
              textAlign: "center",
              padding: "24px 0 16px 0",
              color: isDarkMode ? "#64748B" : "#94A3B8",
              fontSize: 12,
            }}
          >
            VulnGuard SOC Command Center © 2026. Enterprise Cybersecurity Platform. All Rights Reserved.
          </footer>
        </Content>
      </Layout>

      <Drawer
        title={
          <Space>
            <AlertOutlined style={{ color: "#EF4444" }} />
            <span style={{ color: "#06B6D4", fontWeight: 700 }}>SOC Security Telemetry Log</span>
          </Space>
        }
        placement="right"
        onClose={() => setIsNotifOpen(false)}
        open={isNotifOpen}
        width={380}
      >
        <List
          itemLayout="vertical"
          dataSource={securityAlerts}
          renderItem={(item) => (
            <List.Item key={item.id} style={{ padding: "12px 0", borderBottom: `1px solid ${isDarkMode ? "rgba(30, 58, 138, 0.4)" : "#F1F5F9"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span className={item.type === "CRITICAL" ? "badge-critical" : item.type === "HIGH" ? "badge-high" : "badge-safe"}>
                  {item.type}
                </span>
                <span style={{ fontSize: 11, color: isDarkMode ? "#64748B" : "#94A3B8" }}>{item.time}</span>
              </div>
              <div style={{ fontWeight: 600, color: isDarkMode ? "#F8FAFC" : "#0F172A", fontSize: 13, marginBottom: 2, marginTop: 4 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 12, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
                {item.detail}
              </div>
            </List.Item>
          )}
        />
      </Drawer>
    </Layout>
  );
};

export default DashboardLayout;
