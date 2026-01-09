import React, { useState } from "react";
import axios from "axios";
import { useToast } from "../common/ToastContext";

interface AddServerFormProps {
  onAdded?: () => void;
}

const AddServerForm: React.FC<AddServerFormProps> = ({ onAdded }) => {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  const handleAdd = async () => {
    if (!url) return setError("Please enter a URL");
    if (!name) return setError("Please enter a name for the server");

    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("/api/mcp", { name, url });
      const added = res.data?.mcp;
      setUrl("");
      setName("");
      if (onAdded) onAdded();
      push({ message: "Server added", type: "success" });
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || "Failed to add");
      push({ message: "Failed to add server", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Server Name"
        className="flex-2 rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter MCP Server URL"
        className="flex-1 rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        onClick={handleAdd}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
      >
        {loading ? "Adding..." : "Add"}
      </button>
      {error && <div className="w-full text-sm text-red-600 mt-2">{error}</div>}
    </div>
  );
};

export default AddServerForm;
