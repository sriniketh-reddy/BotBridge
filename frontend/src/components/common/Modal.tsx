import React from 'react';

const Modal: React.FC<{ open: boolean; title?: string; onClose: () => void; children?: React.ReactNode }> = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        {title && <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100">{title}</h3>}
        <div>{children}</div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700">Close</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
