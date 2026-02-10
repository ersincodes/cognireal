"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const socialNetworks = [
    { key: "linkedin", label: t("footer.linkedin") },
    { key: "twitter", label: t("footer.twitter") },
    { key: "instagram", label: t("footer.instagram") },
  ];

  return (
    <footer
      id="footer"
      className="mt-auto border-t border-white/60 bg-brand-card/80 px-4 py-10 text-brand-muted">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 text-center text-sm md:flex-row md:text-left">
        <p className="text-brand-dark">
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </p>
        <div className="flex gap-6">
          {socialNetworks.map((network) => (
            <Link
              key={network.key}
              href="#"
              className="text-brand-muted transition hover:text-brand-dark">
              {network.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}