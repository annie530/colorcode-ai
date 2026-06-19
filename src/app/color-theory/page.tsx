"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import ColorTheorySection from "@/components/sections/ColorTheorySection";
import { SectionHeader } from "@/components/SectionHeader";

const PAGE_BG = "linear-gradient(160deg, #c8e8ff 0%, #ddeeff 40%, #e8f4ff 100%)";

export default function ColorTheoryPage() {
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
          <section style={{ width: "100%", padding: "72px 60px" }}>
            <SectionHeader
              title="Learn Color Theory"
              subtitle="The principles behind effective color choices — from the color wheel and harmony rules to the psychology of hue, saturation, and contrast."
            />
            <ColorTheorySection />
          </section>
        </main>
        <Footer />
      </div>

      <ScrollReveal />
    </div>
  );
}
