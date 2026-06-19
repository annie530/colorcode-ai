"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import UploadSection from "@/components/sections/UploadSection";
import RecommendationsSection from "@/components/sections/RecommendationsSection";
import PreviewSection from "@/components/sections/PreviewSection";
import TextDesignerSection, { defaultTextLayers } from "@/components/sections/TextDesignerSection";
import type { TextLayersState } from "@/components/sections/TextDesignerSection";
import { SectionHeader } from "@/components/SectionHeader";

const PAGE_BG = "linear-gradient(160deg, #c8e8ff 0%, #ddeeff 40%, #e8f4ff 100%)";

export default function UploadPage() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [selectedTextColor] = useState<string>("#0A1E38");
  const [textLayers, setTextLayers] = useState<TextLayersState>(defaultTextLayers());

  function handleColorsExtracted(colors: string[], imageUrl: string) {
    setExtractedColors(colors);
    setUploadedImageUrl(imageUrl);
    setTextLayers(defaultTextLayers());
  }

  const baseColor = extractedColors[0] ?? "#1976D2";

  const blobs = (
    <div aria-hidden style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
      <div style={{ position:"absolute", width:700, height:700, borderRadius:"50%", background:"#a8d8ff", top:-200, left:-150, filter:"blur(100px)", opacity:0.45 }} />
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"#b8c8ff", top:"35%", right:-100, filter:"blur(90px)", opacity:0.3 }} />
      <div style={{ position:"absolute", width:450, height:450, borderRadius:"50%", background:"#a0e8e0", bottom:"5%", left:"15%", filter:"blur(90px)", opacity:0.28 }} />
    </div>
  );

  return (
    <div style={{ position:"relative", minHeight:"100vh", overflowX:"hidden", background:PAGE_BG }}>
      {blobs}
      <div style={{ position:"relative", zIndex:1 }}>
        <Navbar />
        <main>

          <section style={{ width:"100%", padding:"72px 60px" }}>
            <SectionHeader title="Upload Your Design" subtitle="Drop in any image — a brand asset, UI mockup, poster, or photo — and we'll instantly extract the dominant colors driving its visual identity." />
            <UploadSection onColorsExtracted={handleColorsExtracted} />
          </section>

          {uploadedImageUrl && extractedColors.length > 0 && (
            <section style={{ width:"100%", padding:"72px 60px", background:"rgba(255,255,255,0.45)" }}>
              <SectionHeader title="Text Designer" subtitle="Add header and subtext to your design. Drag to reposition, style freely — the dashed border shows the safe zone guaranteed visible across platforms." />
              <TextDesignerSection
                imageUrl={uploadedImageUrl}
                extractedColors={extractedColors}
                layers={textLayers}
                onLayersChange={setTextLayers}
              />
            </section>
          )}

          {uploadedImageUrl && extractedColors.length > 0 && (
            <section style={{ width:"100%", padding:"72px 60px" }}>
              <SectionHeader title="Smart Text Recommendations" subtitle="AI-ranked text colors evaluated against WCAG contrast standards — so your typography stays accessible on every background." />
              <RecommendationsSection dominantColors={extractedColors} imageUrl={uploadedImageUrl} />
            </section>
          )}

          {uploadedImageUrl && (
            <section style={{ width:"100%", padding:"72px 60px", background:"rgba(255,255,255,0.45)" }}>
              <SectionHeader title="Visual Preview" subtitle="See how your design looks across desktop, mobile, and social media formats — your text layers included." />
              <PreviewSection imageUrl={uploadedImageUrl} textColor={selectedTextColor} bgColor={baseColor} layers={textLayers} />
            </section>
          )}

        </main>
        <Footer />
      </div>
      <ScrollReveal />
    </div>
  );
}
