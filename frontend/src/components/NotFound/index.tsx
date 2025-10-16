import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="mb-6 text-slate-600 dark:text-slate-300">Page not found</p>
      <Link to="/" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded">Go home</Link>
    </div>
  </div>
);

export default NotFound;
