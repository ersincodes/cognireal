"use client";

import { useRef, useState, useEffect } from "react";
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
  const [logoVisible, setLogoVisible] = useState(false);

  // Effect to show logo when flying logo animation completes
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
        // Show services logo when flying logo starts fading (progress > 85%)
        setLogoVisible(self.progress > 0.85);
      },
    });

    return () => {
      scrollTrigger.kill();
    };
  }, []);

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

      // Reset lines
      const paths = linesRef.current?.querySelectorAll(".connection-line");
      if (paths) {
        gsap.set(paths, { strokeDasharray: 1000, strokeDashoffset: 1000 });
      }

      // Animation Sequence - logo animation removed since flying logo handles it
      tl.to(
        paths!,
        {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: "power3.inOut",
          stagger: 0.1,
        },
        "+=0.3"
      ).to(
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
      id="services-graph"
      ref={containerRef}
      className="relative flex justify-center overflow-hidden bg-gradient-to-b from-[#f0f2fa] via-[#e8ebf8] to-[#f7f8fc] px-4 py-8 md:py-12">
      {/* Subtle top divider line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />
      <div className="relative flex w-full max-w-6xl flex-col items-center overflow-hidden p-8 md:h-[450px] md:p-0">
        {/* SVG Lines Layer (Desktop) */}
        <svg
          ref={linesRef}
          className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
          viewBox="0 0 800 450"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient
              id="mainGradient"
              x1="400"
              y1="80"
              x2="400"
              y2="380"
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

          {/* Center Top (Logo) is roughly at 400, 90 */}

          {/* Path to Left (Web Design) */}
          {/* Target: 80, 200 */}
          <path
            className="connection-line"
            d="M360 90 C 360 150, 80 140, 80 200"
            stroke="url(#mainGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            filter="url(#glow)"
            opacity="0.6"
          />

          {/* Path to Right (Web App) */}
          {/* Target: 720, 200 */}
          <path
            className="connection-line"
            d="M440 90 C 440 150, 720 140, 720 200"
            stroke="url(#mainGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            filter="url(#glow)"
            opacity="0.6"
          />

          {/* Path to Bottom (AI Solutions) */}
          {/* Target: 400, 260 */}
          <path
            className="connection-line"
            d="M400 90 C 420 170, 380 220, 400 260"
            stroke="url(#mainGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            filter="url(#glow)"
            opacity="0.6"
          />
        </svg>

        {/* --- Central Hub (Logo) --- */}
        {/* Positioned absolutely on desktop to match SVG start M400 90 */}
        <div
          id="services-graph-logo"
          ref={logoRef}
          className={`relative z-20 mt-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-black/5 transition-opacity duration-500 md:absolute md:left-1/2 md:top-[40px] md:mt-0 md:-translate-x-1/2 ${
            logoVisible ? "opacity-100" : "opacity-0"
          }`}>
          <Image
            src="/assets/logo-hero-1.png"
            alt="Cognireal"
            width={80}
            height={80}
            className="relative h-12 w-auto mix-blend-multiply object-contain"
          />
        </div>

        {/* --- Nodes Container --- */}
        <div className="relative z-10 mt-12 grid w-full grid-cols-1 gap-6 px-4 md:absolute md:inset-0 md:mt-0 md:grid-cols-3 md:px-12">
          {/* Left Node: Web Design */}
          <div
            ref={webDesignRef}
            className="flex flex-col items-center justify-center md:pt-24">
            <div className="group relative flex flex-col items-center gap-3 p-1 text-center transition-all duration-300 md:w-56">
              <div className="flex items-center justify-center">
                <Globe className="h-9 w-9 text-blue-600" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Web Design</h3>
              </div>
            </div>
          </div>

          {/* Center Bottom Node: AI Implementations */}
          <div
            ref={aiRef}
            className="flex flex-col items-center justify-end pb-4 md:justify-end md:pb-8">
            <div className="group relative flex flex-col items-center p-1 gap-3 ring-white/50 transition-all duration-300 md:w-56">
              <div className="flex items-center justify-center">
                <BrainCircuit
                  className="h-9 w-9 text-purple-600"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  AI Solutions
                </h3>
              </div>
            </div>
          </div>

          {/* Right Node: Web Application */}
          <div
            ref={webAppRef}
            className="flex flex-col items-center justify-center md:pt-24">
            <div className="group relative flex flex-col items-center gap-3 p-1 text-center transition-all duration-300 md:w-56">
              <div className="flex items-center justify-center">
                <Settings
                  className="h-9 w-9 text-indigo-600"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Web Apps</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesGraph;
