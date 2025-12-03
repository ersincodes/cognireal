"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FlyingLogo = () => {
  const logoRef = useRef<HTMLDivElement>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [positions, setPositions] = useState<{
    heroX: number;
    heroY: number;
    heroSize: number;
    targetX: number;
    targetY: number;
    targetSize: number;
  } | null>(null);

  const calculatePositions = useCallback(() => {
    const heroLogo = document.getElementById("hero-logo");
    const targetLogo = document.getElementById("services-graph-logo");

    if (!heroLogo || !targetLogo) return null;

    const heroRect = heroLogo.getBoundingClientRect();
    const targetRect = targetLogo.getBoundingClientRect();
    const scrollY = window.scrollY;

    return {
      heroX: heroRect.left + heroRect.width / 2,
      heroY: heroRect.top + scrollY + heroRect.height / 2,
      heroSize: heroRect.width || 176,
      targetX: targetRect.left + targetRect.width / 2,
      targetY: targetRect.top + scrollY + targetRect.height / 2,
      targetSize: 96,
    };
  }, []);

  useEffect(() => {
    // Initial position calculation
    const updatePositions = () => {
      const pos = calculatePositions();
      if (pos) setPositions(pos);
    };

    // Wait for layout to settle
    const timer = setTimeout(updatePositions, 100);
    window.addEventListener("resize", updatePositions);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePositions);
    };
  }, [calculatePositions]);

  useEffect(() => {
    if (!positions) return;

    const heroSection = document.getElementById("hero");
    const servicesSection = document.getElementById("services-graph");

    if (!heroSection || !servicesSection) return;

    const scrollTrigger = ScrollTrigger.create({
      trigger: heroSection,
      start: "bottom 90%",
      endTrigger: servicesSection,
      end: "top 80%", // End much earlier - when services-graph just enters viewport
      scrub: 0.5,
      onUpdate: (self) => {
        setAnimationProgress(self.progress);
      },
    });

    return () => {
      scrollTrigger.kill();
    };
  }, [positions]);

  // Don't render until we have positions
  if (!positions) return null;

  // Calculate current state based on animation progress
  const easeProgress = gsap.parseEase("power2.inOut")(animationProgress);

  // Interpolate position
  const currentX =
    positions.heroX + (positions.targetX - positions.heroX) * easeProgress;
  const currentY =
    positions.heroY + (positions.targetY - positions.heroY) * easeProgress;
  const currentSize =
    positions.heroSize +
    (positions.targetSize - positions.heroSize) * easeProgress;

  // Calculate vertical offset from scroll
  const scrollOffset = typeof window !== "undefined" ? window.scrollY : 0;

  // Hide when animation is complete or hasn't started
  // Fade out earlier (at 85%) to avoid overlap with services-graph logo
  const isVisible = animationProgress > 0.01 && animationProgress < 0.85;

  // Rotation effect during flight
  const rotation = Math.sin(animationProgress * Math.PI) * 8;

  return (
    <div
      ref={logoRef}
      className="pointer-events-none fixed z-50 flex items-center justify-center transition-opacity duration-200"
      style={{
        left: currentX,
        top: currentY - scrollOffset,
        width: currentSize,
        height: currentSize,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        opacity: isVisible ? 1 : 0,
      }}
      aria-hidden="true">
      <Image
        src="/assets/logo-hero-1.png"
        alt=""
        width={260}
        height={260}
        priority
        className="h-full w-full mix-blend-multiply object-contain drop-shadow-[0_20px_50px_rgba(39,73,199,0.35)]"
      />
    </div>
  );
};

export default FlyingLogo;
