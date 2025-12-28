"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { GripVertical } from "lucide-react";

type BeforeAfterSliderProps = {
  beforeImageSrc?: string;
  afterImageSrc?: string;
  beforeContent?: ReactNode;
  afterContent?: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  initialPositionPercent?: number;
  className?: string;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const BeforeAfterSlider = ({
  beforeImageSrc,
  afterImageSrc,
  beforeContent,
  afterContent,
  beforeLabel = "Before",
  afterLabel = "After",
  initialPositionPercent = 50,
  className,
}: BeforeAfterSliderProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sliderPositionPercent, setSliderPositionPercent] = useState(() =>
    clamp(initialPositionPercent, 0, 100)
  );
  const [isDragging, setIsDragging] = useState(false);

  const clipPath = useMemo(
    () => `inset(0 ${100 - sliderPositionPercent}% 0 0)`,
    [sliderPositionPercent]
  );

  const ariaValueText = useMemo(() => {
    const roundedPercent = Math.round(sliderPositionPercent);
    return `${roundedPercent}% ${beforeLabel} / ${afterLabel}`;
  }, [afterLabel, beforeLabel, sliderPositionPercent]);

  const updatePositionFromClientX = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = (x / rect.width) * 100;
    setSliderPositionPercent(clamp(percent, 0, 100));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    containerRef.current?.setPointerCapture?.(event.pointerId);
    setIsDragging(true);
    updatePositionFromClientX(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePositionFromClientX(event.clientX);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 2;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setSliderPositionPercent((current) => clamp(current - step, 0, 100));
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setSliderPositionPercent((current) => clamp(current + step, 0, 100));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setSliderPositionPercent(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setSliderPositionPercent(100);
    }
  };

  useEffect(() => {
    setSliderPositionPercent(clamp(initialPositionPercent, 0, 100));
  }, [initialPositionPercent]);

  const renderImage = (src: string, alt: string) => (
    <div className="relative h-full w-full">
      <Image
        src={src}
        alt={alt}
        fill
        draggable={false}
        quality={92}
        sizes="(min-width: 1024px) 960px, 100vw"
        className="object-contain object-center"
      />
    </div>
  );

  const resolvedAfter = afterContent
    ? afterContent
    : afterImageSrc
    ? renderImage(afterImageSrc, afterLabel)
    : null;
  const resolvedBefore = beforeContent
    ? beforeContent
    : beforeImageSrc
    ? renderImage(beforeImageSrc, beforeLabel)
    : null;

  if (!resolvedAfter || !resolvedBefore) {
    return null;
  }

  return (
    <div className={`w-full ${className ?? ""}`}>
      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-label="Before and after image comparison slider"
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(sliderPositionPercent)}
        aria-valuetext={ariaValueText}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full cursor-ew-resize select-none touch-none overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/10 outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 sm:rounded-2xl">
        <div className="relative aspect-16/10 w-full bg-linear-to-b from-slate-50 to-slate-100">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
          />

          <div className="absolute inset-0">
            <div className="relative flex h-full w-full items-stretch justify-stretch">
              {resolvedAfter}
            </div>
          </div>

          <div
            className={`pointer-events-none absolute top-3 right-3 z-20 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold tracking-wide text-white shadow-lg ring-1 ring-white/20 backdrop-blur transition-opacity duration-300 sm:top-4 sm:right-4 sm:px-4 sm:py-2 sm:text-sm`}>
            {afterLabel}
          </div>

          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath, willChange: "clip-path" }}>
            <div className="absolute inset-0">
              <div className="relative flex h-full w-full items-stretch justify-stretch">
                {resolvedBefore}
              </div>
            </div>

            <div
              className={`pointer-events-none absolute top-3 left-3 z-20 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold tracking-wide text-white shadow-lg ring-1 ring-white/20 backdrop-blur transition-opacity duration-300 sm:top-4 sm:left-4 sm:px-4 sm:py-2 sm:text-sm`}>
              {beforeLabel}
            </div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-linear-to-b from-white/0 via-brand-blue to-white/0 sm:w-0.5"
            style={{
              left: `${sliderPositionPercent}%`,
              transform: "translateX(-50%)",
            }}></div>
          <div
            role="presentation"
            aria-hidden="true"
            className="absolute top-0 bottom-0 z-20 w-12 cursor-ew-resize"
            style={{
              left: `${sliderPositionPercent}%`,
              transform: "translateX(-50%)",
            }}>
            <div className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-linear-to-b from-white/0 via-brand-blue to-white/0 sm:w-0.5" />
            <div className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow-xl ring-1 ring-black/10 backdrop-blur sm:h-12 sm:w-12">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue shadow-sm ring-1 ring-white/30 sm:h-9 sm:w-9">
                <GripVertical className="h-4 w-4 text-white sm:h-5 sm:w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-gray-600 sm:mt-4 sm:text-sm">
        Drag to compare, or use arrow keys while focused (Shift for bigger
        steps).
      </p>
    </div>
  );
};

export default BeforeAfterSlider;
