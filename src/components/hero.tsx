import Link from "next/link";

export default function Hero() {
  return (
    <section className="h-screen flex flex-col items-center justify-center text-center px-4 relative bg-background text-foreground">
      <div className="max-w-4xl mx-auto z-10">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-tight">
          Digital Transformation
          <br className="hidden md:block" /> for the Real World.
        </h1>
        <h2 className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto font-light">
          Web Design. Web Applications. AI Implementations.
        </h2>
        <Link
          href="#footer"
          className="inline-block bg-foreground text-background px-8 py-4 rounded-full font-medium text-lg hover:opacity-90 transition-opacity">
          Schedule a Call
        </Link>
      </div>
    </section>
  );
}
