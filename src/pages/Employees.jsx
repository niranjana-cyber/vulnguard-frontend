import React, { useState, useEffect } from "react";
import { Table, Button, Card, Space, Input, Modal, Form, notification, Switch, Typography, Popconfirm, Tag, Select, Tooltip, Avatar } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UndoOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, FileExcelOutlined, FileTextOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useDebounce } from "../hooks/useDebounce";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const Employees = () => {
  const { role } = useAuth();
  const { isDarkMode } = useTheme();
  const isReadOnly = ["AUDITOR", "SUPPORT", "READ_ONLY", "SECURITY_MANAGER"].includes(role);

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [form] = Form.useForm();

  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      let url = "/employees/export/excel/";
      if (searchText) {
        url += `?search=${encodeURIComponent(searchText)}`;
      }
      const res = await api.get(url, { responseType: "blob" });
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `Company_Employees_${dayjs().format("YYYY-MM-DD")}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      notification.success({
        message: "Excel Export Complete",
        description: "Successfully downloaded Employees roster as Excel spreadsheet.",
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
      const res = await api.get("/reports/export/?type=employees&format=csv", {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `Company_Employees_${dayjs().format("YYYY-MM-DD")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      notification.success({
        message: "CSV Export Complete",
        description: "Successfully downloaded Employees roster as CSV file.",
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

  const fetchEmployees = async (searchQuery = "") => {
    setLoading(true);
    try {
      let url = "/auth/employees/list/";
      if (searchQuery) url += `?search=${encodeURIComponent(searchQuery)}`;
      const res = await api.get(url);
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      notification.error({
        message: "Error fetching employees",
        description: err.response?.data?.message || "Failed to load employee list.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments/list/");
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load departments:", err);
    }
  };

  useEffect(() => {
    fetchEmployees(debouncedSearchText);
  }, [debouncedSearchText]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenAdd = () => {
    setEditingEmp(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingEmp(record);
    
    // Find department ID based on department name in the dependency list
    const matchedDept = departments.find(d => d.department_name === record.department);
    const departmentValue = matchedDept ? matchedDept.id : record.department;

    form.setFieldsValue({
      first_name: record.first_name,
      last_name: record.last_name,
      email: record.email,
      department: departmentValue,
      role: record.role,
      designation: record.designation,
      phone_number: record.phone_number,
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (values) => {
    try {
      if (editingEmp) {
        const res = await api.put(`/auth/employees/${editingEmp.id}/update/`, values);
        if (res.data.success) {
          notification.success({ message: "Employee details updated" });
          setIsModalOpen(false);
          fetchEmployees();
        }
      } else {
        const res = await api.post("/auth/employees/", values);
        if (res.data.success) {
          notification.success({ message: "Employee registered successfully" });
          setIsModalOpen(false);
          fetchEmployees();
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
          description: err.response?.data?.message || "Verify field requirements or unique ID constraints.",
        });
      }
    }
  };

  const handleToggleStatus = async (record) => {
    try {
      const res = await api.patch(`/auth/employees/${record.id}/status/`);
      if (res.data.success) {
        notification.success({
          message: res.data.message || "Status toggled successfully.",
        });
        fetchEmployees();
      }
    } catch (err) {
      notification.error({
        message: "Failed to change employee status",
        description: err.response?.data?.message || "Toggle operation failed.",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/auth/employees/${id}/delete/`);
      if (res.data.success) {
        notification.success({ message: "Employee soft deleted successfully" });
        fetchEmployees();
      }
    } catch (err) {
      notification.error({
        message: "Delete failed",
        description: err.response?.data?.message || "Failed to delete employee.",
      });
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await api.patch(`/auth/employees/${id}/restore/`);
      if (res.data.success) {
        notification.success({ message: "Employee restored successfully" });
        fetchEmployees();
      }
    } catch (err) {
      notification.error({
        message: "Restore failed",
        description: err.response?.data?.message || "Failed to restore employee.",
      });
    }
  };

  const handleDeleteLocal = async (record) => {
    await handleDelete(record.id);
    setEmployees(prev => 
      prev.map(e => e.id === record.id ? { ...e, is_deleted: true, is_active_employee: false } : e)
    );
  };

  const filteredData = (employees || []).filter((emp) => {
    const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.toLowerCase();
    const search = searchText.toLowerCase();
    const matchesSearch =
      fullName.includes(search) ||
      (emp.username || "").toLowerCase().includes(search) ||
      (emp.employee_id || "").toLowerCase().includes(search) ||
      (emp.designation || "").toLowerCase().includes(search);

    return matchesSearch && (showDeleted ? emp.is_deleted : !emp.is_deleted);
  });

  const getRoleColor = (r) => {
    switch (r) {
      case "SECURITY_MANAGER": return "purple";
      case "SECURITY_ANALYST": return "cyan";
      case "IT_ENGINEER": return "orange";
      default: return "default";
    }
  };

  const getInitials = (first, last) => {
    return `${(first || "").charAt(0)}${(last || "").charAt(0)}`.toUpperCase() || "?";
  };

  const columns = [
    {
      title: "Employee ID",
      dataIndex: "employee_id",
      key: "employee_id",
      render: (text) => <Tag color="blue" style={{ borderRadius: 6, fontWeight: 600 }}>{text}</Tag>,
    },
    {
      title: "Employee Name",
      key: "name",
      render: (_, record) => (
        <Space size="middle">
          <Avatar
            style={{
              backgroundColor: isDarkMode ? "#6366F1" : "#4F46E5",
              verticalAlign: "middle",
              fontWeight: 600,
            }}
          >
            {getInitials(record.first_name, record.last_name)}
          </Avatar>
          <strong style={{ color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>
            {record.first_name} {record.last_name}
          </strong>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color={getRoleColor(role)} style={{ borderRadius: 6, fontWeight: 600 }}>{role.replace("_", " ")}</Tag>,
    },
    {
      title: "Designation",
      dataIndex: "designation",
      key: "designation",
      render: (text) => <span style={{ color: isDarkMode ? "#94A3B8" : "#475569" }}>{text}</span>,
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (text) => <Tag color="purple" style={{ borderRadius: 6, fontWeight: 500 }}>{text || "N/A"}</Tag>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <span style={{ color: isDarkMode ? "#94A3B8" : "#475569" }}>{text}</span>,
    },
    {
      title: "Active Status",
      dataIndex: "is_active_employee",
      key: "is_active",
      render: (isActive, record) => (
        <Space size="middle">
          <Switch
            checked={isActive}
            onChange={() => handleToggleStatus(record)}
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<CloseCircleOutlined />}
            disabled={record.is_deleted}
          />
          <Tag color={record.is_deleted ? "red" : isActive ? "green" : "orange"} style={{ borderRadius: 6, fontWeight: 600 }}>
            {record.is_deleted ? "DELETED" : isActive ? "ACTIVE" : "INACTIVE"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          {!record.is_deleted ? (
            <>
              <Tooltip title="Modify Details">
                <Button
                  type="text"
                  icon={<EditOutlined style={{ color: "#3B82F6" }} />}
                  onClick={() => handleOpenEdit(record)}
                />
              </Tooltip>
              <Tooltip title="Soft Delete">
                <Popconfirm
                  title="Soft delete employee account?"
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
            </>
          ) : (
            <Tooltip title="Restore Employee">
              <Button
                type="text"
                icon={<UndoOutlined style={{ color: "#22C55E" }} />}
                onClick={() => handleRestore(record.id)}
              />
            </Tooltip>
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
              Employee Directory
            </Title>
            <Paragraph style={{ margin: 0, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
              Manage cyber threat response teams and custody engineers.
            </Paragraph>
          </div>
          {!isReadOnly && (
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
              Add Employee
            </Button>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
          <Input
            placeholder="Search by ID, name, email..."
            prefix={loading && searchText ? <Spin size="small" style={{ marginRight: 4 }} /> : <SearchOutlined style={{ color: "#06B6D4" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{
              maxWidth: 320,
              borderRadius: 10,
              height: 40,
              background: isDarkMode ? "#0F172A" : "#FFFFFF",
              border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
            }}
          />
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
            <span style={{ color: isDarkMode ? "#94A3B8" : "#64748B", fontSize: 13, marginLeft: 8 }}>View Deleted:</span>
            <Switch checked={showDeleted} onChange={(checked) => setShowDeleted(checked)} />
          </Space>
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

        <Modal
          title={editingEmp ? "Modify Employee Account" : "Register Security Employee"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={() => form.submit()}
          okText={editingEmp ? "Save Changes" : "Register Employee"}
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
            <Space style={{ display: "flex", width: "100%" }} align="start">
              <Form.Item
                name="first_name"
                label="First Name"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="e.g. Robert" style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item
                name="last_name"
                label="Last Name"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="e.g. Chen" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Space>

            <Space style={{ display: "flex", width: "100%" }} align="start">
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="e.g. rob_sec" style={{ borderRadius: 8 }} disabled={!!editingEmp} />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: "Required" },
                  { type: "email", message: "Enter a valid email address." },
                ]}
                style={{ flex: 1 }}
              >
                <Input placeholder="e.g. rob@company.com" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Space>

            {!editingEmp && (
              <Form.Item
                name="password"
                label="SSO Access Password"
                rules={[
                  { required: true, message: "Required" },
                  { min: 8, message: "Password must be at least 8 characters long." },
                ]}
              >
                <Input.Password placeholder="Enter password" style={{ borderRadius: 8 }} />
              </Form.Item>
            )}

            <Space style={{ display: "flex", width: "100%" }} align="start">
              <Form.Item
                name="employee_id"
                label="Employee ID Code"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="e.g. EMP-99" style={{ borderRadius: 8 }} disabled={!!editingEmp} />
              </Form.Item>

              <Form.Item
                name="department"
                label="Department Unit"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="Select department" style={{ borderRadius: 8 }}>
                  {departments.map((d) => (
                    <Option key={d.id} value={d.id}>{d.department_name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Space>

            <Space style={{ display: "flex", width: "100%" }} align="start">
              <Form.Item
                name="role"
                label="VMS Security Role"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="Select role" style={{ borderRadius: 8 }}>
                  <Option value="SECURITY_MANAGER">Security Manager</Option>
                  <Option value="SECURITY_ANALYST">Security Analyst</Option>
                  <Option value="IT_ENGINEER">IT Engineer</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="designation"
                label="Corporate Rank"
                rules={[{ required: true, message: "Required" }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="e.g. Incident Response Lead" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Space>

            <Form.Item
              name="phone_number"
              label="Contact Phone Number"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="e.g. +14159990000" style={{ borderRadius: 8 }} />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </motion.div>
  );
};

export default Employees;
