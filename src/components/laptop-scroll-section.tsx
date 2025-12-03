"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export default function LaptopScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const laptopRef = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=300%",
          scrub: 1,
          pin: true,
          pinSpacing: true,
        },
      });

      // 1. Fade In Laptop quickly (starts immediately)
      tl.to(laptopRef.current, { opacity: 1, scale: 1, duration: 0.3 });

      // Hold for a bit
      tl.to({}, { duration: 0.3 });

      // Zoom Laptop into screen
      // We scale up significantly so the inner screen fills the viewport
      tl.to(laptopRef.current, {
        scale: 2, // Increased scale for deeper zoom
        duration: 1.5, // Reduced duration so section appears earlier
        ease: "power2.inOut",
      });

      // Fade in Black Background
      // Overlap with end of zoom to transition smoothly
      tl.to(bgRef.current, { opacity: 1, duration: 0.5 }, "-=0.5");

      // 4. Web Apps Section
      // Fade in Text 2 (Overlay)
      tl.to(text2Ref.current, { opacity: 1, duration: 1 });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative bg-brand-dark text-white shadow-[0_2px_0_0_#020205]">
      <div className="flex h-screen w-full flex-col items-center justify-center overflow-hidden">
        {/* Laptop Mockup */}
        <div
          ref={laptopRef}
          className="will-change-transform relative aspect-16/10 w-[80vw] origin-center scale-90 rounded-3xl border-white/5 bg-gray-500 p-[0.5%] opacity-30 shadow-[0_60px_120px_rgba(0,0,0,0.45)] transition md:w-[50vw]">
          {/* Screen Bezel */}
          <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/5 bg-black">
            {/* Screen Content (Project Screenshot / Background) */}
            <div className="relative flex h-full w-full items-center justify-center bg-linear-to-br from-brand-cyan/40 to-brand-blue/40">
              <Image
                src="/assets/sustainnery-1.png"
                alt="Featured Cognireal project"
                width={1200}
                height={800}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          {/* Laptop Base (simplified) */}
          <div className="absolute -bottom-[3%] left-1/2 -translate-x-1/2 w-[115%] h-[3%] bg-gray-400 rounded-b-xl shadow-lg"></div>
          <div className="absolute -bottom-[3%] left-1/2 -translate-x-1/2 w-[15%] h-[2%] bg-gray-500 rounded-b-md"></div>
        </div>

        {/* Background Overlay */}
        <div
          ref={bgRef}
          className="pointer-events-none absolute inset-0 bg-brand-dark z-10 opacity-0"
        />

        {/* Section 4 Content: Web Applications */}
        <div
          ref={text2Ref}
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-8 px-6 text-center opacity-0">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/70">
            We build
          </p>
          <h2 className="text-5xl font-semibold leading-tight text-white md:text-7xl">
            Web applications
          </h2>
          <p className="max-w-3xl text-lg text-white/80 md:text-2xl">
            Customed web tools that optimize operations, automate workflows, and
            bring clarity to your processes.
          </p>
          <Link
            href="#process"
            className="pointer-events-auto rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan px-10 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:opacity-90 hover:shadow-lg hover:shadow-brand-cyan/30">
            See a real case
          </Link>
        </div>
      </div>
    </section>
  );
}
