// src/modals/ConfirmSubmissionModal.tsx
import "react";

type Props = {
  isOpen: boolean;
  mode: "submit" | "edit";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmSubmissionModal({
  isOpen,
  mode,
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  if (!isOpen) return null;

  const config =
    mode === "edit"
      ? {
          title: "Confirm Changes",
          message:
            "Are you sure you want to save your changes? Note: You can only edit your application once.",
          confirmText: "Save Changes",
          cancelText: "Cancel",
          loadingText: "Saving...",
        }
      : {
          title: "Confirm Submission",
          message:
            "Are you sure you want to submit your application? Please make sure all your details are accurate before submitting.",
          confirmText: "Submit",
          cancelText: "Cancel",
          loadingText: "Submitting...",
        };

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
          <h2 className="text-[18px] font-semibold text-gray-900 md:text-[20px]">
            {config.title}
          </h2>

          <p className="mt-4 text-[14px] leading-relaxed text-gray-700 md:text-[15px]">
            {config.message}
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={[
                "w-full rounded-lg px-10 py-3 text-[14px] font-semibold text-white transition-colors sm:w-auto",
                loading
                  ? "cursor-not-allowed bg-emerald-700/70"
                  : "bg-emerald-700 hover:bg-emerald-800",
              ].join(" ")}
            >
              {loading ? config.loadingText : config.confirmText}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className={[
                "w-full rounded-lg px-10 py-3 text-[14px] font-semibold text-white transition-colors sm:w-auto",
                loading
                  ? "cursor-not-allowed bg-red-600/70"
                  : "bg-red-600 hover:bg-red-700",
              ].join(" ")}
            >
              {config.cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}