// src/components/LoginPage/LoginPage.tsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/chat");
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-6">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-center text-slate-800 dark:text-slate-100">Welcome back</h2>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
          <input aria-label="email" type="email" placeholder="you@company.com" className="mt-1 mb-3 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setEmail(e.target.value)} />

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
          <input aria-label="password" type="password" placeholder="••••••••" className="mt-1 mb-4 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setPassword(e.target.value)} />

          <button type="submit" disabled={loading} className="w-full inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md">{loading ? 'Signing in...' : 'Sign in'}</button>
          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
