import React, { useEffect, useState } from "react";
import axios from 'axios';
import Dropdown from "../common/Dropdown";

type ChatItem = { id: string, chat_name?: string, updated_at?: string, created_at?: string };

const ChatHistoryList: React.FC<{ selectedChatId?: string, onSelect?: (id: string | null) => void, chats?: ChatItem[], setChats?: (c: ChatItem[]) => void, setInput?: (input: string) => void }> = ({ selectedChatId, onSelect, chats, setChats, setInput }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rename states
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  const fetchChats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/chat');
      const list = res.data.chats || [];
      if (setChats) setChats(list);
      return list;
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to load chats');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (chats && chats.length > 0 && onSelect && !selectedChatId) {
      onSelect(chats[0].id);
    }
  }, [chats]);

  const handleNew = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/chat');
      await fetchChats();
      if (onSelect && res.data.chat?.id) {
        onSelect(res.data.chat.id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to create chat');
    } finally {
      setLoading(false);
    }
  };

  // const [deletingId, setDeletingId] = useState<string | null>(null); // REMOVED unused
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    setPendingDelete(id);
    setConfirmOpen(true);
    setHoveredChatId(null);
  };

  const doDelete = async () => {
    if (!pendingDelete) return;
    const isDeletingSelected = pendingDelete === selectedChatId;
    setConfirmOpen(false);
    // setDeletingId(pendingDelete);
    try {
      await axios.delete(`/api/chat/${pendingDelete}`);
      const updatedChats = await fetchChats();
      if (updatedChats.length === 0) {
        await handleNew();
      } else if (isDeletingSelected) {
        if (onSelect) onSelect(updatedChats[0].id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to delete chat');
    } finally {
      // setDeletingId(null);
      setPendingDelete(null);
    }
  };

  const startRename = (id: string, currentName: string) => {
    setEditingChatId(id);
    setEditName(currentName);
    setEditName(currentName);
  };

  const saveRename = async () => {
    if (!editingChatId || !editName.trim()) return;
    try {
      await axios.put(`/api/chat/${editingChatId}`, { name: editName });
      await fetchChats();
      if (onSelect) onSelect(editingChatId);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to rename chat');
    } finally {
      setEditingChatId(null);
      setEditName("");
    }
  };

  const cancelRename = () => {
    setEditingChatId(null);
    setEditName("");
  };

  return (
    <div style={{ borderRadius: "20px" }} className="overflow-y-auto bg-white dark:bg-slate-800 rounded-lg shadow p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Chat History</h3>
        <button onClick={handleNew} className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded">New Chat</button>
      </div>

      {loading && !chats ? (
        <div className="text-slate-500">Loading...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : chats ? (
        <ul className="space-y-2 pb-20">
          {chats.map((c) => {
            const id = c.id;
            const chatName = c.chat_name || "Chat";
            const updated = c.updated_at ? new Date(c.updated_at).toLocaleString() : '';
            const active = selectedChatId === id;
            const isEditing = editingChatId === id;

            return (
              <li
                key={id}
                onMouseEnter={() => setHoveredChatId(id)}
                onMouseLeave={() => setHoveredChatId(null)}
                className={`relative p-3 rounded-lg cursor-pointer flex items-center justify-between ${active ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
              >
                <div onClick={() => {
                  if (!isEditing) {
                    onSelect && onSelect(id);
                    setInput && setInput("");
                  }
                }} className="flex-1 min-w-0">

                  {isEditing ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename();
                          if (e.key === 'Escape') cancelRename();
                        }}
                        className="w-full text-sm px-2 py-1 rounded text-slate-800"
                      />
                      <button onClick={saveRename} className="text-xs bg-green-500 text-white px-2 py-1 rounded">Save</button>
                      <button onClick={cancelRename} className="text-xs bg-slate-400 text-white px-2 py-1 rounded">X</button>
                    </div>
                  ) : (
                    <>
                      <div className="font-medium truncate pr-2">{chatName}</div>
                      <div className={`text-xs ${active ? 'text-indigo-200' : 'text-slate-400'}`}>{updated}</div>
                    </>
                  )}
                </div>

                {!isEditing && (hoveredChatId === id) && (
                  <div className="ml-2 relative">
                    <Dropdown
                      trigger={
                        <button
                          className={`p-1 rounded-full ${active ? 'hover:bg-indigo-500' : 'hover:bg-slate-200 dark:hover:bg-slate-500'}`}
                        >
                          {/* Chevron Down Icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      }
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(id, chatName);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 block"
                      >
                        Rename
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(id);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 block"
                      >
                        Delete
                      </button>
                    </Dropdown>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : ""}

      {/* confirmation modal (simple) */}
      {confirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-lg w-80">
            <h4 className="font-semibold mb-2 text-slate-800 dark:text-slate-100">Delete chat?</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">This will remove the chat and its messages for your account. This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setConfirmOpen(false); setPendingDelete(null); }} className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-700">Cancel</button>
              <button onClick={doDelete} className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistoryList;
