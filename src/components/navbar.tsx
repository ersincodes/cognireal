"use client";

import { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "./language-switcher";
import MobileNavDrawer from "./mobile-nav-drawer";

const Navbar = () => {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonId = useId();
  const menuPanelId = useId();

  const navItems = [
    { label: t("navbar.work"), href: "/#work" },
    { label: t("navbar.services"), href: "/#services" },
    { label: t("navbar.contact"), href: "/#contact" },
  ];

  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "/#contact";

  const handleOpenMenu = () => setIsMenuOpen(true);
  const handleCloseMenu = () => setIsMenuOpen(false);

  return (
    <header className="pointer-events-none absolute top-0 left-0 right-0 z-30 flex justify-center px-4 pt-6">
      <nav className="pointer-events-auto flex w-full max-w-5xl items-center justify-between">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 text-lg font-semibold text-brand-dark"
          aria-label="Navigate to home">
          <Image
            src="/assets/logo-navbar.png"
            alt={t("navbar.logoAlt")}
            width={200}
            height={64}
            className="h-auto w-28 shrink-0 sm:w-32 md:w-40"
            priority
          />
        </Link>

        <div className="hidden gap-6 text-sm font-medium text-brand-muted md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-brand-dark">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            id={menuButtonId}
            type="button"
            onClick={handleOpenMenu}
            aria-expanded={isMenuOpen}
            aria-controls={menuPanelId}
            aria-label={t("navbar.openMenu")}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-muted transition-colors hover:bg-brand-dark/5 hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 md:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <LanguageSwitcher />
          <Link
            href={bookingUrl}
            className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-gradient-to-r from-brand-cyan to-brand-blue px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 sm:px-4 sm:py-1.5 sm:text-sm"
            aria-label="Schedule a call"
          >
            {t("navbar.bookCall")}
          </Link>
        </div>
      </nav>

      <div id={menuPanelId}>
        <MobileNavDrawer
          isOpen={isMenuOpen}
          onClose={handleCloseMenu}
          navItems={navItems}
          bookingUrl={bookingUrl}
        />
      </div>
    </header>
  );
};

export default Navbar;
