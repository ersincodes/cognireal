import Hero from "@/components/hero";
import LaptopScrollSection from "@/components/laptop-scroll-section";
import AIImplementations from "@/components/ai-implementations";
import ServicesSnapshot from "@/components/services-snapshot";
import Process from "@/components/process";
import SectionDivider from "@/components/section-divider";
import Mission from "@/components/mission";
import Footer from "@/components/footer";
import ScrollGuide from "@/components/scroll-guide";
import ServicesGraph from "@/components/services-graph";
import WebPagesIntroSection from "@/components/web-pages-intro";
import FlyingLogo from "@/components/flying-logo";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <FlyingLogo />
      <main className="grow">
        <Hero />
        <ServicesGraph />
        <WebPagesIntroSection />
        <LaptopScrollSection />
        <AIImplementations />
        <ServicesSnapshot />
        <Process />
        <SectionDivider />
        <Mission />
      </main>
      <Footer />
      <ScrollGuide />
    </div>
  );
}
