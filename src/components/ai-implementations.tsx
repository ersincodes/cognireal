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
      className="min-h-screen flex items-center justify-end px-4 md:px-20 bg-background relative">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div ref={contentRef} className="text-right max-w-5xl z-10">
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-10 leading-none">
          <span className="text-indigo-500">&</span> AI
          <br />
          IMPLEMENTATIONS
        </h2>
        <div className="flex justify-end">
          <Link
            href="#"
            className="bg-foreground text-background px-10 py-4 rounded-full font-medium text-xl hover:opacity-90 transition-opacity">
            Try a Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
