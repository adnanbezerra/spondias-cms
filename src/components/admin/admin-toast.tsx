"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ShowToastOptions = {
  variant?: ToastVariant;
  durationMs?: number;
};

type AdminToastContextValue = {
  showToast: (message: string, options?: ShowToastOptions) => void;
};

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

const getToastClassName = (variant: ToastVariant): string => {
  if (variant === "success") {
    return "border-emerald-200 bg-emerald-100 text-emerald-900";
  }

  if (variant === "error") {
    return "border-red-200 bg-red-100 text-red-900";
  }

  return "border-[#334D40]/20 bg-white text-[#334D40]";
};

export const AdminToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, options?: ShowToastOptions) => {
      const id = crypto.randomUUID();
      const variant = options?.variant ?? "info";
      const durationMs = options?.durationMs ?? 3200;

      setToasts((current) => [...current, { id, message, variant }]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, durationMs);
    },
    [],
  );

  const contextValue = useMemo<AdminToastContextValue>(
    () => ({ showToast }),
    [showToast],
  );

  return (
    <AdminToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg ${getToastClassName(toast.variant)}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  );
};

export const useAdminToast = (): AdminToastContextValue => {
  const context = useContext(AdminToastContext);
  if (!context) {
    throw new Error("useAdminToast precisa ser usado dentro de AdminToastProvider.");
  }

  return context;
};
