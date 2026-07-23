import React from "react";
import { Result, Button, Card } from "antd";
import { AlertOutlined, ReloadOutlined } from "@ant-design/icons";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("VulnGuard UI Error Boundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#0F172A",
            padding: "24px",
          }}
        >
          <Card
            bordered={false}
            style={{
              maxWidth: 600,
              width: "100%",
              background: "#1E293B",
              border: "1px solid #334155",
              borderRadius: 20,
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
              textAlign: "center",
            }}
          >
            <Result
              status="error"
              icon={<AlertOutlined style={{ color: "#EF4444", fontSize: 48 }} />}
              title={<span style={{ color: "#F1F5F9", fontWeight: 800, fontSize: 22 }}>Interface Render Error</span>}
              subTitle={
                <span style={{ color: "#94A3B8", fontSize: 14 }}>
                  An unexpected UI error occurred while rendering this page. The system has prevented a full crash.
                </span>
              }
              extra={[
                <Button
                  key="reload"
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={this.handleReload}
                  style={{
                    background: "linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 700,
                    height: 42,
                    padding: "0 24px",
                  }}
                >
                  Reload Command Center
                </Button>,
              ]}
            >
              {this.state.error && (
                <div
                  style={{
                    background: "#0F172A",
                    padding: "12px",
                    borderRadius: 8,
                    color: "#F87171",
                    fontFamily: "monospace",
                    fontSize: 12,
                    textAlign: "left",
                    marginTop: 16,
                    maxHeight: 120,
                    overflowY: "auto",
                  }}
                >
                  {this.state.error.toString()}
                </div>
              )}
            </Result>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
