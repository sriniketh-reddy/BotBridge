import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import NavBar from "./components/NavBar";
import LoginPage from "./components/LoginPage";
import RegistrationPage from "./components/RegistrationPage";
import ChatInterface from "./components/ChatInterface";
import ServerManagement from "./components/ServerManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./components/NotFound";
const DebugFirebase = import.meta.env.DEV ? React.lazy(() => import('./components/DebugFirebase')) : null;

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/chat" element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
          <Route path="/servers" element={<ProtectedRoute><ServerManagement /></ProtectedRoute>} />
          {import.meta.env.DEV && DebugFirebase && <Route path="/debug" element={<Suspense fallback={<div>Loading...</div>}><DebugFirebase /></Suspense>} />}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
