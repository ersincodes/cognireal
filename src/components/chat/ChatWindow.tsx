"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { X, Send, Trash2, RotateCcw } from "lucide-react";
import type { ChatMessage as ChatMessageType, WizardState } from "@/types/chat";
import ChatMessage from "./ChatMessage";
import WizardMessage from "./WizardMessage";
import {
  WIZARD_QUESTIONS,
  getAnswerLabel,
} from "@/lib/wizard";
import { useLanguage } from "@/i18n/LanguageContext";

interface ChatWindowProps {
  isOpen: boolean;
  messages: ChatMessageType[];
  isLoading: boolean;
  error: string | null;
  wizardState: WizardState;
  onClose: () => void;
  onSendMessage: (content: string) => Promise<void>;
  onClearChat: () => void;
  onFeedback: (messageId: string, feedback: "up" | "down" | null) => void;
  onAnswerWizard: (answerId: string, customValue?: string) => void;
  onResetWizard: () => void;
}

const ChatWindow = ({
  isOpen,
  messages,
  isLoading,
  error,
  wizardState,
  onClose,
  onSendMessage,
  onClearChat,
  onFeedback,
  onAnswerWizard,
  onResetWizard,
}: ChatWindowProps) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useLanguage();

  const isWizardComplete = wizardState.isComplete;
  const currentQuestion = WIZARD_QUESTIONS[wizardState.currentStep];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Scroll to bottom when messages or wizard step changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, wizardState.currentStep, scrollToBottom]);

  // Focus input when chat opens and wizard is complete
  useEffect(() => {
    if (isOpen && isWizardComplete) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isWizardComplete]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isLoading) return;

    setInputValue("");
    // Fire and forget - state updates will trigger re-renders
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
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // Build display messages based on wizard state
  const buildDisplayMessages = (): ChatMessageType[] => {
    const displayMessages: ChatMessageType[] = [];

    // Always show intro message first (using translated text)
    displayMessages.push({
      id: "wizard-intro",
      role: "assistant",
      content: t("wizard.intro"),
      timestamp: 0,
    });

    // Show answered questions as conversation
    wizardState.answers.forEach((answer, index) => {
      const question = WIZARD_QUESTIONS[index];
      if (question) {
        // Show question as assistant message (using translated text)
        displayMessages.push({
          id: `wizard-q-${index}`,
          role: "assistant",
          content: t(`wizard.questions.${question.id}.question`),
          timestamp: index + 1,
        });
        // Show answer as user message (using translated option label)
        const translatedAnswer = answer.customValue || t(`wizard.questions.${question.id}.options.${answer.answerId}`);
        displayMessages.push({
          id: `wizard-a-${index}`,
          role: "user",
          content: translatedAnswer,
          timestamp: index + 2,
        });
      }
    });

    // If wizard is complete, show completion message and chat messages
    if (isWizardComplete) {
      // Get translated labels for industry and challenge
      const industryAnswer = wizardState.answers.find(a => a.questionId === "industry");
      const challengeAnswer = wizardState.answers.find(a => a.questionId === "challenge");
      
      const industryLabel = industryAnswer?.customValue || 
        (industryAnswer ? t(`wizard.questions.industry.options.${industryAnswer.answerId}`) : "");
      const challengeLabel = challengeAnswer ? 
        t(`wizard.questions.challenge.options.${challengeAnswer.answerId}`) : "";
      
      displayMessages.push({
        id: "wizard-complete",
        role: "assistant",
        content: t("wizard.completion", { industry: industryLabel, challenge: challengeLabel }),
        timestamp: 100,
      });
      // Add actual chat messages
      messages.forEach((msg) => {
        displayMessages.push(msg);
      });
    }

    return displayMessages;
  };

  const displayMessages = buildDisplayMessages();

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-40 right-6 z-50 flex h-[min(550px,calc(100vh-180px))] w-[min(400px,calc(100vw-48px))] flex-col rounded-2xl bg-white shadow-2xl"
      role="dialog"
      aria-label="Chat with Business Analyst Assistant"
      aria-modal="true"
    >
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-brand-blue to-brand-cyan px-4 py-3">
        <div className="flex flex-col">
          <h2 className="text-base font-semibold text-white">
            {t("chat.title")}
          </h2>
          <p className="text-xs text-white/80">
            {isWizardComplete ? t("chat.statusReady") : t("chat.statusOnboarding")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isWizardComplete && (
            <button
              onClick={onResetWizard}
              className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              aria-label={t("chat.changeContext")}
              title={t("chat.changeContext")}
              tabIndex={0}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
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

      {/* Messages area */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          {displayMessages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onFeedback={
                message.role === "assistant" &&
                !message.id.startsWith("wizard-")
                  ? (feedback) => onFeedback(message.id, feedback)
                  : undefined
              }
            />
          ))}
          {/* Show current wizard question if not complete */}
          {!isWizardComplete && currentQuestion && (
            <WizardMessage
              question={currentQuestion}
              currentStep={wizardState.currentStep}
              totalSteps={WIZARD_QUESTIONS.length}
              onAnswer={onAnswerWizard}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="shrink-0 mx-4 mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Input area - only show when wizard is complete */}
      {isWizardComplete ? (
        <form
          onSubmit={handleSubmit}
          className="shrink-0 flex items-end gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3"
        >
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={t("chat.placeholder")}
            className="max-h-[120px] min-h-[44px] flex-1 resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-brand-dark placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            rows={1}
            disabled={isLoading}
            aria-label="Type your message"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white transition-all hover:bg-brand-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("chat.sendMessage")}
            tabIndex={0}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      ) : (
        <div className="shrink-0 border-t border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-center text-xs text-gray-500">
            {t("chat.footerText")}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
