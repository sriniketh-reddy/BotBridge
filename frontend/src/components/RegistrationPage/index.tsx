// src/components/RegistrationPage/RegistrationPage.tsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const RegistrationPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(form.email, form.password, form.name);
      navigate("/chat");
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) navigate('/chat');
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-6">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-center text-slate-800 dark:text-slate-100">Create your account</h2>


          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Name</label>
          <input type="text" placeholder="Full name" value={form.name} className="mt-1 mb-3 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
          <input type="email" placeholder="you@company.com" className="mt-1 mb-3 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" onChange={(e) => setForm({ ...form, email: e.target.value })} />

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
          <input type="password" placeholder="Create a password" className="mt-1 mb-4 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2" onChange={(e) => setForm({ ...form, password: e.target.value })} />

          <button type="submit" disabled={loading} className="w-full inline-flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-md">{loading ? 'Registering...' : 'Register'}</button>
          <div className="mt-3 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Sign in</Link>
          </div>
          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
