import React from 'react';
import { useRealtime } from '../context/RealtimeContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useRealtime();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        };

        const borders = {
          success: 'border-emerald-500/40 bg-emerald-950/80 shadow-emerald-900/20',
          info: 'border-cyan-500/40 bg-cyan-950/80 shadow-cyan-900/20',
          warning: 'border-amber-500/40 bg-amber-950/80 shadow-amber-900/20',
          error: 'border-rose-500/40 bg-rose-950/80 shadow-rose-900/20'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all animate-in slide-in-from-bottom-3 duration-200 ${borders[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-100">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs text-slate-300 mt-1 leading-relaxed break-words">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
