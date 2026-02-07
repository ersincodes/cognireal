"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { X, Send, Trash2 } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/types/chat";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

interface ChatWindowProps {
  isOpen: boolean;
  messages: ChatMessageType[];
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onSendMessage: (content: string) => Promise<void>;
  onClearChat: () => void;
  onFeedback: (messageId: string, feedback: "up" | "down" | null) => void;
}

const WELCOME_MESSAGE = `Hello! I'm your Business Analyst Assistant, specializing in plastic manufacturing operations.

I can help you with:
• **OEE optimization** and scrap reduction
• **Digital transformation** roadmaps
• **MES/ERP/APS** system guidance
• **AI/ML applications** for manufacturing
• Process improvement strategies

How can I assist you today?`;

const ChatWindow = ({
  isOpen,
  messages,
  isLoading,
  error,
  onClose,
  onSendMessage,
  onClearChat,
  onFeedback,
}: ChatWindowProps) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isLoading) return;

    setInputValue("");
    await onSendMessage(trimmedValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // Create display messages including welcome message
  const displayMessages: ChatMessageType[] = [
    {
      id: "welcome",
      role: "assistant",
      content: WELCOME_MESSAGE,
      timestamp: 0,
    },
    ...messages,
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-40 right-6 z-50 flex h-[min(550px,calc(100vh-180px))] w-[min(400px,calc(100vw-48px))] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      role="dialog"
      aria-label="Chat with Business Analyst Assistant"
      aria-modal="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-brand-blue to-brand-cyan px-4 py-3">
        <div className="flex flex-col">
          <h2 className="text-base font-semibold text-white">
            Business Analyst Assistant
          </h2>
          <p className="text-xs text-white/80">Plastic Manufacturing Expert</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClearChat}
            className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Clear chat history"
            tabIndex={0}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Close chat"
            tabIndex={0}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          {displayMessages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onFeedback={
                message.role === "assistant" && message.id !== "welcome"
                  ? (feedback) => onFeedback(message.id, feedback)
                  : undefined
              }
            />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3"
      >
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about plastic manufacturing..."
          className="max-h-[120px] min-h-[44px] flex-1 resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-brand-dark placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          rows={1}
          disabled={isLoading}
          aria-label="Type your message"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white transition-all hover:bg-brand-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
          tabIndex={0}
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
