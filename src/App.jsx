import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import AppRoutes from "./routes/AppRoutes";

const MainApp = () => {
  const { isDarkMode } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: isDarkMode ? "#3B82F6" : "#2563EB", // Primary premium blue
          colorSuccess: "#22C55E", // Success green
          colorWarning: "#F59E0B", // Warning orange
          colorError: "#EF4444", // Danger red
          colorInfo: "#3B82F6", // Info blue
          borderRadius: 14, // SaaS style rounded borders
          fontFamily: "'Outfit', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          colorBgBase: isDarkMode ? "#0F172A" : "#FFFFFF",
          colorBgContainer: isDarkMode ? "#1E293B" : "#FFFFFF",
          colorBorder: isDarkMode ? "#334155" : "#E2E8F0",
          colorTextBase: isDarkMode ? "#F1F5F9" : "#0F172A",
        },
        components: {
          Card: {
            boxShadow: isDarkMode 
              ? "0 4px 20px rgba(0, 0, 0, 0.25)" 
              : "0 8px 30px rgba(0, 0, 0, 0.02)",
            borderRadiusLG: 14,
          },
          Table: {
            borderRadius: 12,
            headerBg: isDarkMode ? "#1E293B" : "#F8FAFC",
            headerColor: isDarkMode ? "#F1F5F9" : "#0F172A",
            rowHoverBg: isDarkMode ? "#334155" : "#F1F5F9",
          },
          Button: {
            controlHeight: 40,
            borderRadius: 8,
            fontWeight: 500,
          },
          Input: {
            controlHeight: 40,
            borderRadius: 8,
          },
          Select: {
            controlHeight: 40,
            borderRadius: 8,
          },
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

export default App;
