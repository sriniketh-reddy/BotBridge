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
  const [showUserManual, setShowUserManual] = useState(false);
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
      <div style={{ maxHeight: "87dvh", height: "87dvh" }} className="overflow-hidden bg-slate-50 dark:bg-slate-900">
        <div className="app-container h-full py-8">
          <div style={{ maxHeight: "80dvh", height: "80dvh" }} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                MCP Server Management
              </h2>
              <button
                onClick={() => setShowUserManual(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                title="View User Manual"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">How to Get MCP Server</span>
                <span className="sm:hidden">Help</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
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
                            <li key={idx} className="mb-1">
                              <span className="font-semibold">{tool.toolname}</span>
                              <span className="text-slate-400 dark:text-slate-500 mx-2">-</span>
                              <span className="text-slate-600 dark:text-slate-300 italic">{tool.description}</span>
                            </li>
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

      {/* User Manual Modal */}
      <Modal open={showUserManual} title="📘 BotBridge User Manual">
        <div className="max-h-[70vh] overflow-y-auto prose prose-sm dark:prose-invert max-w-none">
          <h3 className="text-lg font-bold mt-0">Connecting a Composio Dedicated MCP Server to BotBridge</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This guide explains how to connect a <strong>Dedicated MCP Server (Legacy)</strong> from Composio to BotBridge.
            By the end of this process, you will have a functional bridge between your Composio toolkits and the BotBridge interface.
          </p>

          <hr className="my-4" />

          <h4 className="text-md font-semibold text-green-600 dark:text-green-400">🟢 Prerequisites</h4>
          <ul className="list-disc ml-5 text-sm space-y-1">
            <li><strong>Composio Account:</strong> <a href="https://composio.dev" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://composio.dev</a></li>
            <li><strong>BotBridge Account</strong></li>
            <li><strong>Third-Party Access:</strong> Credentials for the service you want to connect (e.g., Google Drive, Slack, GitHub).</li>
          </ul>

          <hr className="my-4" />

          <h4 className="text-md font-semibold">🛠 Step-by-Step Setup</h4>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-slate-700 p-3 rounded">
              <h5 className="font-semibold text-sm">🔹 Step 1: Login to Composio</h5>
              <ol className="list-decimal ml-5 text-sm space-y-1 mt-2">
                <li>Open <a href="https://composio.dev" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://composio.dev</a></li>
                <li>Click <strong>Sign Up</strong> or <strong>Login</strong></li>
                <li>Access your dashboard</li>
              </ol>
            </div>

            <div className="bg-blue-50 dark:bg-slate-700 p-3 rounded">
              <h5 className="font-semibold text-sm">🔹 Step 2: Create a Dedicated MCP Config</h5>
              <ol className="list-decimal ml-5 text-sm space-y-1 mt-2">
                <li>From the top navigation menu, click <strong>MCP Configs</strong></li>
                <li>Click <strong>Create MCP Config</strong></li>
                <li>You will see two options:
                  <ul className="list-disc ml-5 mt-1">
                    <li><em>Using Tool Router MCP (Recommended)</em></li>
                    <li><strong>Dedicated MCP Server (Legacy)</strong></li>
                  </ul>
                </li>
                <li>Select <strong>Dedicated MCP Server (Legacy)</strong></li>
              </ol>
              <p className="text-xs mt-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded">
                <strong>Note:</strong> This specific option is required for BotBridge integration.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-slate-700 p-3 rounded">
              <h5 className="font-semibold text-sm">🔹 Step 3: Add a Toolkit (Example: Google Drive)</h5>
              <ol className="list-decimal ml-5 text-sm space-y-1 mt-2">
                <li>Open your newly created MCP Config</li>
                <li>Click <strong>Add Toolkit</strong></li>
                <li>Search for and select <strong>Google Drive</strong></li>
              </ol>
            </div>

            <div className="bg-blue-50 dark:bg-slate-700 p-3 rounded">
              <h5 className="font-semibold text-sm">🔹 Step 4: Connect Your Account</h5>
              <ol className="list-decimal ml-5 text-sm space-y-1 mt-2">
                <li>After adding the toolkit, click <strong>Connect Account</strong></li>
                <li>Follow the OAuth popup (e.g., Sign in with Google)</li>
                <li>Click <strong>Allow</strong> to grant permissions</li>
              </ol>
              <p className="text-xs mt-2 p-2 bg-red-100 dark:bg-red-900 rounded">
                <strong>⚠️ Mandatory:</strong> The MCP server cannot access your data unless the account status shows as "Connected."
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-slate-700 p-3 rounded">
              <h5 className="font-semibold text-sm">🔹 Step 5: Navigate to MCP Servers</h5>
              <ol className="list-decimal ml-5 text-sm space-y-1 mt-2">
                <li>From the top navigation, click <strong>MCP Servers</strong></li>
                <li>Locate the table containing your Server IDs and timestamps</li>
              </ol>
            </div>

            <div className="bg-blue-50 dark:bg-slate-700 p-3 rounded">
              <h5 className="font-semibold text-sm">🔹 Step 6: Click Install (Download Icon)</h5>
              <ol className="list-decimal ml-5 text-sm space-y-1 mt-2">
                <li>Locate your specific MCP Server row</li>
                <li>Click the <strong>Download / Install</strong> icon</li>
                <li>In the modal window, select the <strong>HTTP</strong> tab</li>
              </ol>
            </div>

            <div className="bg-blue-50 dark:bg-slate-700 p-3 rounded">
              <h5 className="font-semibold text-sm">🔹 Step 7: Copy Credentials</h5>
              <p className="text-sm mt-2">Copy the following two values from the <strong>HTTP</strong> section:</p>
              <table className="min-w-full mt-2 text-xs border border-slate-300 dark:border-slate-600">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="border border-slate-300 dark:border-slate-600 px-2 py-1">Requirement</th>
                    <th className="border border-slate-300 dark:border-slate-600 px-2 py-1">Description</th>
                    <th className="border border-slate-300 dark:border-slate-600 px-2 py-1">Example Format</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-2 py-1"><strong>Endpoint</strong></td>
                    <td className="border border-slate-300 dark:border-slate-600 px-2 py-1">Your Server URL in BotBridge</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-2 py-1"><code>https://mcp.composio.dev/api/v1/xxx</code></td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-600 px-2 py-1"><strong>API Key</strong></td>
                    <td className="border border-slate-300 dark:border-slate-600 px-2 py-1">Your Authentication Key</td>
                    <td className="border border-slate-300 dark:border-slate-600 px-2 py-1"><code>cmp_xxxxxxxxxxxxxxxxx</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <hr className="my-4" />

          <h4 className="text-md font-semibold text-blue-600 dark:text-blue-400">🤖 BotBridge Configuration</h4>

          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-slate-700 p-3 rounded">
              <h5 className="font-semibold text-sm">🔹 Step 8: Open BotBridge</h5>
              <ol className="list-decimal ml-5 text-sm space-y-1 mt-2">
                <li>Login to <strong>BotBridge</strong></li>
                <li>Navigate to <strong>Servers</strong> → <strong>Add Server Name, Paste URL and API key</strong></li>
                <li>Click <strong>Add Server</strong></li>
              </ol>
            </div>

            <div className="bg-green-50 dark:bg-slate-700 p-3 rounded">
              <h5 className="font-semibold text-sm">🔹 Step 9: Test the Integration</h5>
              <p className="text-sm mt-2">Open a BotBridge chat and run a test command, such as:</p>
              <blockquote className="border-l-4 border-blue-500 pl-3 italic text-sm mt-2">
                "List my Google Drive files"
              </blockquote>
            </div>
          </div>

          <hr className="my-4" />

          <h4 className="text-md font-semibold text-red-600 dark:text-red-400">🔒 Troubleshooting & Notes</h4>
          <div className="space-y-2 text-sm">
            <div className="p-2 bg-red-50 dark:bg-red-900 rounded">
              <strong>Connection Failed?</strong>
              <ul className="list-disc ml-5 mt-1">
                <li>Ensure you selected <strong>Dedicated MCP Server (Legacy)</strong></li>
                <li>Verify the Toolkit account is actually connected in Composio</li>
                <li>Try regenerating the API Key if the error persists</li>
              </ul>
            </div>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900 rounded">
              <strong>Security:</strong> Keep your API Key secure. Do not share it in public repositories or chats.
            </div>
          </div>

          <hr className="my-4" />

          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded">
            <h4 className="text-md font-semibold">🎯 Quick Summary Flow</h4>
            <p className="text-sm mt-2">
              <strong>Composio:</strong> Create Legacy Config → Add Toolkit → Connect Account → Go to Servers → Install (HTTP) → Copy URL/Key
            </p>
            <p className="text-sm mt-2">
              <strong>BotBridge:</strong> Servers → Add Server Name, Paste URL and API key → Add Server
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowUserManual(false)}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ServerManagement;
