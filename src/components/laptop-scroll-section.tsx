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

      // 1. Initial State: Laptop hidden
      // 2. Fade In Laptop
      tl.to(laptopRef.current, { opacity: 1, scale: 1, duration: 1 });

      // Hold for a bit
      tl.to({}, { duration: 0.5 });

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

      // Hold for a bit
      tl.to({}, { duration: 1 });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="relative bg-background">
      <div className="h-screen w-full overflow-hidden flex flex-col items-center justify-center">
        {/* Laptop Mockup */}
        <div
          ref={laptopRef}
          className="will-change-transform relative w-[80vw] md:w-[50vw] aspect-16/10 bg-gray-800 rounded-xl p-[2%] shadow-2xl flex items-center justify-center opacity-0 scale-90 origin-center">
          {/* Screen Bezel */}
          <div className="w-full h-full bg-black rounded overflow-hidden relative border border-gray-700">
            {/* Screen Content (Project Screenshot / Background) */}
            <div className="w-full h-full bg-linear-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center relative">
              <Image
                src="/assets/prompty-1.png"
                alt="Sustainnery"
                width={1500}
                height={1000}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          {/* Laptop Base (simplified) */}
          <div className="absolute -bottom-[3%] left-1/2 -translate-x-1/2 w-[120%] h-[3%] bg-gray-700 rounded-b-xl shadow-lg"></div>
          <div className="absolute -bottom-[3%] left-1/2 -translate-x-1/2 w-[15%] h-[2%] bg-gray-600 rounded-b-md"></div>
        </div>

        {/* Background Overlay */}
        <div
          ref={bgRef}
          className="absolute inset-0 bg-black z-10 pointer-events-none opacity-0"
        />

        {/* Section 4 Content: Web Applications */}
        <div
          ref={text2Ref}
          className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none opacity-0">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 text-center px-4">
            WEB APPLICATIONS
          </h2>
          <Link
            href="#"
            className="pointer-events-auto bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors">
            See our latest launch
          </Link>
        </div>
      </div>
    </section>
  );
}
