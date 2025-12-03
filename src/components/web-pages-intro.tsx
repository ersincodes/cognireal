"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const WebPagesIntroSection = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const labelRef = useRef<HTMLParagraphElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const calloutRef = useRef<HTMLHeadingElement | null>(null);

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !labelRef.current ||
        !titleRef.current ||
        !descRef.current ||
        !calloutRef.current
      ) {
        return;
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 60%",
          toggleActions: "play none none reverse",
        },
      });

      timeline
        .from(labelRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: "power2.out",
        })
        .from(
          titleRef.current,
          {
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.4"
        )
        .from(
          descRef.current,
          {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: "power2.out",
          },
          "-=0.6"
        )
        .from(
          calloutRef.current,
          {
            opacity: 0,
            scale: 0.9,
            x: 20,
            duration: 0.8,
            ease: "back.out(1.7)",
          },
          "-=0.4"
        );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex w-full justify-center bg-white px-6 py-32 lg:px-12">
      <div className="relative w-full max-w-[1400px]">
        <div className="flex flex-col items-start">
          <p
            ref={labelRef}
            className="text-sm font-medium uppercase tracking-widest text-gray-600 md:text-base">
            WE DESIGN
          </p>
          <h2
            ref={titleRef}
            className="mt-2 text-6xl font-black uppercase tracking-tight text-black md:text-8xl">
            WEB PAGES
          </h2>
          <p
            ref={descRef}
            className="mt-6 max-w-2xl text-xl leading-relaxed text-gray-500 md:text-2xl">
            Modern, fast, mobile-ready websites for businesses that want to look
            professional.
          </p>
        </div>

        <div className="mt-16 flex justify-end md:mt-32">
          <h3
            ref={calloutRef}
            className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-2xl font-bold uppercase text-transparent md:text-4xl">
            (LIKE THIS ONE)
          </h3>
        </div>
      </div>
    </section>
  );
};

export default WebPagesIntroSection;
