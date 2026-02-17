"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Process() {
  const sectionRef = useRef<HTMLParagraphElement>(null);
  const { t } = useLanguage();

  // Get the translated text and split into words
  const processText = t("process.text");
  const words = processText.split(" ");

  // Define which words should have special styling (based on position/content)
  const getWordClassName = (word: string, index: number): string => {
    const lowerWord = word.toLowerCase().replace(/[,.]/, "");
    if (lowerWord === "modernize" || lowerWord === "modernizarse" || lowerWord === "modernisieren") {
      return "text-brand-cyan";
    }
    if (lowerWord === "optimize" || lowerWord === "optimizarse" || lowerWord === "optimieren") {
      return "bg-gradient-to-r from-brand-cyan to-brand-blue bg-clip-text text-transparent";
    }
    if (lowerWord === "operate" || lowerWord === "operar" || lowerWord === "arbeiten" ||
        lowerWord === "smarter" || lowerWord === "inteligente" || lowerWord === "intelligenter") {
      return "text-brand-blue";
    }
    return "";
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const words = section.querySelectorAll<HTMLSpanElement>(".word");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            words.forEach((word, index) => {
              setTimeout(() => {
                word.classList.add("animate-in");
              }, index * 60);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="flex min-h-[60vh] flex-col items-center justify-center bg-background px-6 py-24 md:py-32"
    >
      <h2
        id="process-heading"
        className="text-balance text-3xl font-semibold tracking-tight mb-6 md:text-4xl"
      >
        {t("process.heading")}
      </h2>
      <p
        ref={sectionRef}
        className="max-w-4xl text-center text-2xl font-bold leading-snug tracking-tight text-brand-dark md:text-3xl lg:text-4xl"
      >
        {words.map((word, index) => (
          <span
            key={index}
            className={`word inline-block translate-y-4 opacity-0 transition-all duration-500 ease-out ${
              getWordClassName(word, index)
            }`}
            style={{ transitionDelay: `${index * 60}ms` }}
          >
            {word}
            {index < words.length - 1 && "\u00A0"}
          </span>
        ))}
      </p>

      <style jsx>{`
        .word.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
}
