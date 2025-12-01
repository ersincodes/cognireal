import Hero from "@/components/hero";
import LaptopScrollSection from "@/components/laptop-scroll-section";
import AIImplementations from "@/components/ai-implementations";
import ServicesSnapshot from "@/components/services-snapshot";
import Process from "@/components/process";
import Mission from "@/components/mission";
import Footer from "@/components/footer";
import ScrollGuide from "@/components/scroll-guide";

export default function Home() {
  return (
    <>
      <main className="flex flex-col min-h-screen overflow-x-hidden">
        <Hero />
        <LaptopScrollSection />
        <AIImplementations />
        <ServicesSnapshot />
        <Process />
        <Mission />
        <Footer />
      </main>
      <ScrollGuide />
    </>
  );
}
