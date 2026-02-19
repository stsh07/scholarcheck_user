// src/modals/LoginErrorModal.tsx
import { useEffect } from "react";

type Props = {
  open: boolean;
  title?: string;
  message?: string; // ✅ added (optional)
  onClose: () => void;
};

export default function LoginErrorModal({
  open,
  title = "Login Failed",
  message,
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  // ✅ keep old behavior as default
  const finalMessage = message?.trim() ? message : "Invalid credentials.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-error-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-sm overflow-hidden bg-white border border-gray-200 shadow-xl rounded-2xl">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50">
              <span className="text-lg">⚠️</span>
            </div>

            <div className="min-w-0">
              <h3
                id="login-error-title"
                className="text-base font-semibold text-gray-900"
              >
                {title}
              </h3>
              <p className="mt-1 text-sm text-gray-600 break-words">
                {finalMessage}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white transition rounded-xl bg-green-800 hover:bg-green-900"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
