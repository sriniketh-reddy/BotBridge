import React, { useState } from "react";
import axios from "axios";
import { useToast } from "../common/ToastContext";

interface AddServerFormProps {
  onAdded?: () => void;
}

const AddServerForm: React.FC<AddServerFormProps> = ({ onAdded }) => {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  const handleAdd = async () => {
    if (!url) return setError("Please enter a URL");
    if (!name) return setError("Please enter a name for the server");

    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("/api/mcp", { name, url, apiKey });
      const added = res.data?.mcp;
      if (onAdded) onAdded();
      const toolCount = added?.tools?.length || 0;
      push({ message: `Server added with ${toolCount} tools`, type: "success" });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || "Failed to add";
      setError(msg);
      push({ message: msg, type: "error" });
    } finally {
      setLoading(false);
      setUrl("");
      setName("");
      setApiKey("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Server Name"
          className="rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="MCP Server URL"
          className="md:col-span-2 rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="flex gap-2">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="API Key"
          className="flex-1 rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium"
        >
          {loading ? "Adding..." : "Add Server"}
        </button>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
};

export default AddServerForm;
