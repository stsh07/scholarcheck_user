import { useRef, useEffect } from "react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  firstName: string;
  lastName: string;
  email: string;
}

export function ProfileModal({
  isOpen,
  onClose,
  firstName,
  lastName,
  email,
}: ProfileModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, isOpen]);

  if (!isOpen) return null;

  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Student";

  return (
    <div
      ref={ref}
      className="
        absolute right-0 z-50 mt-2
        w-[280px] sm:w-[320px] md:w-[360px]
        p-4 text-sm bg-white border border-gray-300 rounded-xl shadow-lg
      "
    >

      <p className="text-base font-semibold text-center text-gray-900">
        {fullName}
      </p>

      <p className="mt-1 text-center text-gray-600 break-words whitespace-normal">
        {email}
      </p>
    </div>
  );
}
