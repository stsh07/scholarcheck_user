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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4">
      <div className="relative w-full max-w-[440px] rounded-md bg-white px-6 py-7 shadow-xl">
        <div className="text-center">
          <h2 className="text-[16px] font-bold text-green-800">{config.title}</h2>

          <p className="mt-4 text-[13px] leading-relaxed text-gray-600">
            {config.message}
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={[
                "inline-flex h-[32px] min-w-[92px] items-center justify-center rounded-md px-5 text-[12px] font-semibold text-white",
                loading
                  ? "cursor-not-allowed bg-green-800/70"
                  : "bg-green-800 hover:bg-green-900",
              ].join(" ")}
            >
              {loading ? config.loadingText : config.confirmText}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className={[
                "inline-flex h-[32px] min-w-[76px] items-center justify-center rounded-md px-5 text-[12px] font-semibold text-white",
                loading
                  ? "cursor-not-allowed bg-gray-400/70"
                  : "bg-gray-400 hover:bg-gray-500",
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