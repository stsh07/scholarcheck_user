interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
  }
  
  export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
    if (!isOpen) return null;
  
    return (
      <>
        {/* Overlay */}
        <button
          type="button"
          aria-label="Close modal"
          className="fixed inset-0 z-50 bg-black/40"
          onClick={onClose}
        />
  
        {/* Modal */}
        <div
          className="fixed z-50 w-full max-w-sm p-6 -translate-x-1/2 -translate-y-1/2 bg-white shadow-xl rounded-xl top-1/2 left-1/2"
          role="dialog"
          aria-modal="true"
        >
          {/* Centered content */}
          <div className="text-center">
            <h2 className="mb-2 text-lg font-semibold text-gray-800">
              Confirm Logout
            </h2>
  
            <p className="mb-6 text-sm text-gray-600">
              Are you sure you want to logout from your account?
            </p>
          </div>
  
          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
  
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </>
    );
  }
  