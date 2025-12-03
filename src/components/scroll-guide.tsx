"use client";

import { useCallback, useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

type ScrollGuideState = {
  readonly isAtBottom: boolean;
};

const ScrollGuide = () => {
  const [scrollGuideState, setScrollGuideState] = useState<ScrollGuideState>({
    isAtBottom: false,
  });

  const handleScrollPositionChange = useCallback(() => {
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;

    const distanceFromBottom = documentHeight - (scrollY + viewportHeight);
    const isAtBottom = distanceFromBottom < 200;

    setScrollGuideState((previousState) => {
      if (previousState.isAtBottom === isAtBottom) {
        return previousState;
      }

      return {
        isAtBottom,
      };
    });
  }, []);

  const handleScrollAction = useCallback(() => {
    if (!scrollGuideState.isAtBottom) {
      window.scrollBy({
        top: window.innerHeight,
        behavior: "smooth",
      });

      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [scrollGuideState.isAtBottom]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleScrollAction();
  };

  useEffect(() => {
    const animationFrameId = window.requestAnimationFrame(
      handleScrollPositionChange
    );

    window.addEventListener("scroll", handleScrollPositionChange, {
      passive: true,
    });
    window.addEventListener("resize", handleScrollPositionChange);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScrollPositionChange);
      window.removeEventListener("resize", handleScrollPositionChange);
    };
  }, [handleScrollPositionChange]);

  const ariaLabel = scrollGuideState.isAtBottom
    ? "Scroll back to the top of the page"
    : "Scroll down to explore more content";

  const labelText = scrollGuideState.isAtBottom
    ? "Scroll to top"
    : "Scroll to explore";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={handleScrollAction}
      onKeyDown={handleKeyDown}
      className="fixed bottom-6 right-6 z-50 flex items-center rounded-full border cursor-pointer border-brand-dark/20 bg-brand-dark/80 px-4 py-2 text-xs text-white shadow-lg backdrop-blur-md transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-dark md:text-sm">
      <span className="mr-2 tracking-[0.2em] uppercase">{labelText}</span>
      {scrollGuideState.isAtBottom ? (
        <ArrowUp className="h-4 w-4" aria-hidden="true" />
      ) : (
        <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
      )}
    </div>
  );
};

export default ScrollGuide;
