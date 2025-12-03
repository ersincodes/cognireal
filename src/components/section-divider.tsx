"use client";

import { useEffect, useRef } from "react";

export default function SectionDivider() {
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const divider = dividerRef.current;
    if (!divider) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            divider.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(divider);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={dividerRef}
      className="relative flex h-32 items-center justify-center overflow-hidden bg-background md:h-40"
      aria-hidden="true"
    >
      {/* Animated gradient line */}
      <div className="divider-line absolute h-[2px] w-0 bg-gradient-to-r from-transparent via-brand-cyan to-transparent opacity-0 transition-all duration-1000 ease-out" />
      
      {/* Center dot */}
      <div className="divider-dot absolute h-3 w-3 scale-0 rounded-full bg-gradient-to-br from-brand-cyan to-brand-blue opacity-0 shadow-[0_0_20px_rgba(61,231,255,0.5)] transition-all delay-300 duration-700 ease-out" />
      
      {/* Outer ring */}
      <div className="divider-ring absolute h-8 w-8 scale-0 rounded-full border border-brand-blue/30 opacity-0 transition-all delay-500 duration-700 ease-out" />

      <style jsx>{`
        .animate-in .divider-line {
          width: 60%;
          opacity: 1;
        }
        .animate-in .divider-dot {
          transform: scale(1);
          opacity: 1;
        }
        .animate-in .divider-ring {
          transform: scale(1);
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

