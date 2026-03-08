// src/components/AIHistoryPanel.tsx
import { useEffect, useMemo, useState } from "react";

export interface AIHistoryItem {
  id: string;
  title: string;
  date: string;
  group: string;
  active?: boolean;
}

interface AIHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: AIHistoryItem[];
  onSelect?: (item: AIHistoryItem) => void;
  onDelete?: (item: AIHistoryItem) => void;
}

function groupHistory(items: AIHistoryItem[]) {
  return items.reduce<Record<string, AIHistoryItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});
}

export default function AIHistoryPanel({
  isOpen,
  onClose,
  items,
  onSelect,
  onDelete,
}: AIHistoryPanelProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [visible, setVisible] = useState(false);

  const grouped = useMemo(() => groupHistory(items), [items]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);

      const frame = requestAnimationFrame(() => {
        setVisible(true);
      });

      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);

    const timeout = window.setTimeout(() => {
      setShouldRender(false);
      setOpenMenuId(null);
    }, 260);

    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => {
          setOpenMenuId(null);
          onClose();
        }}
      />

      {/* panel */}
      <div
        className={`relative z-[101] h-full w-full max-w-[390px] transform bg-[#f7f7f7] shadow-xl transition-all duration-300 ease-out ${
          visible
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-95"
        }`}
      >
        {/* header */}
        <div className="border-b border-gray-200 px-6 pb-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-semibold text-gray-900">
                Chat History
              </h2>
            </div>

            <button
              onClick={() => {
                setOpenMenuId(null);
                onClose();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-gray-200 active:scale-95"
              aria-label="Close history"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="h-5 w-5"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* content */}
        <div className="h-[calc(100%-77px)] overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            {Object.entries(grouped).map(([group, chats]) => (
              <div key={group}>
                <div className="mb-3 text-[12px] font-medium uppercase text-gray-500">
                  {group}
                </div>

                <div className="space-y-3">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`group relative flex w-full items-center gap-4 rounded-lg px-4 py-4 text-left transition ${
                        chat.active
                          ? "bg-green-100"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          onSelect?.(chat);
                        }}
                        className="flex min-w-0 flex-1 items-center gap-4 text-left"
                      >
                        {/* icon */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-700 text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            className="h-4 w-4"
                          >
                            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                          </svg>
                        </div>

                        {/* text */}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14px] font-medium text-gray-900">
                            {chat.title}
                          </div>

                          <div className="mt-1 text-[12px] text-gray-500">
                            {chat.date}
                          </div>
                        </div>
                      </button>

                      {/* 3 dots */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId((prev) =>
                              prev === chat.id ? null : chat.id
                            );
                          }}
                          className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
                            openMenuId === chat.id
                              ? "bg-white text-gray-800 shadow-sm"
                              : "text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-gray-800"
                          }`}
                          aria-label="More options"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-5 w-5"
                          >
                            <circle cx="12" cy="5" r="1.8" />
                            <circle cx="12" cy="12" r="1.8" />
                            <circle cx="12" cy="19" r="1.8" />
                          </svg>
                        </button>

                        {openMenuId === chat.id && (
                          <div className="absolute right-0 top-9 z-20 min-w-[110px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                                onDelete?.(chat);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-4 w-4"
                              >
                                <path d="M3 6h18" />
                                <path d="M8 6V4h8v2" />
                                <path d="M19 6l-1 14H6L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                              </svg>
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="py-10 text-center text-gray-500">
                No chat history yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}