import React, { useState } from "react";
import axios from 'axios';
import { useToast } from '../common/ToastContext';

const AddServerForm: React.FC<{ onAdded?: () => void }> = ({ onAdded }) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { push } = useToast();

  const handleAdd = async () => {
    if (!url) return setError('Please enter a URL');
    setLoading(true);
    setError(null);
    try {
      await axios.post('/api/mcp', { url });
      setUrl("");
      if (onAdded) onAdded();
      push({ message: 'Server added', type: 'success' });
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to add');
      push({ message: 'Failed to add server', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter MCP Server URL"
        className="flex-1 rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button onClick={handleAdd} disabled={loading} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
        {loading ? 'Adding...' : 'Add'}
      </button>
      {error && <div className="w-full text-sm text-red-600 mt-2">{error}</div>}
    </div>
  );
};

export default AddServerForm;
