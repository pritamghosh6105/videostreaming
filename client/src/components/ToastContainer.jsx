import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContainer = ({ toasts, removeToast }) => {
  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
          icon: CheckCircle,
        };
      case 'error':
        return {
          bg: 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400',
          icon: AlertCircle,
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
          icon: AlertTriangle,
        };
      default:
        return {
          bg: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
          icon: Info,
        };
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
      {toasts.map((toast) => {
        const styles = getToastStyles(toast.type);
        const Icon = styles.icon;

        return (
          <div
            key={toast.id}
            className={`w-full flex items-center justify-between gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-2xl pointer-events-auto transition-all animate-slide-in ${styles.bg}`}
          >
            <div className="flex items-center gap-3">
              <Icon size={18} className="shrink-0" />
              <span className="text-xs font-bold leading-relaxed">{toast.message}</span>
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-current/60 hover:text-current/100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
