"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const WebPagesIntroSection = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const subheadingRef = useRef<HTMLParagraphElement | null>(null);

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !headingRef.current ||
        !subheadingRef.current
      ) {
        return;
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          end: "bottom 60%",
          toggleActions: "play none none reverse",
        },
      });

      timeline.from(headingRef.current, {
        opacity: 0,
        x: -40,
        duration: 0.8,
        ease: "power3.out",
      });

      timeline.from(
        subheadingRef.current,
        {
          opacity: 0,
          y: 20,
          rotation: -2,
          duration: 0.7,
          ease: "back.out(1.7)",
        },
        "-=0.3"
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="w-full bg-background text-foreground px-4 py-16 flex justify-center">
      <div className="w-full max-w-5xl">
        <h2
          ref={headingRef}
          className="text-left text-3xl md:text-5xl font-bold tracking-tight leading-tight">
          WE DESIGN WEB PAGES
        </h2>
        <p
          ref={subheadingRef}
          className="mt-3 inline-block text-left text-xl md:text-2xl font-semibold text-transparent bg-clip-text bg-linear-to-r from-pink-400 via-purple-400 to-cyan-400 tracking-[0.25em] uppercase">
          (like this one)
        </p>
      </div>
    </section>
  );
};

export default WebPagesIntroSection;
