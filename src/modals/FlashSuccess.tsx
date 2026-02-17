import React, { useEffect } from "react";

interface FlashSuccessProps {
  message: string;
  duration?: number; // in ms, default 3s
  onClose: () => void;
}

export default function FlashSuccess({ message, duration = 3000, onClose }: FlashSuccessProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed z-50 flex items-center justify-center px-4 py-3 text-white bg-green-800 rounded-lg shadow-lg top-5 right-5 animate-slide-in">
      <span className="text-sm sm:text-base">{message}</span>
    </div>
  );
}
