import React from "react";

const ChatHistoryList: React.FC<{ loading?: boolean }> = ({ loading }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 h-full">
    <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-100">Chat History</h3>
    {loading ? (
      <div className="text-slate-500">Loading...</div>
    ) : (
      <ul className="space-y-2">
        <li className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600">Session 1 <div className="text-xs text-slate-400">2 messages</div></li>
        <li className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600">Session 2 <div className="text-xs text-slate-400">5 messages</div></li>
      </ul>
    )}
  </div>
);

export default ChatHistoryList;
