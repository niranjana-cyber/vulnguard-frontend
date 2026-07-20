import React, { useState, useEffect } from "react";
import { Button, Card, Space, Input, Modal, Form, notification, Switch, Typography, Popconfirm, Tag, Tooltip, Row, Col, Empty, Spin } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UndoOutlined, SearchOutlined, SafetyOutlined, CodeOutlined, TeamOutlined, CloudServerOutlined, SolutionOutlined, FolderOpenOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

const { Title, Paragraph, Text } = Typography;

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { isDarkMode } = useTheme();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [form] = Form.useForm();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/departments/list/");
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
    fetchDepartments();
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
    setDepartments(prev => 
      prev.map(d => d.id === record.id ? { ...d, is_deleted: true, is_active: false } : d)
    );
  };

  const getDeptIcon = (code) => {
    const term = (code || "").toUpperCase();
    if (term.includes("SEC") || term.includes("CYB")) return <SafetyOutlined style={{ fontSize: 26, color: "#EF4444" }} />;
    if (term.includes("ENG") || term.includes("DEV") || term.includes("TECH")) return <CodeOutlined style={{ fontSize: 26, color: "#2563EB" }} />;
    if (term.includes("HR") || term.includes("PEOP")) return <TeamOutlined style={{ fontSize: 26, color: "#22C55E" }} />;
    if (term.includes("OPS") || term.includes("SYS") || term.includes("NET")) return <CloudServerOutlined style={{ fontSize: 26, color: "#6366F1" }} />;
    if (term.includes("LEG") || term.includes("COMP")) return <SolutionOutlined style={{ fontSize: 26, color: "#14B8A6" }} />;
    return <FolderOpenOutlined style={{ fontSize: 26, color: "#64748B" }} />;
  };

  const getEmployeeCount = (name) => {
    return employees.filter(emp => emp.department === name).length;
  };

  const filteredData = departments.filter((dept) => {
    const matchesSearch =
      dept.department_name.toLowerCase().includes(searchText.toLowerCase()) ||
      dept.department_code.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesSearch && (showDeleted ? dept.is_deleted : !dept.is_deleted);
  });

  return (
    <div style={{ padding: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: isDarkMode ? "#FFFFFF" : "#0F172A" }}>
            Corporate Departments
          </Title>
          <Paragraph style={{ margin: 0, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
            Configure organizational divisions and active staff structures.
          </Paragraph>
        </div>
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
          Create Department
        </Button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <Input
          placeholder="Search by code or name..."
          prefix={<SearchOutlined style={{ color: "#94A3B8" }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            maxWidth: 320,
            borderRadius: 10,
            height: 40,
            background: isDarkMode ? "#1E293B" : "#FFFFFF",
            border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
          }}
        />
        <Space>
          <span style={{ color: isDarkMode ? "#94A3B8" : "#64748B", fontSize: 13 }}>View Soft Deleted:</span>
          <Switch checked={showDeleted} onChange={(checked) => setShowDeleted(checked)} />
        </Space>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "30vh" }}>
          <Spin size="large" />
        </div>
      ) : filteredData.length > 0 ? (
        <Row gutter={[20, 20]}>
          <AnimatePresence>
            {filteredData.map((dept) => {
              const empCount = getEmployeeCount(dept.department_name);

              return (
                <Col xs={24} sm={12} lg={8} key={dept.id}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ y: -6 }}
                  >
                    <Card
                      bordered={false}
                      style={{
                        background: isDarkMode ? "#1E293B" : "#FFFFFF",
                        border: `1px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
                        borderRadius: 20,
                        boxShadow: isDarkMode ? "0 10px 30px rgba(0, 0, 0, 0.2)" : "0 10px 25px rgba(0, 0, 0, 0.015)",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {/* Top bar with icon and code */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 14,
                            background: isDarkMode ? "rgba(59, 130, 246, 0.08)" : "rgba(37, 99, 235, 0.05)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {getDeptIcon(dept.department_code)}
                        </div>
                        <Tag color="purple" style={{ borderRadius: 6, fontWeight: 700, margin: 0, padding: "2px 8px" }}>
                          {dept.department_code}
                        </Tag>
                      </div>

                      {/* Header details */}
                      <Title level={4} style={{ margin: "0 0 8px 0", fontWeight: 700, color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>
                        {dept.department_name}
                      </Title>

                      <Paragraph
                        ellipsis={{ rows: 2 }}
                        style={{
                          color: isDarkMode ? "#94A3B8" : "#64748B",
                          fontSize: 13,
                          minHeight: 40,
                          marginBottom: 16,
                        }}
                      >
                        {dept.description || "No description provided."}
                      </Paragraph>

                      <Row gutter={12} style={{ marginBottom: 20 }}>
                        <Col span={12}>
                          <Text type="secondary" style={{ fontSize: 11, display: "block" }}>STAFF COUNT</Text>
                          <Text strong style={{ fontSize: 16, color: isDarkMode ? "#F1F5F9" : "#0F172A" }}>{empCount} Users</Text>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary" style={{ fontSize: 11, display: "block" }}>STATUS</Text>
                          <Tag
                            color={dept.is_deleted ? "red" : dept.is_active ? "green" : "orange"}
                            style={{ borderRadius: 6, fontWeight: 600, marginTop: 2 }}
                          >
                            {dept.is_deleted ? "DELETED" : dept.is_active ? "ACTIVE" : "INACTIVE"}
                          </Tag>
                        </Col>
                      </Row>

                      {/* Footer Actions */}
                      <div
                        style={{
                          borderTop: `1px solid ${isDarkMode ? "#334155" : "#F1F5F9"}`,
                          paddingTop: 14,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Added {new Date(dept.created_at).toLocaleDateString()}
                        </Text>
                        <Space>
                          {!dept.is_deleted ? (
                            <>
                              <Tooltip title="Modify Department">
                                <Button
                                  type="text"
                                  icon={<EditOutlined style={{ color: "#3B82F6" }} />}
                                  onClick={() => handleOpenEdit(dept)}
                                />
                              </Tooltip>
                              <Tooltip title="Soft Delete">
                                <Popconfirm
                                  title="Soft delete department?"
                                  onConfirm={() => handleDeleteLocal(dept)}
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
                            <Tooltip title="Restore Department">
                              <Button
                                type="text"
                                icon={<UndoOutlined style={{ color: "#22C55E" }} />}
                                onClick={() => handleRestore(dept.id)}
                              />
                            </Tooltip>
                          )}
                        </Space>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              );
            })}
          </AnimatePresence>
        </Row>
      ) : (
        <Empty description="No corporate departments registered." />
      )}

      {/* Create/Edit Modal */}
      <Modal
        title={editingDept ? "Modify Department Scope" : "Register Department Division"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingDept ? "Save Changes" : "Register Division"}
        cancelText="Discard"
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
