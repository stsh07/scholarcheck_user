// src/pages/AIAssistantPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "../components/Layout";
import SendImg from "../img/Sent.png";
import BotImg from "../img/Chatbot.png";
import AIHistoryPanel, {
  type AIHistoryItem,
} from "../components/AIHistoryPanel";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface Message {
  id: string;
  type: "bot" | "user";
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

const API_BASE =
  (import.meta as any).env?.VITE_API_URL?.toString()?.trim() ||
  "http://localhost:8000";

const CONVERSATIONS_KEY = "scholarcheck_ai_conversations";
const ACTIVE_CONVERSATION_KEY = "scholarcheck_ai_active_conversation_id";

function nowTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function createWelcomeMessage(): Message {
  return {
    id: `msg_${Date.now()}`,
    type: "bot",
    content:
      "Hello! I'm your scholarship assistant. I can help you understand scholarship requirements, improve your eligibility, and answer questions about the application process. How can I assist you today?",
    timestamp: nowTime(),
  };
}

function createNewConversation(): Conversation {
  const nowIso = new Date().toISOString();

  return {
    id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: "New Chat",
    createdAt: nowIso,
    updatedAt: nowIso,
    messages: [createWelcomeMessage()],
  };
}

function truncateTitle(text: string, max = 60) {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}...`;
}

function formatDateLabel(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getGroupLabel(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return "TODAY";
  if (isSameDay(date, yesterday)) return "YESTERDAY";

  return date
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

export default function AIAssistantPage() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(CONVERSATIONS_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Conversation[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (error) {
        console.error("Failed to parse saved conversations:", error);
      }
    }

    return [createNewConversation()];
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    const savedActiveId = localStorage.getItem(ACTIVE_CONVERSATION_KEY);

    if (savedActiveId) return savedActiveId;

    const savedConversations = localStorage.getItem(CONVERSATIONS_KEY);
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations) as Conversation[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0].id;
        }
      } catch {
        // ignore
      }
    }

    const initial = createNewConversation();
    return initial.id;
  });

  const [inputValue, setInputValue] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversations.length) {
      const fresh = createNewConversation();
      setConversations([fresh]);
      setActiveConversationId(fresh.id);
      return;
    }

    const exists = conversations.some((conv) => conv.id === activeConversationId);
    if (!exists) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  useEffect(() => {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem(ACTIVE_CONVERSATION_KEY, activeConversationId);
    }
  }, [activeConversationId]);

  const activeConversation =
    conversations.find((conv) => conv.id === activeConversationId) ||
    conversations[0];

  const messages = activeConversation?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConversationId]);

  const updateActiveConversation = (
    updater: (conversation: Conversation) => Conversation
  ) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === activeConversationId
          ? updater(conversation)
          : conversation
      )
    );
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
    if (!text || isSending || !activeConversation) return;

    const nowIso = new Date().toISOString();

    const userMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: "user",
      content: text,
      timestamp: nowTime(),
    };

    const typingId = `msg_${Date.now() + 1}_${Math.random()
      .toString(36)
      .slice(2, 7)}`;

    const typingMsg: Message = {
      id: typingId,
      type: "bot",
      content: "Typing...",
      timestamp: nowTime(),
    };

    const shouldSetTitle = activeConversation.title === "New Chat";

    updateActiveConversation((conversation) => ({
      ...conversation,
      title: shouldSetTitle ? truncateTitle(text) : conversation.title,
      updatedAt: nowIso,
      messages: [...conversation.messages, userMsg, typingMsg],
    }));

    setInputValue("");
    setIsSending(true);

    try {
      const answer = await callChatApi(text);

      updateActiveConversation((conversation) => ({
        ...conversation,
        updatedAt: new Date().toISOString(),
        messages: conversation.messages.map((message) =>
          message.id === typingId ? { ...message, content: answer } : message
        ),
      }));
    } catch {
      updateActiveConversation((conversation) => ({
        ...conversation,
        updatedAt: new Date().toISOString(),
        messages: conversation.messages.map((message) =>
          message.id === typingId
            ? {
                ...message,
                content:
                  "⚠️ Cannot connect to IskoBot backend. Make sure FastAPI is running on http://localhost:8000.",
              }
            : message
        ),
      }));
    } finally {
      setIsSending(false);
    }
  };

  const handleNewChat = () => {
    const newConversation = createNewConversation();

    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setInputValue("");
    setIsHistoryOpen(false);
  };

  const handleSelectHistory = (item: AIHistoryItem) => {
    setActiveConversationId(item.id);
    setInputValue("");
    setIsHistoryOpen(false);
  };

  const handleDeleteConversation = (item: AIHistoryItem) => {
    const remaining = conversations.filter(
      (conversation) => conversation.id !== item.id
    );

    if (remaining.length === 0) {
      const fresh = createNewConversation();
      setConversations([fresh]);
      setActiveConversationId(fresh.id);
      setInputValue("");
      return;
    }

    setConversations(remaining);

    if (item.id === activeConversationId) {
      setActiveConversationId(remaining[0].id);
      setInputValue("");
    }
  };

  const historyItems = useMemo<AIHistoryItem[]>(() => {
    return [...conversations]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .map((conversation) => ({
        id: conversation.id,
        title: conversation.title || "New Chat",
        date: formatDateLabel(conversation.updatedAt),
        group: getGroupLabel(conversation.updatedAt),
        active: conversation.id === activeConversationId,
      }));
  }, [conversations, activeConversationId]);

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] bg-[#eef8f1]">
        <div className="px-1 pb-5 pt-4 md:px-1 md:pt-5">
          {/* Header */}
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-[26px] font-bold text-gray-900">
                AI Scholarship Assistant
              </h1>

              <p className="mt-1 text-[14px] text-gray-600">
                Get personalized guidance and answers to your questions
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleNewChat}
                className="flex items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-green-800 active:scale-95"
                type="button"
              >
                <span className="text-[16px] leading-none">+</span>
                <span>New Chat</span>
              </button>

              <button
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-green-800 active:scale-95"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path d="M12 8v4l3 3" />
                  <path d="M3.05 11a9 9 0 1 1 .5 4" />
                  <path d="M3 4v5h5" />
                </svg>
                <span>History</span>
              </button>
            </div>
          </div>

          {/* Chat Card */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex h-[70vh] min-h-[550px] flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-6 md:px-5">
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
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100">
                            <img
                              src={BotImg}
                              alt="Bot"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}

                        <div
                          className={cn(
                            "max-w-[420px] rounded-xl px-4 py-3",
                            isUser
                              ? "bg-emerald-100 text-gray-900"
                              : "bg-gray-100 text-gray-800"
                          )}
                        >
                          <p className="text-[14px] leading-relaxed">
                            {message.content}
                          </p>

                          <div className="mt-2 text-[11px] text-gray-500">
                            {message.timestamp}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask me anything about the Alagang Arenas Scholarship..."
                    disabled={isSending}
                    className="h-11 flex-1 rounded-md border border-gray-200 bg-white px-4 text-sm outline-none focus:border-green-600"
                  />

                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isSending}
                    className="flex h-11 items-center gap-2 rounded-md bg-green-800 px-5 text-sm font-semibold text-white hover:bg-green-900 disabled:opacity-50"
                    type="button"
                  >
                    <img src={SendImg} alt="" className="h-4 w-4" />
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </div>

                <p className="mt-3 text-center text-[11px] text-gray-500">
                  IskoBot only provides information about scholarship from
                  Alagang Arenas. Check important info.
                </p>
              </div>
            </div>
          </div>

          <AIHistoryPanel
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            items={historyItems}
            onSelect={handleSelectHistory}
            onDelete={handleDeleteConversation}
          />
        </div>
      </div>
    </Layout>
  );
}