"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MousePointerClick } from "lucide-react";
import Modal from "./modal";
import BeforeAfterSlider from "./before-after-slider";

gsap.registerPlugin(ScrollTrigger);

const WebPagesIntroSection = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const labelRef = useRef<HTMLParagraphElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const calloutRef = useRef<HTMLHeadingElement | null>(null);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  const handleOpenComparisonModal = () => {
    setIsComparisonModalOpen(true);
  };

  const handleCloseComparisonModal = () => {
    setIsComparisonModalOpen(false);
  };

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
          <button
            type="button"
            aria-label="Open website before and after comparison"
            onClick={handleOpenComparisonModal}
            className="mt-0 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-brand-cyan to-brand-blue px-10 py-3 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2">
            <span>Like This One</span>
            <MousePointerClick className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Modal
        isOpen={isComparisonModalOpen}
        title="Before & After"
        description="Drag the handle to compare the original vs updated website."
        onClose={handleCloseComparisonModal}>
        <BeforeAfterSlider
          beforeImageSrc="/assets/website-slider/before.png"
          afterImageSrc="/assets/website-slider/after.jpeg"
          beforeLabel="Before"
          afterLabel="After"
          initialPositionPercent={50}
        />
      </Modal>
    </section>
  );
};

export default WebPagesIntroSection;
