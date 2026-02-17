import { useState, useRef, useEffect } from "react";
import { Layout } from "../components/Layout";
import SendImg from "../img/Sent.png";
import BotImg from "../img/Chatbot.png";
import ChatRoomImg from "../img/Chat Room.png";
import ChatHistoryModal from "../modals/ChatHistoryModal";

export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface Message {
  id: string;
  type: "bot" | "user";
  content: string;
  timestamp: string;
}

// ✅ Uses your existing frontend .env
const API_BASE =
  (import.meta as any).env?.VITE_API_URL?.toString()?.trim() ||
  "http://localhost:8000";

function nowTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "1",
        type: "bot",
        content:
          "Hello! I'm IskoBot, your scholarship assistant. I can help you understand scholarship requirements, improve your eligibility, and answer questions about the application process. How can I assist you today?",
        timestamp: nowTime(),
      },
    ];
  });

  const [inputValue, setInputValue] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  const addMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  };

  const callChatApi = async (userMessage: string): Promise<string> => {
    const endpoints = [`${API_BASE}/api/chat`, `${API_BASE}/chat`];

    let lastErr: any = null;

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage }),
        });

        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(t || `Request failed (${res.status})`);
        }

        const data = await res.json();
        return (
          data.answer?.trim() ||
          "Sorry, I couldn’t generate a response. Please try again."
        );
      } catch (e) {
        lastErr = e;
      }
    }

    console.error("IskoBot API error:", lastErr);
    throw lastErr;
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isSending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      content: text,
      timestamp: nowTime(),
    };

    addMessage(userMsg);
    setInputValue("");
    setIsSending(true);

    const typingId = (Date.now() + 1).toString();
    addMessage({
      id: typingId,
      type: "bot",
      content: "Typing...",
      timestamp: nowTime(),
    });

    try {
      const answer = await callChatApi(text);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId ? { ...m, content: answer } : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId
            ? {
                ...m,
                content:
                  "⚠️ Cannot connect to IskoBot backend. Make sure FastAPI is running on http://localhost:8000.",
              }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-screen p-6 overflow-hidden bg-gray-50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="mb-2 text-4xl font-bold">
              AI Scholarship Assistant
            </h1>
            <p className="text-lg text-gray-600">
              Get personalized guidance and answers to your questions
            </p>
          </div>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-200"
          >
            <img src={ChatRoomImg} alt="Chat History" className="w-5 h-5" />
            <span className="text-sm font-medium text-green-800">
              History
            </span>
          </button>
        </div>

        {/* Chat container */}
        <div
          className="flex flex-col rounded-[20px] bg-white shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] overflow-hidden"
          style={{ maxHeight: "600px" }}
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white border border-[#CFCFCF] border-b-0 rounded-t-[20px]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.type === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.type === "bot" && (
                  <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full overflow-hidden">
                    <img
                      src={BotImg}
                      alt="Bot"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}

                <div
                  className={cn(
                    "flex max-w-[520px] flex-col gap-1 rounded-[12px] px-4 py-2 shadow-sm",
                    message.type === "bot"
                      ? "bg-[#F0F0F0]"
                      : "bg-[#d1ffe3]"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-[11px] text-gray-500">
                    {message.timestamp}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-[#CFCFCF] px-3 py-2 bg-white rounded-b-[20px]">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 rounded-[10px] border border-[#CFCFCF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isSending}
            />
            <button
              onClick={handleSend}
              className="flex h-8 items-center gap-1 px-3 rounded-[10px] bg-green-900 hover:bg-green-600 disabled:opacity-50"
              disabled={!inputValue.trim() || isSending}
            >
              <img src={SendImg} alt="Send" className="w-4 h-4" />
              <span className="text-sm font-medium text-white">
                {isSending ? "Sending..." : "Send"}
              </span>
            </button>
          </div>

          <p className="px-3 pb-2 pt-1 text-center text-xs text-[#565656]">
            IskoBot answers scholarship-related questions only.
          </p>
        </div>

        <ChatHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
        />
      </div>
    </Layout>
  );
}
