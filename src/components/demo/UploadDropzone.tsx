"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, Paperclip, Upload } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { ACCEPTED_FILE_TYPES } from "@/lib/demo/uploadLimits";

interface UploadDropzoneProps {
  onFileSelect: (file: File) => Promise<void>;
}

const UploadDropzone = ({ onFileSelect }: UploadDropzoneProps) => {
  const { t } = useLanguage();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;
      await onFileSelect(file);
    },
    [onFileSelect]
  );

  return (
    <div
      className={`relative flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 transition-colors ${
        isDragOver
          ? "border-brand-cyan bg-brand-cyan/5"
          : "border-gray-200 bg-white"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        void handleFile(e.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
        aria-hidden="true"
      />

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-brand-cyan/20 to-brand-blue/20">
        <Upload className="h-8 w-8 text-brand-blue" />
      </div>
      <h2 className="text-xl font-semibold text-brand-dark md:text-2xl">
        {t("demoPage.empty.uploadCTA")}
      </h2>
      <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
        {t("demoPage.empty.supportedTypes")}
      </p>
      <p className="mt-1 text-center text-xs text-gray-400">
        {t("demoPage.empty.dragHint")}
      </p>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-cyan to-brand-blue px-6 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
      >
        <Paperclip className="h-4 w-4" />
        {t("demo.uploadDocument")}
      </button>
      <p className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
        <FileText className="h-3.5 w-3.5" />
        {t("demo.privacy")}
      </p>
    </div>
  );
};

export default UploadDropzone;
