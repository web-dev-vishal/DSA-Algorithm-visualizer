import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, description, children, size = "md", footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        className={clsx(
          "relative w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800",
          "animate-[scaleIn_0.15s_ease_both]",
          sizes[size]
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-start justify-between gap-4 p-5 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 id="modal-title" className="text-base font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
              {description && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        {/* Body */}
        <div className="p-5">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-zinc-100 dark:border-zinc-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
