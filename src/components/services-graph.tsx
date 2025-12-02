"use client";

import { useRef } from "react";
import Image from "next/image";
import { Globe, Settings, BrainCircuit } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ServicesGraph = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const webDesignRef = useRef<HTMLDivElement>(null);
  const webAppRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      // Initial Setup
      const nodes = [webDesignRef.current, webAppRef.current, aiRef.current];
      gsap.set(nodes, { opacity: 0, y: 30, scale: 0.9 });
      gsap.set(logoRef.current, { scale: 0.5, opacity: 0, rotation: -10 });

      // Reset lines
      const paths = linesRef.current?.querySelectorAll(".connection-line");
      if (paths) {
        gsap.set(paths, { strokeDasharray: 1000, strokeDashoffset: 1000 });
      }

      // Animation Sequence
      tl.to(logoRef.current, {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)",
      })
        .to(
          paths!,
          {
            strokeDashoffset: 0,
            duration: 1.5,
            ease: "power3.inOut",
            stagger: 0.1,
          },
          "-=0.4"
        )
        .to(
          nodes,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: "back.out(1.7)",
          },
          "-=1.0"
        );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="flex justify-center bg-[#f7f8fc] px-4 py-12 md:py-24">
      <div className="relative flex w-full max-w-6xl flex-col items-center overflow-hidden p-8 md:h-[600px] md:p-0">
        {/* SVG Lines Layer (Desktop) */}
        <svg
          ref={linesRef}
          className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient
              id="mainGradient"
              x1="400"
              y1="100"
              x2="400"
              y2="500"
              gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3b82f6" /> {/* Blue-500 */}
              <stop offset="100%" stopColor="#8b5cf6" /> {/* Violet-500 */}
            </linearGradient>

            {/* Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Center Top (Logo) is roughly at 400, 120 */}

          {/* Path to Left (Web Design) */}
          {/* Target: 80, 260 (More to the left) */}
          <path
            className="connection-line"
            d="M360 120 C 360 200, 80 180, 80 260"
            stroke="url(#mainGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            filter="url(#glow)"
            opacity="0.6"
          />

          {/* Path to Right (Web App) */}
          {/* Target: 720, 260 (More to the right) */}
          <path
            className="connection-line"
            d="M440 120 C 440 200, 720 180, 720 260"
            stroke="url(#mainGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            filter="url(#glow)"
            opacity="0.6"
          />

          {/* Path to Bottom (AI Solutions) */}
          {/* Target: 400, 340 (Above node) */}
          <path
            className="connection-line"
            d="M400 120 C 420 220, 380 280, 400 340"
            stroke="url(#mainGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            filter="url(#glow)"
            opacity="0.6"
          />
        </svg>

        {/* --- Central Hub (Logo) --- */}
        {/* Positioned absolutely on desktop to match SVG start M400 120 */}
        <div
          ref={logoRef}
          className="relative z-20 mt-8 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-black/5 md:absolute md:left-1/2 md:top-[70px] md:mt-0 md:-translate-x-1/2">
          <Image
            src="/assets/logo-hero-1.png"
            alt="Cognireal"
            width={100}
            height={100}
            className="relative h-14 w-auto object-contain"
          />
        </div>

        {/* --- Nodes Container --- */}
        <div className="relative z-10 mt-16 grid w-full grid-cols-1 gap-8 px-4 md:absolute md:inset-0 md:mt-0 md:grid-cols-3 md:px-12">
          {/* Left Node: Web Design */}
          {/* Visual center approx 150, 300 */}
          <div
            ref={webDesignRef}
            className="flex flex-col items-center justify-center md:pt-32">
            <div className="group relative flex flex-col items-center gap-4 p-1 text-center backdrop-blur-md transition-all duration-300 md:w-64">
              <div className="flex items-center justify-center">
                <Globe className="h-10 w-10 text-blue-600" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Web Design</h3>
              </div>
            </div>
          </div>

          {/* Center Bottom Node: AI Implementations */}
          {/* Visual center approx 400, 450 */}
          <div
            ref={aiRef}
            className="flex flex-col items-center justify-end pb-8 md:justify-end md:pb-20">
            <div className="group relative flex flex-col items-center p-1 gap-4 ring-white/50 backdrop-blur-md transition-all duration-300 md:w-64">
              <div className="flex items-center justify-center">
                <BrainCircuit
                  className="h-10 w-10 text-purple-600"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  AI Solutions
                </h3>
              </div>
            </div>
          </div>

          {/* Right Node: Web Application */}
          {/* Visual center approx 650, 300 */}
          <div
            ref={webAppRef}
            className="flex flex-col items-center justify-center md:pt-32">
            <div className="group relative flex flex-col items-center gap-4 p-1 text-center backdrop-blur-md transition-all duration-300 md:w-64">
              <div className="flex items-center justify-center">
                <Settings
                  className="h-10 w-10 text-indigo-600"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Web Apps</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesGraph;
