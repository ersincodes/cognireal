"use client";

import Image from "next/image";
import Navbar from "./navbar";
import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const [logoVisible, setLogoVisible] = useState(true);

  useEffect(() => {
    const heroSection = document.getElementById("hero");
    const servicesSection = document.getElementById("services-graph");

    if (!heroSection || !servicesSection) return;

    // Use ScrollTrigger for precise sync with flying logo
    const scrollTrigger = ScrollTrigger.create({
      trigger: heroSection,
      start: "bottom 90%",
      endTrigger: servicesSection,
      end: "top 80%", // Match the flying logo end point
      onUpdate: (self) => {
        // Hide hero logo when animation starts (progress > 1%)
        setLogoVisible(self.progress < 0.01);
      },
    });

    return () => {
      scrollTrigger.kill();
    };
  }, []);

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f7f8fc] px-4 text-brand-dark">
      <Navbar />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <svg
          className="h-full w-full opacity-60"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          {[0, 140, 280].map((offset) => (
            <path
              key={offset}
              d={`M-200 ${
                220 + offset
              }c164-72 328-144 492-114 164 30 328 162 492 192 164 30 328-42 492-114`}
              stroke="url(#wave)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          ))}
          <defs>
            <linearGradient
              id="wave"
              x1="0"
              x2="1440"
              y1="0"
              y2="0"
              gradientUnits="userSpaceOnUse">
              <stop stopColor="#d6dcff" />
              <stop offset="1" stopColor="#eef1ff" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 flex max-w-4xl flex-col items-center gap-8 text-center">
        {/* Hidden reference element for position calculation */}
        <div
          id="hero-logo"
          className="h-44 w-44 md:h-64 md:w-64"
          aria-hidden="true">
          <Image
            src="/assets/logo-hero-1.png"
            alt="Cognireal icon"
            width={260}
            height={260}
            priority
            className={`h-full w-full mix-blend-multiply drop-shadow-[0_40px_80px_rgba(39,73,199,0.35)] transition-opacity duration-300 ${
              logoVisible ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-black uppercase leading-tight tracking-[0.08em] md:text-5xl">
            The digital transformation
          </h1>
          <p className="text-base text-brand-muted md:text-xl">
            that respects your operation and upgrades your business
          </p>
        </div>
      </div>
    </section>
  );
}
