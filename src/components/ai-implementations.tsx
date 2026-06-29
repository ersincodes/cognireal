"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Bot } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

export default function AIImplementations() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !containerRef.current ||
        !labelRef.current ||
        !titleRef.current ||
        !descRef.current ||
        !buttonRef.current
      ) {
        return;
      }

      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=150%",
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        },
      });

      gsap.set([labelRef.current, descRef.current], { opacity: 0, y: 30 });
      gsap.set(titleRef.current, { opacity: 0, y: 50 });
      gsap.set(buttonRef.current, { opacity: 0, scale: 0.8, y: 40 });

      mainTl
        .to(labelRef.current, { opacity: 1, y: 0, duration: 0.5 })
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3")
        .to(descRef.current, { opacity: 1, y: 0, duration: 0.6 }, "-=0.5")
        .to(
          buttonRef.current,
          { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" },
          "-=0.3"
        )
        .to({}, { duration: 1 });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen w-full items-center justify-center bg-[#f5f5f5] px-6 lg:px-12 overflow-hidden"
    >
      <div ref={containerRef} className="relative w-full max-w-[1400px]">
        <div className="flex flex-col items-end text-right">
          <p
            ref={labelRef}
            className="text-sm font-medium uppercase tracking-widest text-gray-600 md:text-base"
          >
            {t("aiSystems.label")}
          </p>
          <h2
            ref={titleRef}
            className="mt-2 text-6xl font-black uppercase tracking-tight text-black md:text-8xl"
          >
            {t("aiSystems.heading")}
          </h2>
          <p
            ref={descRef}
            className="mt-6 max-w-2xl text-xl leading-relaxed text-gray-500 md:text-2xl"
          >
            {t("aiSystems.description")}
          </p>
        </div>

        <div ref={buttonRef} className="mt-16 flex justify-start md:mt-32">
          <Link
            href="/demo"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-linear-to-r from-brand-cyan to-brand-blue px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 sm:px-8 sm:py-3 sm:text-base md:text-lg"
            aria-label={t("aiSystems.button")}
          >
            <span>{t("aiSystems.button")}</span>
            <Bot className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
