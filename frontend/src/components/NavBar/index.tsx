// src/components/NavBar/NavBar.tsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Modal from '../common/Modal';
import { useToast } from '../common/ToastContext';

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { push } = useToast();
  const location = useLocation();

  return (
    <>
      <nav style={{ width: "100%", height: "12dvh" }} className="flex flex-column justify-center bg-white dark:bg-slate-800 border-b dark:border-slate-700">
        <div style={{ height: "12dvh" }} className="flex items-center justify-center h-full w-full">
          <div className="app-container-fluid flex items-center justify-around h-16 w-full">
            <div className="flex items-center gap-3">
              <div className="text-indigo-600 font-extrabold text-lg">BotBridge</div>
              <div className="hidden sm:block text-sm text-slate-500">Bridge your apps to bots</div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/chat"
                className={`px-3 py-2 rounded text-sm transition-colors ${location.pathname === '/chat'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                Chat
              </Link>
              <Link
                to="/servers"
                className={`px-3 py-2 rounded text-sm transition-colors ${location.pathname === '/servers'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                Servers
              </Link>
              {/* debug link removed */}
              {user ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => setConfirmOpen(true)} className="inline-flex items-center px-3 py-1 text-sm font-medium bg-red-600 text-white rounded hover:bg-red-700">Logout</button>
                </div>
              ) : (
                <Link to="/login" className="inline-flex items-center px-3 py-1 text-sm font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700">Sign in</Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <Modal open={confirmOpen} title="Confirm logout">
        <div>Are you sure you want to logout?</div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setConfirmOpen(false)} className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700">Cancel</button>
          <button onClick={() => { logout(); push({ message: 'Logged out', type: 'success' }); setConfirmOpen(false); }} className="px-3 py-1 rounded bg-red-600 text-white">Logout</button>
        </div>
      </Modal>
    </>
  );
};

export default NavBar;
