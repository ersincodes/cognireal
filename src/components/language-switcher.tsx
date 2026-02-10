"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { locales, type Locale } from "@/i18n/config";

// SVG Flag components that work on all platforms
const FlagUS = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <path fill="#bd3d44" d="M0 0h640v480H0"/>
    <path stroke="#fff" strokeWidth="37" d="M0 55.3h640M0 129h640M0 203h640M0 277h640M0 351h640M0 425h640"/>
    <path fill="#192f5d" d="M0 0h364.8v258.5H0"/>
    <marker id="us-star" markerHeight="12" markerWidth="12" viewBox="0 0 12 12">
      <path fill="#fff" d="M6 0l1.9 5.8H14l-4.7 3.4 1.8 5.8L6 11.6.9 15l1.8-5.8L-2 5.8h6.1z"/>
    </marker>
    <g fill="#fff">
      {[0,1,2,3,4,5,6,7,8].map(row => 
        [0,1,2,3,4,5].slice(0, row % 2 === 0 ? 6 : 5).map(col => (
          <circle key={`${row}-${col}`} cx={30.4 + (row % 2 === 0 ? col * 60.8 : 30.4 + col * 60.8)} cy={27 + row * 25.7} r="10"/>
        ))
      )}
    </g>
  </svg>
);

const FlagES = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <path fill="#c60b1e" d="M0 0h640v480H0z"/>
    <path fill="#ffc400" d="M0 120h640v240H0z"/>
  </svg>
);

const FlagDE = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <path fill="#ffce00" d="M0 320h640v160H0z"/>
    <path fill="#000" d="M0 0h640v160H0z"/>
    <path fill="#d00" d="M0 160h640v160H0z"/>
  </svg>
);

const FlagIcon = ({ locale, className }: { locale: Locale; className?: string }) => {
  switch (locale) {
    case "en":
      return <FlagUS className={className} />;
    case "es":
      return <FlagES className={className} />;
    case "de":
      return <FlagDE className={className} />;
    default:
      return null;
  }
};

const LanguageSwitcher = () => {
  const { locale, setLocale, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Short locale codes for display
  const localeShortCodes: Record<Locale, string> = {
    en: "EN",
    es: "ES",
    de: "DE",
  };

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback(
    (newLocale: Locale) => {
      setLocale(newLocale);
      setIsOpen(false);
      buttonRef.current?.focus();
    },
    [setLocale]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
        return;
      }

      if (!isOpen) {
        if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      const currentIndex = locales.indexOf(locale);

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % locales.length;
        handleSelect(locales[nextIndex]);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + locales.length) % locales.length;
        handleSelect(locales[prevIndex]);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setIsOpen(false);
      }
    },
    [isOpen, locale, handleSelect]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t("languageSwitcher.label")}
        className="flex items-center gap-1.5 text-sm font-medium text-brand-muted transition-colors duration-200 hover:text-brand-dark focus-visible:outline-none focus-visible:text-brand-dark"
      >
        <FlagIcon locale={locale} className="h-4 w-5 rounded-sm shadow-sm" />
        <span>{localeShortCodes[locale]}</span>
      </button>

      {/* Dropdown Menu */}
      <div
        role="listbox"
        aria-label={t("languageSwitcher.label")}
        aria-activedescendant={`lang-option-${locale}`}
        className={`absolute right-0 top-full z-50 mt-2 origin-top-right rounded-lg border border-brand-dark/10 bg-white p-1 shadow-lg transition-all duration-200 ${
          isOpen
            ? "visible scale-100 opacity-100"
            : "invisible scale-95 opacity-0"
        }`}
      >
        {locales.map((localeOption) => {
          const isSelected = localeOption === locale;
          return (
            <button
              key={localeOption}
              id={`lang-option-${localeOption}`}
              role="option"
              aria-selected={isSelected}
              onClick={() => handleSelect(localeOption)}
              className={`flex w-full items-center justify-center rounded-md px-2.5 py-1.5 transition-colors duration-150 ${
                isSelected
                  ? "bg-brand-blue/10"
                  : "hover:bg-gray-50"
              }`}
            >
              <FlagIcon locale={localeOption} className="h-4 w-5 rounded-sm shadow-sm" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
