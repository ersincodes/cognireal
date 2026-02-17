"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/i18n/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

const stepKeys = ["discover", "design", "develop", "launch"] as const;

export default function ServicesSnapshot() {
  const sectionRef = useRef<HTMLElement>(null);
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

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
      id="services"
      aria-labelledby="services-snapshot-heading"
      className="relative z-10 flex justify-center bg-brand-card px-4 py-24 text-brand-dark"
    >
      <div className="w-full max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-brand-muted">
          {t("servicesSnapshot.label")}
        </p>
        <h2
          id="services-snapshot-heading"
          className="mt-4 text-4xl font-semibold md:text-5xl"
        >
          {t("servicesSnapshot.heading")}
        </h2>

        <div
          ref={stepsContainerRef}
          className="mt-16 grid gap-6 md:grid-cols-4">
          {stepKeys.map((stepKey, index) => (
            <article
              key={stepKey}
              className="flex flex-col gap-4 rounded-3xl border border-brand-blue/15 bg-white p-6 shadow-[0_20px_60px_rgba(9,10,20,0.08)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-muted">
                {t("servicesSnapshot.step")} {index + 1}
              </p>
              <h3 className="text-lg font-semibold tracking-tight">
                {t(`servicesSnapshot.steps.${stepKey}.title`)}
              </h3>
              <p className="text-sm text-brand-muted">
                {t(`servicesSnapshot.steps.${stepKey}.description`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
