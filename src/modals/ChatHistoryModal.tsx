import { useState, useEffect } from "react";

interface Message {
  id: string;
  type: "bot" | "user";
  content: string;
  timestamp: string;
}

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MessagesByDate {
  [date: string]: Message[];
}

export default function ChatHistoryModal({ isOpen, onClose }: ChatHistoryModalProps) {
  const [history, setHistory] = useState<MessagesByDate>({});
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Load messages and group by date
  useEffect(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
      const messages: Message[] = JSON.parse(saved);

      const grouped: MessagesByDate = {};
      messages.forEach((msg) => {
        const date = new Date(msg.timestamp).toLocaleDateString();
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(msg);
      });

      setHistory(grouped);

      const today = new Date().toLocaleDateString();
      setSelectedDate(grouped[today] ? today : Object.keys(grouped)[0] || "");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const dates = Object.keys(history).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <>
      {/* Fullscreen Overlay */}
        <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
        />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 z-50 h-full w-[350px] bg-white shadow-lg flex flex-col overflow-y-auto transition-transform duration-300">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <button
            onClick={onClose}
            className="font-bold text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Date selector */}
        {dates.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <label className="mr-2 text-sm font-medium">Select Date:</label>
            <select
            className="w-full px-2 py-1 mt-2 border border-gray-300 rounded"
            value={selectedDate}
            onChange={(e) => {
                const val = e.target.value;
                // Only set if the value exists in dates
                if (dates.includes(val)) {
                setSelectedDate(val);
                }
            }}
            >
            {dates.map((date) => (
                <option key={date} value={date}>
                {date === new Date().toLocaleDateString()
                    ? "Today"
                    : date === new Date(Date.now() - 86400000).toLocaleDateString()
                    ? "Yesterday"
                    : date}
                </option>
            ))}
            </select>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {selectedDate && history[selectedDate]?.length > 0 ? (
            history[selectedDate].map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.type === "bot"
                    ? "bg-gray-100 text-black"
                    : "bg-green-100 text-black ml-auto"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <span className="text-[10px] text-gray-400">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          ) : (
            <p className="mt-4 text-center text-gray-500">
              No messages for this date.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
