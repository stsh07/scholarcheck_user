// src/modals/ConfirmModal.tsx
import "react";

type Props = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Submit",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/45"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !loading) onClose();
        }}
      />

      <div className="relative mx-4 w-full max-w-4xl rounded-xl bg-white shadow-2xl">
        <div className="p-8 md:p-10">
          <h2 className="text-[18px] md:text-[20px] font-semibold text-gray-900">
            {title}
          </h2>

          <p className="mt-4 text-[14px] md:text-[15px] leading-relaxed text-gray-700">
            {message}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={[
                "w-full sm:w-auto rounded-lg px-10 py-3 text-[14px] font-semibold text-white transition-colors",
                loading
                  ? "bg-emerald-700/70 cursor-not-allowed"
                  : "bg-emerald-700 hover:bg-emerald-800",
              ].join(" ")}
            >
              {loading ? "Submitting..." : confirmText}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className={[
                "w-full sm:w-auto rounded-lg px-10 py-3 text-[14px] font-semibold text-white transition-colors",
                loading
                  ? "bg-red-600/70 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700",
              ].join(" ")}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}