import React, { useEffect, useState } from "react";
import AddServerForm from "../AddServerForm";
import axios from "axios";
import Modal from "../common/Modal";
import { useToast } from "../common/ToastContext";

const ServerManagement: React.FC = () => {
  const [servers, setServers] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string>("");
  const [expandedServerId, setExpandedServerId] = useState<string | null>(null);
  const { push } = useToast();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/mcp");
      console.log("Loaded MCP servers", res.data.servers);
      setServers(res.data.servers || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    setConfirmOpen(false);
    setDeleting(prev => ({ ...prev, [id]: true }));
    setError(null);
    try {
      await axios.delete(`/api/mcp/${id}`);
      setServers(prev => prev.filter(s => s.id !== id));
      push({ message: "Server deleted", type: "success" });
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || "Delete failed");
      push({ message: "Delete failed", type: "error" });
    } finally {
      setDeleting(prev => ({ ...prev, [id]: false }));
    }
  };

  const toggleTools = (id: string) => {
    setExpandedServerId(prev => (prev === id ? null : id));
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="app-container">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">
              MCP Server Management
            </h2>
            <AddServerForm onAdded={load} />
            {loading && <div className="mt-4 text-sm text-slate-500">Loading servers...</div>}
            {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
            <div className="mt-4 space-y-2">
              {servers.map(s => {
                const { id, name, url, tools = [] } = s;
                const isExpanded = expandedServerId === id;
                return (
                  <div key={id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded flex items-center justify-between">
                    <div className="flex-1 truncate">
                      <div className="font-medium">{name}</div>
                      <div className="text-sm text-slate-500">{url}</div>
                    </div>
                    <button
                      onClick={() => toggleTools(id)}
                      className="ml-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded"
                    >
                      {isExpanded ? "Hide Tools" : "Show Tools"}
                    </button>
                    {isExpanded && tools.length > 0 && (
                      <ul className="mt-2 ml-4 list-disc list-inside text-sm text-slate-800 dark:text-slate-200">
                        {tools.map((tool: any, idx: number) => (
                          <li key={idx}>{tool.name || JSON.stringify(tool)}</li>
                        ))}
                      </ul>
                    )}
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        disabled={!!deleting[id]}
                        onClick={() => { setToDelete(id); setConfirmOpen(true); }}
                        className="text-sm inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                      >
                        {deleting[id] ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
              {!loading && servers.length === 0 && (
                <div className="text-sm text-slate-500">No servers yet — add one above.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal open={confirmOpen} title="Confirm delete">
        <div>Are you sure you want to delete this MCP server?</div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setConfirmOpen(false)} className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700">
            Cancel
          </button>
          <button onClick={() => handleDelete(toDelete)} className="px-3 py-1 rounded bg-red-600 text-white">
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ServerManagement;
