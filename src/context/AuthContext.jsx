import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(localStorage.getItem("userRole") || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("accessToken"));
  const [loading, setLoading] = useState(true);

  // Fetch profile to verify session on load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const storedRole = localStorage.getItem("userRole");
      if (token) {
        setIsAuthenticated(true);
        if (storedRole) setRole(storedRole);
        try {
          const res = await api.get("/auth/profile/");
          if (res.data.success && res.data.data) {
            setUser(res.data.data);
            setRole(res.data.data.role);
            localStorage.setItem("userRole", res.data.data.role);
          }
        } catch (error) {
          console.warn("Auth profile sync note:", error.response?.data?.message || error.message);
          if (error.response?.status === 401) {
            handleLocalPurge();
          }
        }
      } else {
        handleLocalPurge();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLocalPurge = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login/", { username, password });
      if (res.data.success) {
        const { access, refresh, employee } = res.data;
        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);
        if (employee) {
          localStorage.setItem("userRole", employee.role);
          setRole(employee.role);
        }
        setIsAuthenticated(true);
        
      // Fetch detailed profile
      try {
        const profileRes = await api.get("/auth/profile/");
        if (profileRes.data.success) {
          setUser(profileRes.data.data);
          setRole(profileRes.data.data.role);
          localStorage.setItem("userRole", profileRes.data.data.role);
        }
      } catch (pErr) {
        console.warn("Could not fetch profile details immediately:", pErr);
      }
      return { success: true, message: res.data.message };
    }
    return { success: false, message: res.data.message || "Login failed." };
  } catch (err) {
    console.error("Login error:", err);
    const errData = err.response?.data;
    const errMsg =
      errData?.message ||
      errData?.errors?.non_field_errors?.[0] ||
      errData?.errors?.username?.[0] ||
      errData?.errors?.password?.[0] ||
      errData?.detail ||
      "Invalid username/email or password.";
    return { success: false, message: errMsg };
  } finally {
    setLoading(false);
  }
  };

  const logout = async () => {
    setLoading(true);
    const refresh = localStorage.getItem("refreshToken");
    try {
      if (refresh) {
        await api.post("/auth/logout/", { refresh });
      }
    } catch (err) {
      console.error("Backend logout error:", err);
    } finally {
      handleLocalPurge();
      setLoading(false);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const res = await api.post("/auth/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to change password.";
      return { success: false, message: errMsg };
    }
  };

  const hasPermission = (allowedRoles) => {
    return role && allowedRoles.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        loading,
        login,
        logout,
        changePassword,
        hasPermission,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
