"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  locales,
  defaultLocale,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "./config";
import en from "./messages/en.json";
import es from "./messages/es.json";
import de from "./messages/de.json";

type Messages = typeof en;

const messages: Record<Locale, Messages> = {
  en,
  es,
  de,
};

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  messages: Messages;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

type LanguageProviderProps = {
  children: ReactNode;
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load locale from localStorage on mount
  useEffect(() => {
    const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale;
    if (storedLocale && locales.includes(storedLocale)) {
      setLocaleState(storedLocale);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split("-")[0] as Locale;
      if (locales.includes(browserLang)) {
        setLocaleState(browserLang);
        localStorage.setItem(LOCALE_STORAGE_KEY, browserLang);
      }
    }
    setIsHydrated(true);
  }, []);

  // Update document lang attribute when locale changes
  useEffect(() => {
    if (isHydrated) {
      document.documentElement.lang = locale;
    }
  }, [locale, isHydrated]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  }, []);

  // Translation function with parameter interpolation
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split(".");
      let value: unknown = messages[locale];

      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          // Fallback to English if key not found
          value = messages.en;
          for (const fallbackKey of keys) {
            if (value && typeof value === "object" && fallbackKey in value) {
              value = (value as Record<string, unknown>)[fallbackKey];
            } else {
              return key; // Return key if not found
            }
          }
          break;
        }
      }

      if (typeof value !== "string") {
        return key;
      }

      // Replace parameters like {year}, {count}, etc.
      if (params) {
        return Object.entries(params).reduce(
          (result, [paramKey, paramValue]) =>
            result.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue)),
          value
        );
      }

      return value;
    },
    [locale]
  );

  const contextValue: LanguageContextType = {
    locale,
    setLocale,
    t,
    messages: messages[locale],
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export default LanguageContext;
