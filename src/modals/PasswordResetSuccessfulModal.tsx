import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  autoCloseMs?: number;
};

export default function PasswordResetSuccessfulModal({
  open,
  onClose,
  autoCloseMs = 2000,
}: Props) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    let t: number | undefined;
    if (autoCloseMs && autoCloseMs > 0) {
      t = window.setTimeout(() => onClose(), autoCloseMs);
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (t) window.clearTimeout(t);
    };
  }, [open, autoCloseMs, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-10 sm:pt-12"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-success-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-md bg-green-600 shadow-xl">
        <div className="px-6 py-4 text-center">
          <h3
            id="reset-success-title"
            className="text-base sm:text-lg font-bold text-white"
          >
            Password Reset Successful!
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-white/95">
            Your password has been updated. Redirecting to home...
          </p>
        </div>
      </div>
    </div>
  );
}
