"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import ColorCodeSection from "@/components/sections/ColorCodeSection";
import PaletteSection from "@/components/sections/PaletteSection";
import ColorWheelPromoSection from "@/components/sections/ColorWheelPromoSection";
import { SectionHeader } from "@/components/SectionHeader";

const PAGE_BG = "linear-gradient(160deg, #c8e8ff 0%, #ddeeff 40%, #e8f4ff 100%)";

export default function Home() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", overflowX: "hidden", background: PAGE_BG }}>

      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: "#a8d8ff", top: -200, left: -150, filter: "blur(100px)", opacity: 0.45 }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "#b8c8ff", top: "35%", right: -100, filter: "blur(90px)", opacity: 0.3 }} />
        <div style={{ position: "absolute", width: 450, height: 450, borderRadius: "50%", background: "#a0e8e0", bottom: "5%", left: "15%", filter: "blur(90px)", opacity: 0.28 }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />
        <main>
          <Hero />

          <section style={{ width: "100%", padding: "72px 60px" }}>
            <SectionHeader
              title="Color Code Generator"
              subtitle="Pick any color and instantly convert it to HEX, RGB, HSL, and CMYK — copy straight into your design tool or code."
            />
            <ColorCodeSection colors={[]} />
          </section>

          <section style={{ width: "100%", padding: "72px 60px", background: "rgba(255,255,255,0.45)" }}>
            <SectionHeader
              title="Alternative Palettes"
              subtitle="Explore five harmony types built from any base color — complementary, analogous, triadic, monochromatic, split-complementary."
            />
            <PaletteSection baseColor="#1976D2" />
          </section>

          <ColorWheelPromoSection />
        </main>
        <Footer />
      </div>

      <ScrollReveal />
    </div>
  );
}
