import { useEffect, useMemo, useRef, useState } from "react";
import { LogOut } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  profileImage?: string;
  onViewProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
}

function getInitialsFromFullName(fullName?: string) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "ST";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

function resolveProfileImageUrl(imagePath?: string) {
  if (!imagePath) return "";

  const trimmed = String(imagePath).trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  return `${apiBase}${normalizedPath}`;
}

export function ProfileModal({
  isOpen,
  onClose,
  firstName,
  lastName,
  fullName,
  email,
  profileImage,
  onViewProfile,
  onChangePassword,
  onLogout,
}: ProfileModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [imageFailed, setImageFailed] = useState(false);

  const displayName = useMemo(() => {
    return (
      String(fullName || "").trim() ||
      `${firstName ?? ""} ${lastName ?? ""}`.trim() ||
      "Student"
    );
  }, [fullName, firstName, lastName]);

  const initials = useMemo(() => {
    return getInitialsFromFullName(displayName);
  }, [displayName]);

  const resolvedProfileImage = useMemo(() => {
    return resolveProfileImageUrl(profileImage);
  }, [profileImage]);

  useEffect(() => {
    setImageFailed(false);
  }, [resolvedProfileImage, isOpen]);

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

  const showImage = !!resolvedProfileImage && !imageFailed;

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
        <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-[20px] font-semibold text-emerald-900">
          {showImage ? (
            <img
              src={resolvedProfileImage}
              alt={displayName}
              className="h-full w-full rounded-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <p className="mt-3 text-center text-[16px] font-bold leading-tight text-gray-700">
          {displayName}
        </p>

        <p className="mt-1 break-words text-center text-[13px] text-gray-500">
          {email || "No email available"}
        </p>

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

      <div className="border-t border-gray-200 px-3 py-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-[12px] px-2 py-2 text-[14px] font-medium text-red-500 transition hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}