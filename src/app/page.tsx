import { Reveal } from "@/components/Reveal";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { Explore } from "@/components/sections/Explore";
import { Services } from "@/components/sections/Services";
import { Approach } from "@/components/sections/Approach";
import { VideoBand } from "@/components/sections/VideoBand";
import { Pricing } from "@/components/sections/Pricing";
import { Showcase } from "@/components/sections/Showcase";
import { About } from "@/components/sections/About";
import { ServiceArea } from "@/components/sections/ServiceArea";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Explore />
        <Services />
        <Approach />
        <VideoBand />
        <Pricing />
        <Showcase />
        <Reveal><About /></Reveal>
        <ServiceArea />
      </main>
      <Footer />
    </>
  );
}
