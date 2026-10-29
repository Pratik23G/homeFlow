import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { ServiceTiles } from "@/components/sections/ServiceTiles";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";
import { Showcase } from "@/components/sections/Showcase";
import { ServiceArea } from "@/components/sections/ServiceArea";
import { MeetNick } from "@/components/sections/MeetNick";
import { Reviews } from "@/components/sections/Reviews";
import { FAQ } from "@/components/sections/FAQ";
import { ClosingBand } from "@/components/sections/ClosingBand";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ServiceTiles />
        <HowItWorks />
        <Pricing />
        <Showcase />
        <ServiceArea />
        <MeetNick />
        <Reviews />
        <FAQ />
        <ClosingBand />
      </main>
      <Footer />
    </>
  );
}
