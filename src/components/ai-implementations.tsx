"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export default function AIImplementations() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(contentRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
          end: "center center",
          scrub: 1,
        },
        x: 200,
        opacity: 0,
        duration: 1.5,
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative flex w-full justify-center bg-[#f5f5f5] px-6 py-32 lg:px-12">
      <div className="relative w-full max-w-[1400px]">
        <div ref={contentRef} className="flex flex-col items-end text-right">
          {/* WE IMPLEMENT label */}
          <p className="text-sm font-medium uppercase tracking-widest text-gray-600 md:text-base">
            WE IMPLEMENT
          </p>

          {/* & AI Heading */}
          <h2 className="mt-2 text-5xl font-bold md:text-7xl">
            <span className="text-brand-dark">AI SYSTEMS</span>
          </h2>

          {/* Description */}
          <p className="mt-6 max-w-lg text-base text-brand-dark/70 md:text-lg">
            Automated reports, intelligent chatbots, and custom automation
            systems that upgrade how your business works.
          </p>

          {/* Try a demo button */}
          <Link
            href="#demo"
            className="mt-8 inline-block rounded-full bg-gradient-to-r from-brand-cyan to-brand-blue px-10 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            aria-label="Try a demo"
            tabIndex={0}>
            Try a demo
          </Link>
        </div>
      </div>
    </section>
  );
}
