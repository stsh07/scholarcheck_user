// src/components/AIHistoryPanel.tsx
import React from "react";

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
}: AIHistoryPanelProps) {
  if (!isOpen) return null;

  const grouped = groupHistory(items);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/30">
      {/* backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* panel */}
      <div className="relative z-[101] h-full w-full max-w-[390px] bg-[#f7f7f7] shadow-xl">
        {/* header */}
        <div className="border-b border-gray-200 px-6 pb-4 pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[18px] font-semibold text-gray-900">
                Chat History
              </h2>

              <p className="mt-1 text-[13px] text-gray-500">
                Select a chat to continue or delete a chat.
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-200"
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
        <div className="h-[calc(100%-90px)] overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            {Object.entries(grouped).map(([group, chats]) => (
              <div key={group}>
                {/* group title */}
                <div className="mb-3 text-[12px] font-medium uppercase text-gray-500">
                  {group}
                </div>

                <div className="space-y-3">
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => onSelect?.(chat)}
                      className={`flex w-full items-center gap-4 rounded-lg px-4 py-4 text-left transition ${
                        chat.active
                          ? "bg-green-100"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {/* icon */}
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-white">
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
                      <div className="flex-1">
                        <div className="text-[14px] font-medium text-gray-900">
                          {chat.title}
                        </div>

                        <div className="mt-1 text-[12px] text-gray-500">
                          {chat.date}
                        </div>
                      </div>
                    </button>
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