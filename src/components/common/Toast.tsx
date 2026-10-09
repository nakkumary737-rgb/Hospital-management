import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-90 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-3">
      {toasts.map(toast => {
        const type = toast.type || 'success';
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 ${
              type === 'success'
                ? 'bg-slate-900 text-white border-emerald-500/50'
                : type === 'error'
                ? 'bg-rose-950 text-white border-rose-600'
                : type === 'warning'
                ? 'bg-amber-950 text-white border-amber-600'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
              {type === 'info' && <Info className="w-4 h-4 text-teal-400 shrink-0" />}
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
