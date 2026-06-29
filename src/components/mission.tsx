"use client";

import { useLanguage } from "@/i18n/LanguageContext";
import { openCalendlyPopup } from "@/lib/demo/calendly";

export default function Mission() {
  const { t } = useLanguage();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openCalendlyPopup();
  };

  return (
    <section className="flex justify-center px-4 pb-24">
      <div className="w-full max-w-4xl rounded-[40px] border border-brand-blue/15 bg-white p-12 text-center shadow-[0_25px_80px_rgba(8,10,20,0.08)]">
        <h2 className="text-4xl font-semibold text-brand-dark md:text-5xl">
          {t("mission.heading")}
        </h2>
        <p className="mt-4 text-lg text-brand-muted">
          {t("mission.description")}
        </p>
        <button
          onClick={handleClick}
          className="mt-8 inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-brand-cyan to-brand-blue px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-8 sm:py-3 sm:text-base md:text-lg">
          {t("mission.button")}
        </button>
      </div>
    </section>
  );
}
