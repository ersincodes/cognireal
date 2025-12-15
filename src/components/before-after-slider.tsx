"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { GripVertical } from "lucide-react";

type BeforeAfterSliderProps = {
  beforeImageSrc: string;
  afterImageSrc: string;
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

  return (
    <div className={`w-full ${className ?? ""}`}>
      <div
        ref={containerRef}
        role="group"
        tabIndex={0}
        aria-label="Before and after image comparison slider"
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full select-none touch-none overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 sm:rounded-2xl">
        <div className="relative aspect-4/3 w-full sm:aspect-16/10">
          <div className="absolute inset-0">
            <Image
              src={afterImageSrc}
              alt={afterLabel}
              fill
              draggable={false}
              sizes="(min-width: 1024px) 960px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="mt-3 absolute top-3 right-3 z-20 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold tracking-wide text-white shadow-lg ring-1 ring-white/20 backdrop-blur sm:top-4 sm:right-4 sm:px-4 sm:py-2 sm:text-sm">
            {afterLabel}
          </div>

          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath }}>
            <div className="absolute inset-0">
              <Image
                src={beforeImageSrc}
                alt={beforeLabel}
                fill
                draggable={false}
                sizes="(min-width: 1024px) 960px, 100vw"
                className="object-cover"
              />
            </div>
            <div className="mt-3 absolute top-3 left-3 z-20 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold tracking-wide text-white shadow-lg ring-1 ring-white/20 backdrop-blur sm:top-4 sm:left-4 sm:px-4 sm:py-2 sm:text-sm">
              {beforeLabel}
            </div>
          </div>

          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0 z-10 w-0.5 bg-brand-blue sm:w-1"
            style={{
              left: `${sliderPositionPercent}%`,
              transform: "translateX(-50%)",
            }}>
            <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-blue shadow-lg ring-2 ring-white/70 sm:h-11 sm:w-11 sm:ring-4">
              <GripVertical className="h-4 w-4 text-white sm:h-5 sm:w-5" />
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
