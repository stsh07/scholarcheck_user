import { useState, useRef, useEffect } from "react";
import { Layout } from "../components/Layout";
import SendImg from "../img/Sent.png";
import BotImg from "../img/Chatbot.png";

export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface Message {
  id: string;
  type: "bot" | "user";
  content: string;
  timestamp: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hello! I'm IskoBot, your scholarship assistant. I can help you understand scholarship requirements, improve your eligibility, and answer questions about the application process. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content:
          "Thank you for your question. I'm here to help you with scholarship-related inquiries.",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">AI Scholarship Assistant</h1>
        <p className="text-lg text-gray-600">
          Get personalized guidance and answers to your questions
        </p>
      </div>

      {/* Chat container */}
      <div className="flex flex-col rounded-[20px] bg-white shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] h-[475px] overflow-hidden">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white border border-[#CFCFCF] border-b-0 rounded-t-[20px]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.type === "user" ? "justify-end" : "justify-start"
              )}
            >
              {/* Bot Avatar */}
              {message.type === "bot" && (
                <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full overflow-hidden">
                  <img
                    src={BotImg}
                    alt="Bot"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              {/* Message bubble */}
              <div
                className={cn(
                  "flex max-w-[520px] flex-col gap-1 rounded-[12px] px-4 py-2 shadow-sm",
                  message.type === "bot"
                    ? "bg-[#F0F0F0] text-black"
                    : "bg-[#D1E8FF] text-black"
                )}
              >
                <p className="text-sm font-normal">{message.content}</p>
                <span className="text-[11px] text-gray-500">
                  {message.timestamp}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex items-center gap-2 border-t border-[#CFCFCF] px-3 py-2 bg-white rounded-b-[20px]">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 rounded-[10px] border border-[#CFCFCF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSend}
            className="flex h-8 items-center gap-1 px-3 rounded-[10px] bg-green-900 hover:bg-green-600"
            disabled={!inputValue.trim()}
          >
            <img src={SendImg} alt="Send" className="w-4 h-4" />
            <span className="text-sm font-medium text-white">Send</span>
          </button>
        </div>

        {/* Disclaimer */}
        <p className="px-3 pb-2 pt-1 text-center text-xs text-[#565656]">
          IskoBot can make mistakes. Check important info.
        </p>
      </div>
    </Layout>
  );
}
