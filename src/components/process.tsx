"use client";

import { useEffect, useRef } from "react";

type WordSegment = {
  text: string;
  className?: string;
};

const segments: WordSegment[] = [
  { text: "In" },
  { text: "Cognireal," },
  { text: "we" },
  { text: "help" },
  { text: "companies" },
  { text: "modernize", className: "text-brand-cyan" },
  { text: "," },
  {
    text: "optimize",
    className:
      "bg-gradient-to-r from-brand-cyan to-brand-blue bg-clip-text text-transparent",
  },
  { text: "," },
  { text: "and" },
  { text: "operate", className: "text-brand-blue" },
  { text: "smarter", className: "text-brand-blue" },
  { text: "with" },
  { text: "digital" },
  { text: "solutions" },
  { text: "that" },
  { text: "actually" },
  { text: "work" },
  { text: "in" },
  { text: "the" },
  { text: "real" },
  { text: "world." },
];

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);

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
      ref={sectionRef}
      className="flex min-h-[60vh] items-center justify-center bg-background px-6 py-24 md:py-32">
      <h2 className="max-w-4xl text-center text-2xl font-bold leading-snug tracking-tight text-brand-dark md:text-3xl lg:text-4xl">
        {segments.map((segment, index) => (
          <span
            key={index}
            className={`word inline-block translate-y-4 opacity-0 transition-all duration-500 ease-out ${
              segment.className || ""
            }`}
            style={{ transitionDelay: `${index * 60}ms` }}>
            {segment.text}
            {index < segments.length - 1 && "\u00A0"}
          </span>
        ))}
      </h2>

      <style jsx>{`
        .word.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
}
