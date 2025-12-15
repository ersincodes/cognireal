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
          className="mt-0 inline-block rounded-full bg-gradient-to-r from-brand-cyan to-brand-blue px-10 py-2 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          aria-label="Schedule a call">
          Book a Call
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
