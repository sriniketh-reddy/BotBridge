// src/components/ChatInterface/ChatInterface.tsx
import React, { useState, useEffect } from "react";
import ChatHistoryList from "../ChatHistoryList";
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ChatInterface: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // create a chat for the user if none
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!chatId) {
          const result = await axios.post('/api/chat');
          setChatId(result.data.chat.id);
        }
      } catch (err: any) {
        setError(err?.response?.data?.error || err.message || 'Failed to init chat');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !chatId) return;
    setSending(true);
    setError(null);
    try {
      await axios.post(`/api/chat/${chatId}/messages`, { text: input });
      // refresh messages
      const msgs = await axios.get(`/api/chat/${chatId}/messages`);
      setMessages(msgs.data.messages as any);
      setInput("");
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="app-container grid grid-cols-1 lg:grid-cols-4 gap-6 py-8">
        <aside className="lg:col-span-1">
          <ChatHistoryList />
        </aside>

        <main className="lg:col-span-3 flex flex-col bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <header className="px-6 py-4 border-b dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Chat</h3>
            <div className="text-sm text-slate-500">{user?.name || user?.email || 'Connected'}</div>
          </header>

          <div className="flex-1 p-6 overflow-y-auto space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-slate-500">No messages yet — say hello 👋</div>
            )}

            {loading && <div className="text-center text-slate-500">Initializing chat...</div>}
            {error && <div className="text-center text-red-600">{error}</div>}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] px-4 py-2 rounded-lg ${msg.sender === "user" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-700 border-t dark:border-slate-700 flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button onClick={handleSend} disabled={sending} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">{sending ? 'Sending...' : 'Send'}</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatInterface;
