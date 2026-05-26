"use client";

import { Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface DocumentAnalysisLoaderProps {
  filename?: string;
}

const DocumentAnalysisLoader = ({ filename }: DocumentAnalysisLoaderProps) => {
  const { t } = useLanguage();

  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-12"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-brand-cyan/20 to-brand-blue/20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
      <p className="text-lg font-semibold text-brand-dark md:text-xl">
        {t("demo.parsing")}
      </p>
      {filename && (
        <p className="mt-2 max-w-sm truncate text-sm font-medium text-brand-dark">
          {filename}
        </p>
      )}
      <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
        {t("demoPage.analyzingHint")}
      </p>
    </div>
  );
};

export default DocumentAnalysisLoader;
