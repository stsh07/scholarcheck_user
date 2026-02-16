import { useRef, useEffect } from "react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  firstName: string;
  lastName: string;
  email: string;
}

export function ProfileModal({ isOpen, onClose, firstName, lastName, email }: ProfileModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 z-50 w-56 p-4 mt-2 text-sm bg-white border border-gray-300 rounded-lg shadow-lg"
    >
      <p className="mb-2 font-semibold">{firstName} {lastName}</p>
      <p className="text-gray-600">{email}</p>
    </div>
  );
}
