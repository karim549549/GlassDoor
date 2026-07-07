"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Brutalist Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 border-2 border-[#0E0E0D] font-mono text-[0.6rem] sm:text-[0.65rem] uppercase tracking-wider font-bold shadow-[4px_4px_0px_0px_#0E0E0D] transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
              t.type === "success"
                ? "bg-[#FAF8F5] text-[#0E0E0D]"
                : t.type === "error"
                ? "bg-[#FF5C5C] text-[#FAF8F5]"
                : "bg-orange text-[#FAF8F5]"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <span>{t.message}</span>
              <button
                onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
                className="hover:opacity-70 transition-opacity cursor-pointer border-none bg-transparent p-0 text-[0.75rem] leading-none"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export default ToastProvider;
