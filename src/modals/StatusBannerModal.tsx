// src/modals/StatusBannerModal.tsx
import { useEffect } from "react";

type BannerVariant = "success" | "error" | "info";

type Props = {
  isOpen: boolean;
  variant?: BannerVariant;
  title: string;
  message: string;
  autoCloseMs?: number; // ex: 2500
  onClose: () => void;
};

export default function StatusBannerModal({
  isOpen,
  variant = "info",
  title,
  message,
  autoCloseMs = 2500,
  onClose,
}: Props) {
  useEffect(() => {
    if (!isOpen) return;
    if (!autoCloseMs) return;

    const t = window.setTimeout(() => onClose(), autoCloseMs);
    return () => window.clearTimeout(t);
  }, [isOpen, autoCloseMs, onClose]);

  if (!isOpen) return null;

  const bg =
    variant === "success"
      ? "bg-[#16a34a]"
      : variant === "error"
      ? "bg-[#ef4444]"
      : "bg-[#2563eb]";

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-10 px-4">
      <div
        className="absolute inset-0 bg-black/30"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      />

      <div className={["relative w-full max-w-2xl rounded-xl px-6 py-6 text-center shadow-2xl", bg].join(" ")}>
        <h2 className="text-[20px] sm:text-[24px] font-bold text-white">{title}</h2>
        <p className="mt-2 text-[13px] sm:text-[14px] text-white/95 leading-relaxed">
          {message}
        </p>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-white/15 px-6 py-2 text-[13px] font-semibold text-white hover:bg-white/25"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}