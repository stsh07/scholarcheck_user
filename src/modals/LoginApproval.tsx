import { useEffect } from "react";

type LoginStatus = "PENDING" | "APPROVED" | "DENIED" | "EXPIRED";

type Props = {
  open: boolean;
  status: LoginStatus;
  message: string;
  loading?: boolean;
  onClose: () => void;
  onResend: () => void;
};

export default function LoginApproval({
  open,
  status,
  message,
  loading = false,
  onClose,
  onResend,
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

  const isBad = status === "DENIED" || status === "EXPIRED";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 w-full h-full cursor-default bg-black/40"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md overflow-hidden bg-white shadow-xl rounded-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-900">
            Check your email to approve this login
          </h3>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {/* Main message (no duplicates) */}
          {!isBad ? (
            <p className="text-sm text-gray-700">{message}</p>
          ) : (
            <div className="p-3 text-xs text-red-700 border border-red-200 rounded-lg bg-red-50">
              {message}
            </div>
          )}

          {/* Buttons row */}
          <div className="flex gap-2 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-semibold text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onResend}
              disabled={loading}
              className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg border ${
                loading
                  ? "cursor-not-allowed bg-white text-black/40 border-black/10"
                  : "bg-white text-green-900 border-green-900/20 hover:bg-green-50"
              }`}
            >
              Resend Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
