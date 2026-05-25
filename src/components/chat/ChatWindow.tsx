"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { X, Send, Trash2, Paperclip, FileText, Loader2 } from "lucide-react";
import type {
  ChatMessage as ChatMessageType,
  DocumentAttachment,
} from "@/types/chat";
import ChatMessage from "./ChatMessage";
import { useLanguage } from "@/i18n/LanguageContext";
import { ACCEPTED_FILE_TYPES } from "@/lib/demo/uploadLimits";

interface ChatWindowProps {
  isOpen: boolean;
  messages: ChatMessageType[];
  isLoading: boolean;
  error: string | null;
  documentAttachment: DocumentAttachment | null;
  isParsingDocument: boolean;
  onClose: () => void;
  onSendMessage: (content: string) => Promise<void>;
  onClearChat: () => void;
  onFeedback: (messageId: string, feedback: "up" | "down" | null) => void;
  onAttachDocument: (file: File) => Promise<void>;
  onClearDocument: () => void;
}

const SAMPLE_PROMPT_KEYS = ["summarize", "keyNumbers", "actionItems"] as const;

const ChatWindow = ({
  isOpen,
  messages,
  isLoading,
  error,
  documentAttachment,
  isParsingDocument,
  onClose,
  onSendMessage,
  onClearChat,
  onFeedback,
  onAttachDocument,
  onClearDocument,
}: ChatWindowProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, documentAttachment, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isLoading || isParsingDocument) return;

    setInputValue("");
    onSendMessage(trimmedValue).catch((err) => {
      console.error("Failed to send message:", err);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleFileSelection = useCallback(
    async (file: File | null | undefined) => {
      if (!file || isParsingDocument) return;
      await onAttachDocument(file);
    },
    [isParsingDocument, onAttachDocument]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    void handleFileSelection(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    void handleFileSelection(file);
  };

  const handleSamplePrompt = (key: (typeof SAMPLE_PROMPT_KEYS)[number]) => {
    const prompt = t(`demo.samplePrompts.${key}`);
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  const buildDisplayMessages = (): ChatMessageType[] => {
    const displayMessages: ChatMessageType[] = [];

    if (messages.length === 0) {
      displayMessages.push({
        id: "welcome",
        role: "assistant",
        content: t("demo.welcome"),
        timestamp: 0,
      });
    }

    displayMessages.push(...messages);
    return displayMessages;
  };

  const displayMessages = buildDisplayMessages();

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-40 right-6 z-50 flex h-[min(550px,calc(100vh-180px))] w-[min(400px,calc(100vw-48px))] flex-col rounded-2xl bg-white shadow-2xl"
      role="dialog"
      aria-label={t("chat.ariaLabel")}
      aria-modal="true"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-brand-cyan bg-brand-cyan/10">
          <p className="rounded-full bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow">
            {t("demo.dropzone")}
          </p>
        </div>
      )}

      <div className="shrink-0 flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-brand-blue to-brand-cyan px-4 py-3">
        <div className="flex flex-col">
          <h2 className="text-base font-semibold text-white">{t("chat.title")}</h2>
          <p className="text-xs text-white/80">{t("chat.statusReady")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClearChat}
            className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label={t("chat.clearHistory")}
            tabIndex={0}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label={t("chat.closeChat")}
            tabIndex={0}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
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
          <div ref={messagesEndRef} />
        </div>
      </div>

      {error && (
        <div className="shrink-0 mx-4 mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="shrink-0 border-t border-gray-100 bg-gray-50 px-4 py-3">
        <p className="mb-2 text-xs text-gray-500">{t("demo.privacy")}</p>

        {(documentAttachment || isParsingDocument) && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-brand-cyan/30 bg-white px-3 py-2">
            {isParsingDocument ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-brand-blue" />
                <span className="text-sm text-gray-600">{t("demo.parsing")}</span>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 shrink-0 text-brand-blue" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brand-dark">
                    {documentAttachment?.filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("demo.documentReady", {
                      chars: documentAttachment?.charCount ?? 0,
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClearDocument}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label={t("demo.removeDocument")}
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        )}

        {documentAttachment && messages.length === 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {SAMPLE_PROMPT_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSamplePrompt(key)}
                className="rounded-full border border-brand-cyan/40 bg-white px-3 py-1 text-xs font-medium text-brand-dark transition-colors hover:border-brand-blue hover:bg-brand-cyan/10"
              >
                {t(`demo.samplePrompts.${key}`)}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            className="hidden"
            onChange={handleFileInputChange}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isParsingDocument}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-brand-blue transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("demo.uploadDocument")}
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={t("chat.placeholder")}
            className="max-h-[120px] min-h-[44px] flex-1 resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-brand-dark placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            rows={1}
            disabled={isLoading || isParsingDocument}
            aria-label="Type your message"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || isParsingDocument}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white transition-all hover:bg-brand-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("chat.sendMessage")}
            tabIndex={0}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
