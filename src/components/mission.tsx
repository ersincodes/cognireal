"use client";

declare global {
  interface Window {
    Calendly: any;
  }
}

export default function Mission() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.Calendly) {
      window.Calendly.initPopupWidget({
        url: "https://calendly.com/realcogni/30min",
      });
    }
  };

  return (
    <section className="flex justify-center px-4 pb-24">
      <div className="w-full max-w-4xl rounded-[40px] border border-brand-blue/15 bg-white p-12 text-center shadow-[0_25px_80px_rgba(8,10,20,0.08)]">
        <h2 className="text-4xl font-semibold text-brand-dark md:text-5xl">
          Ready to transform your business?
        </h2>
        <p className="mt-4 text-lg text-brand-muted">
          Share your current challenges and we will return with a plan in under
          48 hours.
        </p>
        <button
          onClick={handleClick}
          className="mt-8 inline-block cursor-pointer rounded-full bg-gradient-to-r from-brand-cyan to-brand-blue px-10 py-3 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
          Book a Discovery Call
        </button>
      </div>
    </section>
  );
}
