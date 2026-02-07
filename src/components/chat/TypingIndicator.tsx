"use client";

import { Bot } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="flex w-full gap-3">
      {/* Avatar */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan text-white"
        aria-hidden="true"
      >
        <Bot className="h-4 w-4" />
      </div>

      {/* Typing dots */}
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3">
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
          style={{ animationDelay: "300ms" }}
        />
        <span className="sr-only">Assistant is typing...</span>
      </div>
    </div>
  );
};

export default TypingIndicator;
