"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import Modal from "./modal";
import ImmersiveDataTable from "./immersive-data-table";

gsap.registerPlugin(ScrollTrigger);

export default function LaptopScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const laptopRef = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [showAfter, setShowAfter] = useState(false);
  const [isBeforeVisible, setIsBeforeVisible] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const beforeTimerRef = useRef<number | null>(null);

  const handleOpenCaseModal = () => {
    if (beforeTimerRef.current) {
      window.clearTimeout(beforeTimerRef.current);
    }
    setIsCaseModalOpen(true);
    setShowAfter(false);
    setIsBeforeVisible(false);
    setIsConverting(false);
    beforeTimerRef.current = window.setTimeout(
      () => setIsBeforeVisible(true),
      40
    );
  };

  const handleCloseCaseModal = () => {
    if (beforeTimerRef.current) {
      window.clearTimeout(beforeTimerRef.current);
    }
    setIsCaseModalOpen(false);
    setShowAfter(false);
    setIsBeforeVisible(false);
    setIsConverting(false);
  };

  const handleShowAfter = () => {
    setIsConverting(true);
    window.setTimeout(() => {
      setShowAfter(true);
      setIsConverting(false);
    }, 320);
  };

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
          className="pointer-events-auto absolute inset-0 z-20 flex flex-col items-center justify-center gap-8 px-6 text-center opacity-0">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/70">
            We build
          </p>
          <h2 className="text-5xl font-semibold leading-tight text-white md:text-7xl">
            Web Applications
          </h2>
          <p className="max-w-3xl text-lg text-white/80 md:text-2xl">
            Customed web tools that optimize operations, automate workflows, and
            bring clarity to your processes.
          </p>
          <button
            type="button"
            aria-label="See a real case web app transformation"
            onClick={handleOpenCaseModal}
            className="mt-8 cursor-pointer inline-block rounded-full bg-linear-to-r from-brand-cyan to-brand-blue px-10 py-3 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2">
            See a Real Case
          </button>
        </div>
      </div>
      <Modal
        isOpen={isCaseModalOpen}
        title="Dynamic Data Table"
        description={
          showAfter
            ? "Explore the interactive data table we built from the legacy sheet."
            : "Review the legacy spreadsheet, then convert it into an interactive table."
        }
        onClose={handleCloseCaseModal}>
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          {!showAfter ? (
            <div
              className={`relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xl transition-all duration-500 ${
                isBeforeVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-3 opacity-0"
              } ${
                isConverting
                  ? "scale-[1.01] shadow-[0_24px_70px_rgba(59,130,246,0.18)]"
                  : ""
              }`}>
              <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-b from-transparent via-white/10 to-white/30" />
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
                    Before
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    Legacy Spreadsheet
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleShowAfter}
                  disabled={isConverting}
                  className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-brand-cyan to-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-80"
                  aria-label="Convert to interactive table">
                  {isConverting ? "Converting..." : "Convert"}
                </button>
              </div>
              <div className="relative h-[60vh] min-h-[360px] w-full bg-gray-50">
                <Image
                  src="/assets/webapp-slider/before-2.png"
                  alt="Legacy spreadsheet interface before redesign"
                  fill
                  className="object-contain object-top transition-all duration-700 ease-out"
                  priority
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-black/5 bg-white shadow-xl">
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
                    After
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    Interactive Data Table
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                    Converted
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAfter(false)}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                    aria-label="Back to legacy view">
                    Back to Legacy
                  </button>
                </div>
              </div>
              <div className="h-[65vh] min-h-[420px] overflow-hidden rounded-b-2xl bg-gray-50">
                <ImmersiveDataTable className="h-full w-full" />
              </div>
            </div>
          )}
        </div>
      </Modal>
    </section>
  );
}
