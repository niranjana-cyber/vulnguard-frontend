import React, { useState } from "react";
import { Layout, Menu, Button, Avatar, Dropdown, Breadcrumb, Space, Input, Badge, Tooltip, Popconfirm } from "antd";
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
  LockOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  BellOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const { user, logout, role } = useAuth();
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
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile Details",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings & Security",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  const rawMenuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard Console</Link>,
      title: "Dashboard Console",
      roles: ["OWNER", "ADMIN", "SECURITY_MANAGER", "SECURITY_ANALYST", "IT_ENGINEER"],
    },
    {
      key: "/departments",
      icon: <ApartmentOutlined />,
      label: <Link to="/departments">Departments Scope</Link>,
      title: "Departments Scope",
      roles: ["OWNER", "ADMIN"],
    },
    {
      key: "/admins",
      icon: <UserSwitchOutlined />,
      label: <Link to="/admins">System Admins</Link>,
      title: "System Admins CRUD",
      roles: ["OWNER"],
    },
    {
      key: "/employees",
      icon: <TeamOutlined />,
      label: <Link to="/employees">Employee Directory</Link>,
      title: "Employee Directory",
      roles: ["OWNER", "ADMIN"],
    },
    {
      key: "/assets",
      icon: <LaptopOutlined />,
      label: <Link to="/assets">Assets Inventory</Link>,
      title: "Assets Inventory Tracking",
      roles: ["OWNER", "ADMIN", "SECURITY_MANAGER", "SECURITY_ANALYST", "IT_ENGINEER"],
    },
    {
      key: "/vulnerabilities",
      icon: <BugOutlined />,
      label: <Link to="/vulnerabilities">Vulnerabilities CVE</Link>,
      title: "Vulnerabilities CVE",
      roles: ["OWNER", "ADMIN", "SECURITY_MANAGER", "SECURITY_ANALYST", "IT_ENGINEER"],
    },
    {
      key: "/audit-logs",
      icon: <HistoryOutlined />,
      label: <Link to="/audit-logs">Audit Log Trails</Link>,
      title: "Audit Log Trails Ledger",
      roles: ["OWNER", "ADMIN"],
    },
    {
      key: "/reports",
      icon: <FileTextOutlined />,
      label: <Link to="/reports">Compliance Reports</Link>,
      title: "Compliance Reports Export",
      roles: ["OWNER", "ADMIN", "SECURITY_MANAGER"],
    },
    {
      key: "/profile",
      icon: <UserOutlined />,
      label: <Link to="/profile">User Profile</Link>,
      title: "User Profile Settings",
      roles: ["OWNER", "ADMIN", "SECURITY_MANAGER", "SECURITY_ANALYST", "IT_ENGINEER"],
    },
  ];

  // Filter items by current user role & menu search input
  const filteredMenuItems = rawMenuItems
    .filter((item) => role && item.roles.includes(role))
    .filter((item) => item.title.toLowerCase().includes(menuSearch.toLowerCase()));

  // Dynamic breadcrumbs based on pathname
  const pathSnippets = location.pathname.split("/").filter((i) => i);
  const breadcrumbItems = [
    {
      title: <Link to="/dashboard">Home</Link>,
      key: "home",
    },
    ...pathSnippets.map((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      const name = snippet.charAt(0).toUpperCase() + snippet.slice(1).replace("-", " ");
      return {
        title: <Link to={url}>{name}</Link>,
        key: url,
      };
    }),
  ];

  const getRoleBadgeColor = (r) => {
    switch (r) {
      case "OWNER":
        return "#EF4444";
      case "ADMIN":
        return "#3B82F6";
      case "SECURITY_MANAGER":
        return "#8B5CF6";
      case "SECURITY_ANALYST":
        return "#14B8A6";
      case "IT_ENGINEER":
        return "#F59E0B";
      default:
        return "#64748B";
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: isDarkMode ? "#0F172A" : "#F8FAFC" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={270}
        style={{
          boxShadow: isDarkMode ? "2px 0 10px rgba(0, 0, 0, 0.4)" : "2px 0 10px rgba(0, 0, 0, 0.02)",
          zIndex: 10,
          position: "sticky",
          top: 0,
          height: "100vh",
          background: isDarkMode ? "#1E293B" : "#FFFFFF",
          borderRight: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
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
              padding: "0 24px",
              borderBottom: `1px solid ${isDarkMode ? "#334155" : "#F1F5F9"}`,
              background: isDarkMode ? "#1E293B" : "#F8FAFC",
            }}
          >
            <SafetyCertificateOutlined style={{ fontSize: 26, color: isDarkMode ? "#3B82F6" : "#2563EB", marginRight: collapsed ? 0 : 10 }} />
            {!collapsed && (
              <span
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: isDarkMode ? "#FFFFFF" : "#0F172A",
                  letterSpacing: "0.5px",
                }}
              >
                VulnGuard
              </span>
            )}
          </div>

          {/* Sidebar Search Bar */}
          {!collapsed && (
            <div style={{ padding: "16px 16px 8px 16px" }}>
              <Input
                placeholder="Search menus..."
                prefix={<SearchOutlined style={{ color: isDarkMode ? "#64748B" : "#94A3B8" }} />}
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                style={{
                  borderRadius: 8,
                  background: isDarkMode ? "#0F172A" : "#F8FAFC",
                  border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
                  color: isDarkMode ? "#F1F5F9" : "#0F172A",
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

        {/* Sidebar Footer Logout Option */}
        <div style={{ padding: "16px", borderTop: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}` }}>
          <Popconfirm
            title="Log out of session?"
            description="Are you sure you want to end your session?"
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
        <Header
          style={{
            background: isDarkMode ? "#1E293B" : "#FFFFFF",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            position: "sticky",
            top: 0,
            zIndex: 9,
            height: 64,
            borderBottom: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 44, height: 44, color: isDarkMode ? "#F1F5F9" : "#0F172A" }}
            />
          </div>

          <Space size="middle" align="center">
            {/* Theme Toggle Button */}
            <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <Button
                type="text"
                shape="circle"
                icon={isDarkMode ? <SunOutlined style={{ color: "#F59E0B" }} /> : <MoonOutlined style={{ color: "#64748B" }} />}
                onClick={toggleTheme}
                style={{ fontSize: 18, width: 40, height: 40 }}
              />
            </Tooltip>

            {/* Notifications Indicator */}
            <Badge dot color="#EF4444">
              <Button
                type="text"
                shape="circle"
                icon={<BellOutlined style={{ color: isDarkMode ? "#94A3B8" : "#64748B" }} />}
                style={{ fontSize: 18, width: 40, height: 40 }}
              />
            </Badge>

            {/* User Details */}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 600, color: isDarkMode ? "#FFFFFF" : "#0F172A", fontSize: 14 }}>
                {user?.first_name || user?.username || "Authenticated User"} {user?.last_name || ""}
              </div>
              <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", alignItems: "center" }}>
                <span
                  style={{
                    fontSize: 10,
                    padding: "1px 8px",
                    borderRadius: 12,
                    background: getRoleBadgeColor(role),
                    color: "#FFFFFF",
                    fontWeight: 700,
                  }}
                >
                  {role}
                </span>
                {user?.designation && (
                  <span style={{ fontSize: 11, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
                    {user.designation}
                  </span>
                )}
              </div>
            </div>

            {/* Profile Dropdown */}
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight" trigger={["click"]}>
              <Avatar
                style={{
                  backgroundColor: isDarkMode ? "#3B82F6" : "#2563EB",
                  cursor: "pointer",
                  boxShadow: "0 4px 10px rgba(37, 99, 235, 0.2)",
                  fontWeight: 600,
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              style={{ minHeight: "calc(100vh - 170px)" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <footer
            style={{
              textAlign: "center",
              padding: "24px 0 12px 0",
              color: isDarkMode ? "#64748B" : "#94A3B8",
              fontSize: 12,
            }}
          >
            VulnGuard © 2026. Enterprise Cybersecurity Platform. All Rights Reserved.
          </footer>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
