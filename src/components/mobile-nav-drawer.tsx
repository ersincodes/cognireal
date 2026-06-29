"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

type NavItem = {
  label: string;
  href: string;
};

type MobileNavDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  bookingUrl: string;
};

const FOCUSABLE_SELECTORS = [
  "a[href]",
  'button:not([disabled]):not([aria-disabled="true"])',
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const getFocusableElements = (container: HTMLElement | null) => {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
  ).filter(
    (element) => !element.hasAttribute("disabled") && element.tabIndex !== -1
  );
};

const MobileNavDrawer = ({
  isOpen,
  onClose,
  navItems,
  bookingUrl,
}: MobileNavDrawerProps) => {
  const { t } = useLanguage();
  const titleId = useId();
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElementRef.current =
      document.activeElement as HTMLElement | null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleGlobalKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedElementRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  const handleDrawerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    if (!drawerRef.current) return;

    const focusableElements = getFocusableElements(drawerRef.current);
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (
        activeElement === firstElement ||
        !drawerRef.current.contains(activeElement)
      ) {
        event.preventDefault();
        lastElement.focus();
      }
      return;
    }

    if (activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  const handleBackdropMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    onClose();
  };

  const handleNavClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 md:hidden"
      aria-hidden={!isOpen}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onMouseDown={handleBackdropMouseDown}
        aria-hidden="true"
      />

      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleDrawerKeyDown}
        className="absolute top-0 right-0 flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-brand-dark/10 px-6 py-5">
          <h2
            id={titleId}
            className="text-lg font-semibold text-brand-dark"
          >
            {t("navbar.menuTitle")}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label={t("navbar.closeMenu")}
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-brand-dark transition-colors hover:bg-brand-dark/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className="rounded-lg px-4 py-3 text-base font-medium text-brand-dark transition-colors hover:bg-brand-dark/5"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-brand-dark/10 px-6 py-6">
          <Link
            href={bookingUrl}
            onClick={handleNavClick}
            className="inline-flex w-full shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-brand-cyan to-brand-blue px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
          >
            {t("navbar.bookCall")}
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MobileNavDrawer;
