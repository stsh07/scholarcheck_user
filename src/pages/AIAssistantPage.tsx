// src/pages/AIAssistantPage.tsx
import { useEffect, useRef, useState } from "react";
import { Layout } from "../components/Layout";
import SendImg from "../img/Sent.png";
import BotImg from "../img/Chatbot.png";
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
          "Hello! I'm your scholarship assistant. I can help you understand scholarship requirements, improve your eligibility, and answer questions about the application process. How can I assist you today?",
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

  const addMessage = (msg: Message) => setMessages((prev) => [...prev, msg]);

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
        prev.map((m) => (m.id === typingId ? { ...m, content: answer } : m))
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
      {/* Page background like the screenshot */}
      <div className="min-h-[calc(100vh-64px)] bg-emerald-50">
        {/* Header */}
        <div className="px-4 pt-6 md:px-8">
          <h1 className="text-[26px] md:text-[32px] font-bold text-gray-900">
            AI Scholarship Assistant
          </h1>

          <p className="mt-1 text-[15px] md:text-[16px] text-gray-600">
            Get personalized guidance and answers to your questions
          </p>
        </div>

        {/* Chat Card */}
        <div className="px-4 pb-8 pt-5 md:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* Use flex column so input stays pinned at bottom */}
              <div className="flex h-[70vh] min-h-[560px] flex-col md:h-[72vh]">
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-5 py-5 md:px-8 md:py-7">
                  <div className="space-y-5">
                    {messages.map((message) => {
                      const isUser = message.type === "user";

                      return (
                        <div
                          key={message.id}
                          className={cn(
                            "flex items-start gap-3",
                            isUser ? "justify-end" : "justify-start"
                          )}
                        >
                          {!isUser && (
                            <div className="mt-[2px] flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 overflow-hidden">
                              <img
                                src={BotImg}
                                alt="Bot"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}

                          <div
                            className={cn(
                              "max-w-[680px] rounded-2xl px-5 py-4 shadow-[0_1px_0_rgba(0,0,0,0.02)]",
                              isUser
                                ? "bg-emerald-100 text-gray-900"
                                : "bg-gray-100 text-gray-900"
                            )}
                          >
                            <p className="text-[14px] leading-relaxed md:text-[15px]">
                              {message.content}
                            </p>

                            <div className="mt-3 text-[12px] text-gray-500">
                              {message.timestamp}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input area */}
                <div className="border-t border-gray-200 bg-white px-4 py-4 md:px-6">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Ask me anything about the Alagang Arenas Scholarship..."
                      className="h-12 flex-1 rounded-md border border-gray-200 px-4 text-[14px] outline-none placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-50 md:text-[15px]"
                      disabled={isSending}
                    />

                    <button
                      onClick={handleSend}
                      disabled={!inputValue.trim() || isSending}
                      className="flex h-12 items-center justify-center gap-2 rounded-md bg-green-900 px-6 text-[14px] font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Send message"
                      title="Send"
                    >
                      <img src={SendImg} alt="" className="h-4 w-4" />
                      <span>{isSending ? "Sending..." : "Send"}</span>
                    </button>
                  </div>

                  <p className="mt-3 text-center text-[12px] text-gray-500">
                    IskoBot only provides information about scholarship from
                    Alagang Arenas. Check important info.
                  </p>
                </div>
              </div>
            </div>

            {/* (Optional) You can wire a button somewhere to open this modal.
                Keeping it here so your current feature still works. */}
            <ChatHistoryModal
              isOpen={isHistoryOpen}
              onClose={() => setIsHistoryOpen(false)}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}