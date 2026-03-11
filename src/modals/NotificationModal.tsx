import { useRef, useEffect, useMemo } from "react";
import {
  Bell,
  CheckCheck,
  Megaphone,
  FileText,
  XCircle,
  CheckCircle,
  Trash2,
} from "lucide-react";

export interface NotificationItem {
  id: number;
  type: "announcement" | "application_approved" | "application_declined";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  loading?: boolean;
  onMarkAllAsRead?: () => void;
  onClear?: () => void;
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date().getTime();
  const diff = Math.floor((now - date.getTime()) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day(s) ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getNotificationIcon(type: NotificationItem["type"]) {
  switch (type) {
    case "announcement":
      return <Megaphone size={16} className="text-blue-600" />;
    case "application_approved":
      return <CheckCircle size={16} className="text-emerald-600" />;
    case "application_declined":
      return <XCircle size={16} className="text-red-600" />;
    default:
      return <FileText size={16} className="text-gray-600" />;
  }
}

function getNotificationBadge(type: NotificationItem["type"]) {
  switch (type) {
    case "announcement":
      return "Announcement";
    case "application_approved":
      return "Approved";
    case "application_declined":
      return "Declined";
    default:
      return "Notification";
  }
}

export function NotificationModal({
  isOpen,
  onClose,
  notifications,
  loading = false,
  onMarkAllAsRead,
  onClear,
}: NotificationModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 z-50 mt-3 w-[390px] max-w-[95vw] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl"
    >
      <div className="flex items-start justify-between border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gray-100 p-3">
            <Bell size={18} className="text-gray-700" />
          </div>

          <div>
            <p className="text-[15px] font-bold text-gray-900">Notifications</p>
            <p className="text-sm text-gray-500">{unreadCount} unread</p>
          </div>
        </div>

        {notifications.length > 0 && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <Trash2 size={14} />
            Clear
          </button>
        )}
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
            <p className="text-sm font-medium text-gray-700">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
              <Bell size={22} className="text-gray-500" />
            </div>
            <p className="text-[15px] font-semibold text-gray-800">
              No notifications yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Announcements and application updates will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((note) => (
              <li
                key={note.id}
                className={`px-4 py-4 transition ${
                  note.is_read ? "bg-white" : "bg-green-50/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                    {getNotificationIcon(note.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-700">
                          {getNotificationBadge(note.type)}
                        </span>

                        {!note.is_read && (
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700">
                            New
                          </span>
                        )}
                      </div>

                      {!note.is_read && (
                        <span
                          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500"
                          aria-label="Unread notification"
                          title="Unread"
                        />
                      )}
                    </div>

                    <p
                      className="text-sm font-semibold text-gray-900"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={note.title}
                    >
                      {note.title}
                    </p>

                    <p
                      className="mt-1 text-sm leading-relaxed text-gray-600"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                      }}
                      title={note.message}
                    >
                      {note.message}
                    </p>

                    <div className="mt-2">
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(note.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!loading && notifications.length > 0 && onMarkAllAsRead && (
        <div className="border-t border-gray-100 bg-white px-4 py-3">
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}