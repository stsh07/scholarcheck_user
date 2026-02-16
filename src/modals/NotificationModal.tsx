import { useRef, useEffect } from "react";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: string[];
}

export function NotificationModal({ isOpen, onClose, notifications }: NotificationModalProps) {
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
      className="absolute right-0 z-50 w-64 p-4 mt-2 text-sm bg-white border border-gray-300 rounded-lg shadow-lg"
    >
      <p className="mb-2 font-semibold">Notification</p>
      <ul className="space-y-2 overflow-y-auto max-h-40">
        {notifications.map((note, idx) => (
          <li key={idx} className="p-2 bg-gray-100 rounded">
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
}
