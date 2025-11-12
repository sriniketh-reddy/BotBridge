// src/components/ChatInterface/ChatInterface.tsx
import React, { useState, useEffect } from "react";
import ChatHistoryList from "../ChatHistoryList";
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

type ChatItem = { id: string, chat_name?:string, updated_at?: string, created_at?: string };

const ChatInterface: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [chats, setChats] = useState<ChatItem[]>([]);
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
    // if no chat selected, create one on mount
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!chatId) {
          const userChats = await axios.get('/api/chat');
          const chats = userChats.data.chats;
          if (chats.length > 0) {
            setChats(chats);
            setChatId(chats[0].id);
          } else {
            const result = await axios.post('/api/chat');
            setChatId(result.data.chat.id);
          }
        }
      } catch (err: any) {
        setError(err?.response?.data?.error || err.message || 'Failed to init chat');
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load messages whenever chatId changes
  useEffect(() => {
    const load = async () => {
      if (!chatId) return;
      try {
        const msgs = await axios.get(`/api/chat/${chatId}/messages`);
        setMessages(msgs.data.messages as any);
      } catch (err: any) {
        // ignore for now
      }
    };
    load();
  }, [chatId]);


  const handleSend = async () => {
    if (!input.trim() || !chatId) return;
    setSending(true);
    setError(null);
    try {
      await axios.post(`/api/chat/${chatId}/messages`, { text: input });
      // refresh messages
      const msgs = await axios.get(`/api/chat/${chatId}/messages`);
      setMessages(msgs.data.messages as any);
      await fetchChats();
      setInput("");
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{maxHeight: "87dvh", height: "87dvh"}} className="overflow-hidden bg-slate-50 dark:bg-slate-900">
      <div style={{paddingLeft: "50px", paddingRight: "50px"}} className="app-container-fluid  grid grid-cols-1 lg:grid-cols-4 gap-6 py-8">
        <aside style={{maxHeight: "80dvh", height: "80dvh"}} className="lg:col-span-1">
          <ChatHistoryList selectedChatId={chatId || undefined} onSelect={(id) => setChatId(id)} chats={chats} setChats={setChats} setInput={setInput}/>
        </aside>

        <main style={{maxHeight: "80dvh", height: "80dvh", borderRadius: "30px"}} className="lg:col-span-3 flex flex-col bg-white dark:bg-slate-800 rounded-lg shadow">
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

          <div style={{borderRadius: "30px"}} className="p-4 bg-slate-50 dark:bg-slate-700 border-t dark:border-slate-700 flex gap-3">
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
