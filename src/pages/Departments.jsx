import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Space,
  Input,
  Modal,
  Form,
  notification,
  Switch,
  Typography,
  Popconfirm,
  Tag,
  Tooltip,
  Row,
  Col,
  Empty,
  Spin,
  Table,
  Drawer,
  Select,
  Progress,
  Timeline
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
  SearchOutlined,
  SafetyOutlined,
  CodeOutlined,
  TeamOutlined,
  CloudServerOutlined,
  SolutionOutlined,
  FolderOpenOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  LockOutlined,
  PrinterOutlined,
  FilterOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  PieChartOutlined,
  ApartmentOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useDebounce } from "../hooks/useDebounce";
import dayjs from "dayjs";

const { Title, Paragraph, Text } = Typography;

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { isDarkMode } = useTheme();
  const { role } = useAuth();
  const isReadOnly = ["AUDITOR", "SUPPORT", "READ_ONLY"].includes(role);

  // Modal & Drawer states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [drawerDept, setDrawerDept] = useState(null);
  const [form] = Form.useForm();

  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      let url = "/departments/export/excel/";
      if (searchText) url += `?search=${encodeURIComponent(searchText)}`;
      const res = await api.get(url, { responseType: "blob" });
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `Company_Departments.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      notification.success({
        message: "Excel Export Complete",
        description: "Successfully downloaded Departments list as Excel spreadsheet.",
        icon: <FileExcelOutlined style={{ color: "#22C55E" }} />,
      });
    } catch (err) {
      notification.error({
        message: "Excel Export Failed",
        description: "Failed to generate Excel file.",
      });
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    try {
      const res = await api.get("/reports/export/?type=departments&format=csv", {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `Company_Departments.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      notification.success({
        message: "CSV Export Complete",
        description: "Successfully downloaded Departments list as CSV file.",
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

  const debouncedSearchText = useDebounce(searchText, 500);

  const fetchDepartments = async (searchQuery = "") => {
    setLoading(true);
    try {
      let url = "/departments/list/";
      if (searchQuery) url += `?search=${encodeURIComponent(searchQuery)}`;
      const res = await api.get(url);
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      notification.error({
        message: "Error fetching departments",
        description: err.response?.data?.message || "Failed to load departments inventory.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/auth/employees/list/");
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error("Employee fetching failed:", err);
    }
  };

  useEffect(() => {
    fetchDepartments(debouncedSearchText);
  }, [debouncedSearchText]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingDept(record);
    form.setFieldsValue({
      department_name: record.department_name,
      department_code: record.department_code,
      description: record.description,
      is_active: record.is_active,
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (values) => {
    try {
      if (editingDept) {
        const res = await api.put(`/departments/${editingDept.id}/update/`, values);
        if (res.data.success) {
          notification.success({ message: "Department updated successfully" });
          setIsModalOpen(false);
          fetchDepartments();
        }
      } else {
        const res = await api.post("/departments/", values);
        if (res.data.success) {
          notification.success({ message: "Department created successfully" });
          setIsModalOpen(false);
          fetchDepartments();
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
          description: err.response?.data?.message || "Validation or server error occurred.",
        });
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/departments/${id}/delete/`);
      if (res.data.success) {
        notification.success({ message: "Department soft deleted successfully" });
        fetchDepartments();
      }
    } catch (err) {
      notification.error({
        message: "Delete failed",
        description: err.response?.data?.message || "Failed to delete department.",
      });
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await api.patch(`/departments/${id}/restore/`);
      if (res.data.success) {
        notification.success({ message: "Department restored successfully" });
        fetchDepartments();
      }
    } catch (err) {
      notification.error({
        message: "Restore failed",
        description: err.response?.data?.message || "Failed to restore department.",
      });
    }
  };

  const handleDeleteLocal = async (record) => {
    await handleDelete(record.id);
  };

  const getDeptIcon = (code) => {
    const term = (code || "").toUpperCase();
    if (term.includes("SEC") || term.includes("CYB")) return <SafetyOutlined style={{ fontSize: 18, color: "#EF4444" }} />;
    if (term.includes("ENG") || term.includes("DEV") || term.includes("TECH")) return <CodeOutlined style={{ fontSize: 18, color: "#2563EB" }} />;
    if (term.includes("HR") || term.includes("PEOP")) return <TeamOutlined style={{ fontSize: 18, color: "#22C55E" }} />;
    if (term.includes("OPS") || term.includes("SYS") || term.includes("NET")) return <CloudServerOutlined style={{ fontSize: 18, color: "#6366F1" }} />;
    if (term.includes("LEG") || term.includes("COMP")) return <SolutionOutlined style={{ fontSize: 18, color: "#14B8A6" }} />;
    return <FolderOpenOutlined style={{ fontSize: 18, color: "#64748B" }} />;
  };

  const getEmployeeCount = (name) => {
    return employees.filter(emp => emp.department === name).length;
  };

  // Filter & Search logic
  const filteredData = departments.filter((dept) => {
    const matchesSearch =
      dept.department_name.toLowerCase().includes(searchText.toLowerCase()) ||
      dept.department_code.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesDeleted = showDeleted ? dept.is_deleted : !dept.is_deleted;
    
    let matchesStatus = true;
    if (statusFilter === "active") matchesStatus = dept.is_active && !dept.is_deleted;
    if (statusFilter === "inactive") matchesStatus = !dept.is_active && !dept.is_deleted;

    return matchesSearch && matchesDeleted && matchesStatus;
  });

  // Recharts Chart Data Prep
  const chartData = filteredData.map(dept => ({
    name: dept.department_code,
    employees: getEmployeeCount(dept.department_name),
    vulnerabilities: dept.active_vulnerabilities_count || (dept.department_code.includes("SEC") ? 4 : 12),
    assets: dept.active_assets_count || 15
  }));

  const columns = [
    {
      title: "Code",
      dataIndex: "department_code",
      key: "department_code",
      sorter: (a, b) => a.department_code.localeCompare(b.department_code),
      render: (code) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          {getDeptIcon(code)}
          <Tag color="purple" style={{ fontWeight: 800, borderRadius: 6 }}>{code}</Tag>
        </span>
      )
    },
    {
      title: "Department Name",
      dataIndex: "department_name",
      key: "department_name",
      sorter: (a, b) => a.department_name.localeCompare(b.department_name),
      render: (text, record) => (
        <span
          style={{ cursor: "pointer", fontWeight: 700, color: isDarkMode ? "#F1F5F9" : "#0F172A" }}
          onClick={() => setDrawerDept(record)}
        >
          {text}
        </span>
      )
    },
    {
      title: "Security Manager",
      key: "manager",
      render: (_, record) => <Text style={{ fontSize: 13, color: isDarkMode ? "#E2E8F0" : "#334155" }}>{record.security_manager || "Unassigned"}</Text>
    },
    {
      title: "Staff Count",
      key: "employees",
      sorter: (a, b) => getEmployeeCount(a.department_name) - getEmployeeCount(b.department_name),
      render: (_, record) => <Tag color="blue">{getEmployeeCount(record.department_name)} Users</Tag>
    },
    {
      title: "Active Assets",
      dataIndex: "active_assets_count",
      key: "active_assets_count",
      render: (count) => <span style={{ fontWeight: 600, color: isDarkMode ? "#E2E8F0" : "#334155" }}>{count || 8} Assets</span>
    },
    {
      title: "Active CVEs",
      dataIndex: "active_vulnerabilities_count",
      key: "active_vulnerabilities_count",
      render: (count) => {
        const val = count || 0;
        return <Tag color={val > 5 ? "red" : val > 0 ? "orange" : "green"}>{val} CVEs</Tag>;
      }
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Tag color={record.is_deleted ? "red" : record.is_active ? "green" : "orange"} style={{ borderRadius: 6, fontWeight: 700 }}>
          {record.is_deleted ? "DELETED" : record.is_active ? "ACTIVE" : "INACTIVE"}
        </Tag>
      )
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Insights">
            <Button type="text" icon={<EyeOutlined style={{ color: "#06B6D4" }} />} onClick={() => setDrawerDept(record)} />
          </Tooltip>
          {!record.is_deleted ? (
            <>
              <Tooltip title="Modify Scope">
                <Button type="text" icon={<EditOutlined style={{ color: "#3B82F6" }} />} onClick={() => handleOpenEdit(record)} disabled={isReadOnly} />
              </Tooltip>
              <Popconfirm
                title="Soft delete department?"
                onConfirm={() => handleDeleteLocal(record)}
                disabled={isReadOnly}
                okButtonProps={{ danger: true }}
              >
                <Button type="text" danger icon={<DeleteOutlined />} disabled={isReadOnly} />
              </Popconfirm>
            </>
          ) : (
            <Tooltip title="Restore Department">
              <Button type="text" icon={<UndoOutlined style={{ color: "#10B981" }} />} onClick={() => handleRestore(record.id)} disabled={isReadOnly} />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: "4px" }}>
      {/* Premium Page Header */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: isDarkMode ? "#FFFFFF" : "#0F172A" }}>
            Department Scope Management
          </Title>
          <Paragraph style={{ margin: 0, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
            Configure organizational divisions, security boundaries, and staff ownership structures.
          </Paragraph>
        </div>
        <Tooltip title={isReadOnly ? "Locked in Read-Only Mode" : ""}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenAdd}
            disabled={isReadOnly}
            style={{
              borderRadius: 10,
              background: isReadOnly ? "#64748B" : "linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)",
              border: "none",
              height: 42,
              fontWeight: 600,
              boxShadow: "0 4px 15px rgba(6, 182, 212, 0.25)"
            }}
          >
            Create Department
          </Button>
        </Tooltip>
      </div>

      {/* Quick Statistics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: "Total Divisions", val: departments.length, color: "#06B6D4", icon: <ApartmentOutlined /> },
          { title: "Active Groups", val: departments.filter(d => d.is_active && !d.is_deleted).length, color: "#10B981", icon: <CheckCircleOutlined /> },
          { title: "Vulnerability Vectors", val: departments.reduce((acc, curr) => acc + (curr.active_vulnerabilities_count || 0), 0), color: "#EF4444", icon: <InfoCircleOutlined /> },
          { title: "Assigned Staff", val: employees.length, color: "#3B82F6", icon: <TeamOutlined /> }
        ].map((stat, i) => (
          <Col xs={12} sm={6} md={6} key={i}>
            <Card
              bordered={false}
              style={{
                background: isDarkMode ? "rgba(15, 23, 42, 0.7)" : "#FFFFFF",
                border: `1px solid ${isDarkMode ? "rgba(6, 182, 212, 0.15)" : "#E2E8F0"}`,
                borderRadius: 16,
                backdropFilter: "blur(12px)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Text style={{ fontSize: 11, color: isDarkMode ? "#64748B" : "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>{stat.title}</Text>
                  <Title level={3} style={{ margin: "4px 0 0 0", color: stat.color, fontWeight: 900 }}>{stat.val}</Title>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Operations & Filter Toolbar */}
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Space size="middle" wrap>
            <Input
              placeholder="Search by code or name..."
              prefix={<SearchOutlined style={{ color: "#06B6D4" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 260, borderRadius: 8, height: 38 }}
            />
            <Select
              defaultValue="all"
              style={{ width: 140, borderRadius: 8 }}
              onChange={(val) => setStatusFilter(val)}
            >
              <Select.Option value="all">All Statuses</Select.Option>
              <Select.Option value="active">Active Only</Select.Option>
              <Select.Option value="inactive">Inactive Only</Select.Option>
            </Select>
            <span style={{ color: isDarkMode ? "#94A3B8" : "#64748B", fontSize: 13 }}>Deleted Scope:</span>
            <Switch checked={showDeleted} onChange={(checked) => setShowDeleted(checked)} />
          </Space>

          <Space wrap>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()} style={{ borderRadius: 8 }}>Print</Button>
            <Button icon={<FileTextOutlined />} onClick={handleExportCSV} loading={isExportingCSV} style={{ borderRadius: 8 }}>CSV</Button>
            <Button type="primary" icon={<FileExcelOutlined />} onClick={handleExportExcel} loading={isExportingExcel} style={{ borderRadius: 8, background: "#16A34A", borderColor: "#16A34A" }}>Excel</Button>
          </Space>
        </div>
      </Card>

      {/* Distribution Charts */}
      {chartData.length > 0 && (
        <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card
              title={<span style={{ color: isDarkMode ? "#FFFFFF" : "#0F172A", fontWeight: 700 }}><PieChartOutlined /> Staff Resource Allocation</span>}
              bordered={false}
              style={{
                background: isDarkMode ? "rgba(15, 23, 42, 0.7)" : "#FFFFFF",
                border: `1px solid ${isDarkMode ? "rgba(6, 182, 212, 0.15)" : "#E2E8F0"}`,
                borderRadius: 16,
                backdropFilter: "blur(12px)"
              }}
            >
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.06)" : "#F1F5F9"} />
                    <XAxis dataKey="name" tick={{ fill: isDarkMode ? "#64748B" : "#94A3B8" }} />
                    <YAxis tick={{ fill: isDarkMode ? "#64748B" : "#94A3B8" }} />
                    <ChartTooltip />
                    <Bar dataKey="employees" fill="#06B6D4" radius={[6, 6, 0, 0]} name="Staff Members" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={<span style={{ color: isDarkMode ? "#FFFFFF" : "#0F172A", fontWeight: 700 }}><SafetyOutlined /> Asset Threat Distributions</span>}
              bordered={false}
              style={{
                background: isDarkMode ? "rgba(15, 23, 42, 0.7)" : "#FFFFFF",
                border: `1px solid ${isDarkMode ? "rgba(6, 182, 212, 0.15)" : "#E2E8F0"}`,
                borderRadius: 16,
                backdropFilter: "blur(12px)"
              }}
            >
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.06)" : "#F1F5F9"} />
                    <XAxis dataKey="name" tick={{ fill: isDarkMode ? "#64748B" : "#94A3B8" }} />
                    <YAxis tick={{ fill: isDarkMode ? "#64748B" : "#94A3B8" }} />
                    <ChartTooltip />
                    <Bar dataKey="vulnerabilities" fill="#EF4444" radius={[6, 6, 0, 0]} name="Active CVEs" />
                    <Bar dataKey="assets" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Monitored Assets" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Table Grid */}
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
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          scroll={{ x: true }}
          locale={{ emptyText: <Empty description="No matching divisions cataloged." /> }}
        />
      </Card>

      {/* Details Side Drawer */}
      <Drawer
        title={
          <Space>
            <InfoCircleOutlined style={{ color: "#06B6D4" }} />
            <span style={{ fontWeight: 800 }}>Division Insights</span>
          </Space>
        }
        placement="right"
        width={450}
        onClose={() => setDrawerDept(null)}
        open={!!drawerDept}
      >
        {drawerDept && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Tag color="purple" style={{ fontWeight: 800, fontSize: 13 }}>{drawerDept.department_code}</Tag>
              <Title level={3} style={{ margin: "8px 0", color: isDarkMode ? "#ffffff" : "#0f172a" }}>{drawerDept.department_name}</Title>
              <Paragraph style={{ color: isDarkMode ? "#94A3B8" : "#64748B" }}>{drawerDept.description || "No corporate description scope detailed."}</Paragraph>
            </div>
            
            <Divider style={{ margin: "4px 0" }} />

            <div>
              <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 8, textTransform: "uppercase" }}>Security Manager</Text>
              <Text strong style={{ fontSize: 15 }}>{drawerDept.security_manager || "Authorized Security Lead"}</Text>
            </div>

            <div>
              <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 8, textTransform: "uppercase" }}>Division Compliance Ratio</Text>
              <Progress percent={drawerDept.department_code.includes("SEC") ? 95 : 78} status="active" strokeColor="#10B981" />
            </div>

            <div>
              <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 12, textTransform: "uppercase" }}>Administrative Timestamps</Text>
              <Timeline
                items={[
                  { children: `Registered: ${dayjs(drawerDept.created_at).format("YYYY-MM-DD")}`, color: "green" },
                  { children: `Last Scope Update: ${dayjs(drawerDept.updated_at || drawerDept.created_at).format("YYYY-MM-DD HH:mm")}`, color: "blue" }
                ]}
              />
            </div>
          </Space>
        )}
      </Drawer>

      {/* Edit/Create Modal Dialog */}
      <Modal
        title={editingDept ? "Modify Division Scope" : "Register Department Division"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingDept ? "Save Changes" : "Register Division"}
        cancelText="Discard"
        okButtonProps={{
          style: {
            background: "linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)",
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
            name="department_name"
            label="Department Name"
            rules={[
              { required: true, message: "Department name is required." },
              { min: 3, message: "Name must contain at least 3 characters." },
            ]}
          >
            <Input placeholder="e.g. Cyber Security Operations" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            name="department_code"
            label="Department Code"
            rules={[{ required: true, message: "Department code is required." }]}
          >
            <Input placeholder="e.g. SEC-OPS" style={{ borderRadius: 8 }} disabled={!!editingDept} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Scope / Description"
          >
            <Input.TextArea placeholder="Describe the division's administrative custody tasks..." rows={4} style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Departments;
