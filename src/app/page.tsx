import Hero from "@/components/hero";
import LaptopScrollSection from "@/components/laptop-scroll-section";
import AIImplementations from "@/components/ai-implementations";
import ServicesSnapshot from "@/components/services-snapshot";
import Process from "@/components/process";
import Mission from "@/components/mission";
import Footer from "@/components/footer";
import ScrollGuide from "@/components/scroll-guide";
import WebPagesIntroSection from "@/components/web-pages-intro";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="grow">
        <Hero />
        <WebPagesIntroSection />
        <LaptopScrollSection />
        <AIImplementations />
        <ServicesSnapshot />
        <Process />
        <Mission />
      </main>
      <Footer />
      <ScrollGuide />
    </div>
  );
}
