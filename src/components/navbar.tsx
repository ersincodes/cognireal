"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "./language-switcher";

const Navbar = () => {
  const { t } = useLanguage();

  const navItems = [
    { label: t("navbar.work"), href: "/work" },
    { label: t("navbar.services"), href: "/services" },
    { label: t("navbar.contact"), href: "/contact" },
  ];

  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "/contact";

  return (
    <header className="pointer-events-none absolute top-0 left-0 right-0 z-30 flex justify-center px-4 pt-6">
      <nav className="pointer-events-auto flex w-full max-w-5xl items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 text-lg font-semibold text-brand-dark"
          aria-label="Navigate to home">
          <Image
            src="/assets/logo-navbar.png"
            alt={t("navbar.logoAlt")}
            width={200}
            height={64}
            className="h-auto w-32 md:w-40"
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

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href={bookingUrl}
            className="mt-0 inline-block rounded-full bg-gradient-to-r from-brand-cyan to-brand-blue px-10 py-2 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            aria-label="Schedule a call"
          >
            {t("navbar.bookCall")}
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
