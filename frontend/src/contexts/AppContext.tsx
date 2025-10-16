// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState } from "react";

interface AppContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const toggleTheme = () => setTheme(prev => (prev === "light" ? "dark" : "light"));

  return <AppContext.Provider value={{ theme, toggleTheme }}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext)!;
