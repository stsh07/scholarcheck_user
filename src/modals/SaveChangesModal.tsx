// src/modals/SaveChangesModal.tsx
import "react";

type SaveChangesModalProps = {
  isOpen: boolean;
  title?: string;
  message?: string;
  buttonText?: string;
  onClose: () => void;
};

export default function SaveChangesModal({
  isOpen,
  title = "Saved Changes!",
  message = "Your application details have been successfully updated. Note: You cannot edit again.",
  buttonText = "OK",
  onClose,
}: SaveChangesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4">
      <div className="relative w-full max-w-[440px] rounded-md bg-white px-6 py-7 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 text-[14px] text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="text-center">
          <h2 className="text-[16px] font-bold text-green-800">{title}</h2>
          <p className="mt-4 text-[13px] leading-relaxed text-gray-600">{message}</p>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 inline-flex h-[32px] min-w-[76px] items-center justify-center rounded-md bg-green-800 px-5 text-[12px] font-semibold text-white hover:bg-green-900"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}