"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { openCalendlyPopup } from "@/lib/demo/calendly";
import { useDemoContext } from "./DemoProvider";

const BookACallModal = () => {
  const { t } = useLanguage();
  const { isModalOpen, dismissBookACall, closeModal } = useDemoContext();
  const bookLinkRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isModalOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setTimeout(() => bookLinkRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const handleBookACall = (e: React.MouseEvent) => {
    e.preventDefault();
    openCalendlyPopup();
    closeModal();
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.preventDefault();
    dismissBookACall();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="presentation"
      aria-hidden={false}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-a-call-title"
        className="mx-4 max-w-md rounded-2xl bg-white p-8 shadow-2xl"
        onKeyDown={(e) => {
          if (e.key === "Escape") e.preventDefault();
        }}
      >
        <p
          id="book-a-call-title"
          className="text-center text-base leading-relaxed text-brand-dark md:text-lg"
        >
          {t("demoPage.modal.prefix")}{" "}
          <button
            ref={bookLinkRef}
            type="button"
            onClick={handleBookACall}
            className="font-semibold text-brand-blue underline underline-offset-2 hover:text-brand-cyan"
          >
            {t("demoPage.modal.bookACall")}
          </button>
          {t("demoPage.modal.middle")}{" "}
          <button
            type="button"
            onClick={handleSkip}
            className="font-semibold text-brand-blue underline underline-offset-2 hover:text-brand-cyan"
          >
            {t("demoPage.modal.skip")}
          </button>
        </p>
      </div>
    </div>
  );
};

export default BookACallModal;
