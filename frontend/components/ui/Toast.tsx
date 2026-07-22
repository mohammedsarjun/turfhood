'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4000;

/** App-wide toast host — mount once near the root. Call `useToast()` anywhere beneath it. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col"
        style={{ gap: 8 }}
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'flex items-center rounded-md border px-4 py-3 shadow-lg',
              toast.variant === 'success'
                ? 'border-transparent bg-success text-success-foreground'
                : 'border-transparent bg-destructive text-destructive-foreground',
            )}
            style={{ gap: 8, minWidth: 260 }}
          >
            {toast.variant === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" />
            )}
            <span className="flex-1 text-sm">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              className="shrink-0 opacity-80 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
