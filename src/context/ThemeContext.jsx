import React, { createContext, useState, useEffect, useContext } from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("isDarkMode");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("isDarkMode", isDarkMode);
    // Apply body-level background color overrides for perfect dark/light mode surface painting
    if (isDarkMode) {
      document.body.style.backgroundColor = "#0B1120"; // premium cybersecurity dark
    } else {
      document.body.style.backgroundColor = "#F8FAFC"; // light slate gray
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
