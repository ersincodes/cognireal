"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import type { WizardQuestion } from "@/types/chat";
import { useLanguage } from "@/i18n/LanguageContext";

interface WizardMessageProps {
  question: WizardQuestion;
  currentStep: number;
  totalSteps: number;
  onAnswer: (answerId: string, customValue?: string) => void;
}

const WizardMessage = ({
  question,
  currentStep,
  totalSteps,
  onAnswer,
}: WizardMessageProps) => {
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleOptionClick = (optionId: string, allowCustom?: boolean) => {
    if (allowCustom) {
      setSelectedOptionId(optionId);
      setShowCustomInput(true);
      return;
    }
    onAnswer(optionId);
  };

  const handleCustomSubmit = () => {
    if (!selectedOptionId) return;
    const trimmedInput = customInput.trim();
    onAnswer(selectedOptionId, trimmedInput || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCustomSubmit();
    }
  };

  return (
    <div className="flex w-full gap-3">
      {/* Avatar */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan text-white"
        aria-hidden="true"
      >
        <Bot className="h-4 w-4" />
      </div>

      {/* Message content */}
      <div className="flex max-w-[85%] flex-col gap-3">
        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  index < currentStep
                    ? "bg-brand-blue"
                    : index === currentStep
                      ? "bg-brand-cyan"
                      : "bg-gray-200"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {t("wizard.stepProgress", { current: currentStep + 1, total: totalSteps })}
          </span>
        </div>

        {/* Question */}
        <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-2.5 text-brand-dark">
          <p className="text-sm font-medium leading-relaxed">
            {t(`wizard.questions.${question.id}.question`)}
          </p>
        </div>

        {/* Options */}
        {!showCustomInput ? (
          <div className="flex flex-wrap gap-2">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id, option.allowCustom)}
                className="rounded-xl border border-brand-blue/30 bg-white px-3 py-2 text-sm text-brand-dark transition-all hover:border-brand-blue hover:bg-brand-blue/5 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                tabIndex={0}
                aria-label={`Select ${t(`wizard.questions.${question.id}.options.${option.id}`)}`}
              >
                {t(`wizard.questions.${question.id}.options.${option.id}`)}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">
              {t("wizard.customInputLabel")}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("wizard.customInputPlaceholder")}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-brand-dark placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                autoFocus
                aria-label="Custom industry input"
              />
              <button
                onClick={handleCustomSubmit}
                className="rounded-xl bg-brand-blue px-4 py-2 text-sm text-white transition-colors hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                tabIndex={0}
                aria-label="Submit custom answer"
              >
                {t("wizard.continue")}
              </button>
            </div>
            <button
              onClick={() => {
                setShowCustomInput(false);
                setSelectedOptionId(null);
                setCustomInput("");
              }}
              className="self-start text-xs text-gray-500 hover:text-gray-700"
              tabIndex={0}
              aria-label="Go back to options"
            >
              {t("wizard.backToOptions")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WizardMessage;
