import { useEffect } from "react";
import { create } from "zustand";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { clsx } from "clsx";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: Math.random().toString(36).slice(2) },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export function toast(message: string, variant: ToastVariant = "info", duration = 5000) {
  useToastStore.getState().addToast({ message, variant, duration });
}

const VARIANT_STYLES: Record<ToastVariant, { border: string; text: string; icon: React.ElementType }> = {
  success: { border: "border-green-500/20",  text: "text-green-400",  icon: CheckCircle },
  error:   { border: "border-red-500/20",    text: "text-red-400",    icon: XCircle },
  warning: { border: "border-amber-500/20",  text: "text-amber-400",  icon: AlertTriangle },
  info:    { border: "border-white/[0.1]",   text: "text-[#9090a8]",  icon: Info },
};

function ToastItem({ toast: t }: { toast: Toast }) {
  const { removeToast } = useToastStore();
  const { border, text, icon: Icon } = VARIANT_STYLES[t.variant];

  useEffect(() => {
    const timer = setTimeout(() => removeToast(t.id), t.duration ?? 5000);
    return () => clearTimeout(timer);
  }, [t.id, t.duration, removeToast]);

  return (
    <div
      className={clsx(
        "flex items-start gap-3 px-4 py-3 rounded-xl border",
        "min-w-[280px] max-w-[400px] animate-slide-up",
        "bg-[#0d0d18]",
        border,
        text
      )}
    >
      <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
      <p className="text-sm leading-snug flex-1 text-[#c4c4d4]">{t.message}</p>
      <button
        onClick={() => removeToast(t.id)}
        className="text-[#3d3d58] hover:text-[#6b6b8c] transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToastStore();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
