"use client";

import { MessageCircle, X } from "lucide-react";

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const ChatButton = ({ isOpen, onClick }: ChatButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
      aria-label={isOpen ? "Close chat" : "Open chat assistant"}
      aria-expanded={isOpen}
      tabIndex={0}
    >
      <span
        className={`absolute transition-all duration-300 ${
          isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
        }`}
      >
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      </span>
      <span
        className={`absolute transition-all duration-300 ${
          isOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
        }`}
      >
        <X className="h-6 w-6" aria-hidden="true" />
      </span>
    </button>
  );
};

export default ChatButton;
