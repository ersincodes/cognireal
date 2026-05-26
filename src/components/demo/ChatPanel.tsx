"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Menu, Send, Paperclip, FileText, Loader2, X } from "lucide-react";
import ChatMessage from "@/components/chat/ChatMessage";
import LanguageSwitcher from "@/components/language-switcher";
import { useLanguage } from "@/i18n/LanguageContext";
import { openCalendlyPopup } from "@/lib/demo/calendly";
import { ACCEPTED_FILE_TYPES } from "@/lib/demo/uploadLimits";
import { useDemoContext } from "./DemoProvider";
import UploadDropzone from "./UploadDropzone";
import DocumentAnalysisLoader from "./DocumentAnalysisLoader";
import SuggestedQuestions from "./SuggestedQuestions";

const ChatPanel = () => {
  const { t } = useLanguage();
  const {
    activeChat,
    isLoading,
    isParsingDocument,
    isLoadingSuggestions,
    error,
    attachDocument,
    clearDocument,
    sendMessage,
    setFeedback,
    setSidebarOpen,
  } = useDemoContext();

  const [inputValue, setInputValue] = useState("");
  const [parsingFilename, setParsingFilename] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = activeChat?.messages ?? [];
  const document = activeChat?.document;
  const suggestions = activeChat?.suggestions ?? [];
  const showUpload = !document && !isParsingDocument;

  const handleAttachDocument = useCallback(
    async (file: File) => {
      setParsingFilename(file.name);
      try {
        await attachDocument(file);
      } finally {
        setParsingFilename(null);
      }
    },
    [attachDocument]
  );
  const showSuggestions =
    document && messages.length === 0 && !isLoading;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, document, scrollToBottom]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading || isParsingDocument) return;
    setInputValue("");
    void sendMessage(trimmed);
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

  const handleSuggestionSelect = (question: string) => {
    void sendMessage(question);
  };

  const handleFileSelection = async (file: File | null | undefined) => {
    if (!file || isParsingDocument) return;
    await handleAttachDocument(file);
  };

  const handleBookACall = (e: React.MouseEvent) => {
    e.preventDefault();
    openCalendlyPopup();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f7f8fc]">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 md:hidden"
            aria-label={t("demoPage.openSidebar")}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-brand-dark">
              {activeChat?.title ?? t("demoPage.newChat")}
            </h1>
            {isParsingDocument ? (
              <p className="text-xs text-gray-500">{t("demo.parsing")}</p>
            ) : document ? (
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <FileText className="h-3.5 w-3.5 shrink-0 text-brand-blue" />
                <span className="truncate">{document.filename}</span>
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                {t("demoPage.empty.uploadCTA")}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {document && !isParsingDocument && (
            <button
              type="button"
              onClick={clearDocument}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 sm:px-3"
              aria-label={t("demo.removeDocument")}
            >
              <X className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("demo.removeDocument")}</span>
            </button>
          )}
          <LanguageSwitcher />
          <button
            type="button"
            onClick={handleBookACall}
            className="inline-flex shrink-0 cursor-pointer items-center rounded-full bg-gradient-to-r from-brand-cyan to-brand-blue px-3 py-1.5 text-xs font-medium text-white shadow-md transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 sm:px-4 sm:py-1.5 sm:text-sm"
            aria-label={t("navbar.bookCall")}
          >
            {t("navbar.bookCall")}
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-6 pb-4 md:px-8">
        {isParsingDocument ? (
          <DocumentAnalysisLoader filename={parsingFilename ?? undefined} />
        ) : showUpload ? (
          <UploadDropzone onFileSelect={handleAttachDocument} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onFeedback={
                  message.role === "assistant"
                    ? (feedback) => setFeedback(message.id, feedback)
                    : undefined
                }
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {error && (
        <div className="shrink-0 mx-4 mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 md:mx-8">
          {error}
        </div>
      )}

      {document && !isParsingDocument && (
        <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-4 md:px-8">
          <div className="mx-auto max-w-3xl">
            {showSuggestions && (
              <SuggestedQuestions
                suggestions={suggestions}
                isLoading={isLoadingSuggestions}
                onSelect={handleSuggestionSelect}
                disabled={isLoading}
              />
            )}

            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                className="hidden"
                onChange={(e) => {
                  void handleFileSelection(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isParsingDocument}
                className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-brand-blue hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 disabled:opacity-50"
                aria-label={
                  document
                    ? t("demo.changeDocument")
                    : t("demo.uploadDocument")
                }
              >
                <Paperclip className="h-5 w-5" />
                {document && (
                  <span
                    className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-blue"
                    aria-hidden="true"
                  />
                )}
              </button>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={t("chat.placeholder")}
                className="max-h-[120px] min-h-[44px] flex-1 resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-brand-dark placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue/40"
                rows={1}
                disabled={isLoading || isParsingDocument}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading || isParsingDocument}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white hover:bg-brand-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 disabled:opacity-50"
                aria-label={t("chat.sendMessage")}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
