import React, { useEffect, useState } from "react";
import axios from 'axios';

type ChatItem = { id: string, chat_name?:string, updated_at?: string, created_at?: string };

const ChatHistoryList: React.FC<{ selectedChatId?: string, onSelect?: (id: string | null) => void, chats?: ChatItem[], setChats?: (c: ChatItem[]) => void, setInput?: (input: string) => void}> = ({ selectedChatId, onSelect, chats, setChats, setInput}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchChats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/chat');
      if(setChats) setChats(res.data.chats || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect( () => {
    if (chats && chats.length > 0 && onSelect) {
      onSelect(chats[0].id);
    }
  }, [chats]);

  const handleNew = async () => {
    setLoading(true);
    try {
      await axios.post('/api/chat');
      await fetchChats();
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to create chat');
    } finally {
      setLoading(false);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    setPendingDelete(id);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!pendingDelete) return;
    setConfirmOpen(false);
    setDeletingId(pendingDelete);
    try {
      await axios.delete(`/api/chat/${pendingDelete}`);
      await fetchChats();
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to delete chat');
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  };

  return (
    <div style={{borderRadius: "20px"}} className="overflow-y-auto bg-white dark:bg-slate-800 rounded-lg shadow p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Chat History</h3>
        <button onClick={handleNew} className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded">New Chat</button>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : chats ? (
        <ul className="space-y-2">
          {chats.map((c) => {
            const id = c.id;
            const chatName = c.chat_name || "Chat";
            const updated = c.updated_at ? new Date(c.updated_at).toLocaleString() : '';
            const active = selectedChatId === id;
            return (
              <li key={id} className={`p-3 rounded-lg cursor-pointer flex items-center justify-between ${active ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'}`}>
                <div onClick={() => {
                    onSelect && onSelect(id);
                    setInput && setInput("");
                  }} className="flex-1">
                  <div className="font-medium">{chatName}</div>
                  <div className="text-xs text-slate-400">{updated}</div>
                </div>
                <div className="ml-3">
                  <button disabled={!!deletingId} onClick={() => confirmDelete(id)} className={`inline-flex items-center gap-2 px-2 py-1 rounded ${active ? 'bg-white/10 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ):""}

      {/* confirmation modal (simple) */}
      {confirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30">
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
