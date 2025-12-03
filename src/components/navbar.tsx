import Image from "next/image";
import Link from "next/link";

const navItems = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#footer" },
];

const Navbar = () => {
  return (
    <header className="pointer-events-none absolute top-0 left-0 right-0 z-30 flex justify-center px-4 pt-6">
      <nav className="pointer-events-auto flex w-full max-w-5xl items-center justify-between">
        <Link
          href="#hero"
          className="flex items-center gap-3 text-lg font-semibold text-brand-dark"
          aria-label="Navigate to hero section">
          <Image
            src="/assets/logo-navbar.png"
            alt="Cognireal logo"
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

        <Link
          href="#footer"
          className="inline-flex items-center rounded-full bg-gradient-to-r from-brand-cyan to-brand-blue px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow-[0_20px_60px_rgba(56,88,255,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-blue"
          aria-label="Schedule a call">
          Book a call
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
