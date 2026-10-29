import React from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'warning';
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-[92vw] w-auto bg-[#151e18] text-[#f2fff4] px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2.5 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-200"
    >
      <span className="material-symbols-outlined text-[18px] text-[#78d9aa]">
        {toast.type === 'warning' ? 'warning' : 'check_circle'}
      </span>
      <span>{toast.text}</span>
      <button
        type="button"
        onClick={onClose}
        className="w-5 h-5 rounded-full flex items-center justify-center text-[#bdcac0] hover:text-white focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Fermer la notification"
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
      </button>
    </div>
  );
};
