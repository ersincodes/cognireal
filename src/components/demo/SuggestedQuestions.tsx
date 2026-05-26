"use client";

import { Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface SuggestedQuestionsProps {
  suggestions: string[];
  isLoading: boolean;
  onSelect: (question: string) => void;
  disabled?: boolean;
}

const SuggestedQuestions = ({
  suggestions,
  isLoading,
  onSelect,
  disabled,
}: SuggestedQuestionsProps) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-1 py-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin text-brand-blue" />
        <span>{t("demoPage.suggestions.loading")}</span>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="mb-3">
      <p className="mb-2 text-xs font-medium text-gray-500">
        {t("demoPage.suggestionsLabel")}
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((question) => (
          <button
            key={question}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(question)}
            className="rounded-full border border-brand-cyan/40 bg-white px-3 py-1.5 text-left text-xs font-medium text-brand-dark transition-colors hover:border-brand-blue hover:bg-brand-cyan/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
