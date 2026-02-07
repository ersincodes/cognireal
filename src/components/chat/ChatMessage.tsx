"use client";

import { ThumbsUp, ThumbsDown, Bot, User } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
  onFeedback?: (feedback: "up" | "down" | null) => void;
}

const ChatMessage = ({ message, onFeedback }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const handleFeedbackClick = (feedback: "up" | "down") => {
    if (!onFeedback) return;
    // Toggle feedback if clicking the same button
    if (message.feedback === feedback) {
      onFeedback(null);
    } else {
      onFeedback(feedback);
    }
  };

  return (
    <div
      className={`flex w-full gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-brand-blue text-white"
            : "bg-gradient-to-r from-brand-blue to-brand-cyan text-white"
        }`}
        aria-hidden="true"
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message content */}
      <div
        className={`flex max-w-[80%] flex-col gap-1 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isUser
              ? "rounded-br-md bg-brand-blue text-white"
              : "rounded-bl-md bg-gray-100 text-brand-dark"
          }`}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
        </div>

        {/* Feedback buttons for assistant messages */}
        {isAssistant && onFeedback && (
          <div className="flex gap-1 px-1">
            <button
              onClick={() => handleFeedbackClick("up")}
              className={`rounded p-1 transition-colors ${
                message.feedback === "up"
                  ? "bg-green-100 text-green-600"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              }`}
              aria-label="Helpful response"
              aria-pressed={message.feedback === "up"}
              tabIndex={0}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleFeedbackClick("down")}
              className={`rounded p-1 transition-colors ${
                message.feedback === "down"
                  ? "bg-red-100 text-red-600"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              }`}
              aria-label="Not helpful response"
              aria-pressed={message.feedback === "down"}
              tabIndex={0}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
