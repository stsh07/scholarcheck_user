import { useEffect, useMemo, useRef } from "react";
import { LogOut } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  firstName: string;
  lastName: string;
  email: string;
  onViewProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
}

export function ProfileModal({
  isOpen,
  onClose,
  firstName,
  lastName,
  email,
  onViewProfile,
  onChangePassword,
  onLogout,
}: ProfileModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  const fullName = useMemo(() => {
    return `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Student";
  }, [firstName, lastName]);

  const initials = useMemo(() => {
    const first = String(firstName || "").trim().charAt(0);
    const last = String(lastName || "").trim().charAt(0);
    const value = `${first}${last}`.trim().toUpperCase();
    return value || "ST";
  }, [firstName, lastName]);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="
        absolute right-0 top-full z-50 mt-3
        w-[340px] overflow-hidden rounded-[24px]
        border border-gray-200 bg-[#F8F8F8]
        shadow-[0_14px_36px_rgba(0,0,0,0.14)]
      "
    >
      <div className="px-5 pt-5 pb-4">
        <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-emerald-100 text-[20px] font-semibold text-emerald-900">
          {initials}
        </div>

        <p className="mt-3 text-center text-[16px] font-bold leading-tight text-gray-700">
          {fullName}
        </p>

        <p className="mt-1 text-center text-[13px] text-gray-500 break-words">
          {email || "No email available"}
        </p>

        {/* VIEW PROFILE */}
        <button
          type="button"
          onClick={onViewProfile}
          className="
            mt-5 w-full rounded-[14px]
            border border-emerald-700
            bg-white
            px-4 py-[10px]
            text-[15px] font-semibold
            text-emerald-700
            transition
            hover:bg-emerald-700 hover:text-white
            active:bg-emerald-700 active:text-white
          "
        >
          View Profile
        </button>

        {/* CHANGE PASSWORD */}
        <button
          type="button"
          onClick={onChangePassword}
          className="
            mt-3 w-full rounded-[14px]
            border border-emerald-700
            bg-white
            px-4 py-[10px]
            text-[15px] font-semibold
            text-emerald-700
            transition
            hover:bg-emerald-700 hover:text-white
            active:bg-emerald-700 active:text-white
          "
        >
          Change Password
        </button>
      </div>

      {/* LOGOUT */}
      <div className="border-t border-gray-200 px-3 py-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-[12px] px-2 py-2 text-[14px] font-medium text-red-500"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}