import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../components/ToastContainer';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Globally redirect window.alert to custom toasts
  React.useEffect(() => {
    window.alert = (message) => {
      const msg = String(message);
      const isError =
        msg.toLowerCase().includes('failed') ||
        msg.toLowerCase().includes('error') ||
        msg.toLowerCase().includes('cannot') ||
        msg.toLowerCase().includes('incorrect') ||
        msg.toLowerCase().includes('invalid') ||
        msg.toLowerCase().includes('please');

      showToast(msg, isError ? 'error' : 'success');
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
