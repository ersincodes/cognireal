"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    title: "Discover",
    description:
      "Assess operations, map workflows, and identify the high-impact wins.",
  },
  {
    title: "Design",
    description:
      "Blueprint UX, technical architecture, and how teams will actually adopt it.",
  },
  {
    title: "Develop",
    description:
      "Ship performant, secure software with integrated AI experiences.",
  },
  {
    title: "Launch",
    description: "Onboard teams, transition smoothly, and stay on as partners.",
  },
];

export default function ServicesSnapshot() {
  const sectionRef = useRef<HTMLElement>(null);
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!stepsContainerRef.current) return;

      const stepCards = stepsContainerRef.current.querySelectorAll("article");

      gsap.set(stepCards, {
        opacity: 0,
        y: 60,
      });

      gsap.to(stepCards, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.2,
        scrollTrigger: {
          trigger: stepsContainerRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative z-10 flex justify-center bg-brand-card px-4 py-24 text-brand-dark">
      <div className="w-full max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-brand-muted">
          Our process
        </p>
        <h2 className="mt-4 text-4xl font-semibold md:text-5xl">
          From first call to ongoing partnership.
        </h2>

        <div
          ref={stepsContainerRef}
          className="mt-16 grid gap-6 md:grid-cols-4">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="flex flex-col gap-4 rounded-3xl border border-brand-blue/15 bg-white p-6 shadow-[0_20px_60px_rgba(9,10,20,0.08)]">
              <span className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-muted">
                Step {index + 1}
              </span>
              <h3 className="text-2xl font-semibold">{step.title}</h3>
              <p className="text-sm text-brand-muted">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
