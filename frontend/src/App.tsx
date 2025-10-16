import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import NavBar from "./components/NavBar";
import LoginPage from "./components/LoginPage";
import RegistrationPage from "./components/RegistrationPage";
import ChatInterface from "./components/ChatInterface";
import ServerManagement from "./components/ServerManagement";
import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/chat" element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
          <Route path="/servers" element={<ProtectedRoute><ServerManagement /></ProtectedRoute>} />
        </Routes>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
