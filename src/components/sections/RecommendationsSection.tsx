"use client";

import { useState } from "react";
import { buildColorInfo, getContrastRatio, getWCAG, hexToRgb } from "@/utils/colorUtils";
import type { TextLayersState } from "./TextDesignerSection";
import { ctaButtonCss } from "./TextDesignerSection";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function contrastHex(a: string, b: string): number {
  try { return getContrastRatio(hexToRgb(a), hexToRgb(b)); } catch { return 1; }
}

function wcagColor(ratio: number): string {
  if (ratio >= 4.5) return "#16a34a";
  if (ratio >= 3)   return "#d97706";
  return "#ef4444";
}
function wcagLabel(ratio: number): string {
  if (ratio >= 7)   return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3)   return "AA Lg";
  return "Fail";
}

function blendReason(ratio: number, layerName: string): string {
  if (ratio >= 7)   return `${layerName} has excellent contrast — highly readable on all backgrounds.`;
  if (ratio >= 4.5) return `${layerName} passes AA but could blend on areas with similar brightness. Consider bumping to AAA for safety.`;
  if (ratio >= 3)   return `${layerName} only passes for large text. At smaller sizes it will blend into the background.`;
  return `${layerName} fails WCAG — it is likely blending into the image. Change the color to ensure readability.`;
}

function topAlternatives(currentColor: string, bgColor: string, extras: string[]): string[] {
  const candidates = ["#ffffff", "#000000", "#f0f4ff", "#0a1e38", "#f0a500", "#20b4aa", ...extras];
  return [...new Set(candidates)]
    .filter(c => c.toLowerCase() !== currentColor.toLowerCase())
    .map(c => ({ hex: c, ratio: contrastHex(c, bgColor) }))
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 4)
    .map(c => c.hex);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CopyHex({ hex }: { hex: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(hex).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); }); }}
      style={{ fontFamily:"monospace", fontSize:13, fontWeight:600, color:"#0a1e38", background:"rgba(255,255,255,0.65)", border:"1px solid rgba(25,118,210,0.18)", borderRadius:6, padding:"2px 9px", cursor:"pointer", letterSpacing:"0.4px" }}
    >
      {copied ? "Copied!" : hex}
    </button>
  );
}

interface LayerCardProps {
  name: string;
  icon: string;
  currentColor: string;
  bgColor: string;
  extractedColors: string[];
  active: boolean;
  note?: string; // extra context (e.g. CTA button color vs text color)
  onApply?: (hex: string) => void;
}

function LayerCard({ name, icon, currentColor, bgColor, extractedColors, active, note, onApply }: LayerCardProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const ratio = contrastHex(currentColor, bgColor);
  const alts = topAlternatives(currentColor, bgColor, extractedColors);

  if (!active) {
    return (
      <div style={{ background:"rgba(210,230,255,0.35)", border:"1px dashed rgba(25,118,210,0.2)", borderRadius:14, padding:"18px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <div>
          <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#6a8aaa" }}>{name}</p>
          <p style={{ margin:"2px 0 0", fontSize:12, color:"#8aaac0" }}>Not active — add text in the Text Designer to get recommendations</p>
        </div>
      </div>
    );
  }

  const statusColor = wcagColor(ratio);
  const label = wcagLabel(ratio);
  const isPassing = ratio >= 4.5;

  return (
    <div style={{ background:"rgba(255,255,255,0.6)", backdropFilter:"blur(12px)", border:`1.5px solid ${isPassing ? "rgba(22,163,74,0.25)" : "rgba(239,68,68,0.3)"}`, borderRadius:14, padding:"18px 20px", display:"flex", flexDirection:"column", gap:14 }}>

      {/* Header row */}
      <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
        <span style={{ fontSize:18 }}>{icon}</span>
        <span style={{ fontSize:13, fontWeight:700, color:"#0a1e38" }}>{name}</span>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
          {/* current swatch */}
          <div style={{ width:24, height:24, borderRadius:6, background:currentColor, border:"2px solid rgba(0,0,0,0.12)", flexShrink:0 }} />
          <CopyHex hex={currentColor} />
          {/* WCAG badge */}
          <span style={{ fontSize:11, fontWeight:700, color:statusColor, background:`${statusColor}18`, border:`1px solid ${statusColor}40`, padding:"2px 8px", borderRadius:20 }}>
            {label} {ratio.toFixed(1)}:1
          </span>
        </div>
      </div>

      {/* Issue explanation */}
      <div style={{ display:"flex", gap:10, alignItems:"flex-start", background: isPassing ? "rgba(22,163,74,0.07)" : "rgba(239,68,68,0.07)", borderRadius:10, padding:"10px 12px", border:`1px solid ${isPassing ? "rgba(22,163,74,0.2)" : "rgba(239,68,68,0.2)"}` }}>
        <span style={{ fontSize:15, flexShrink:0, marginTop:1 }}>{isPassing ? "✓" : "⚠"}</span>
        <p style={{ margin:0, fontSize:12, color: isPassing ? "#166534" : "#b91c1c", lineHeight:1.55 }}>
          {blendReason(ratio, name)}
          {note && <><br /><span style={{ color:"#4a6a8a", fontStyle:"italic" }}>{note}</span></>}
        </p>
      </div>

      {/* Recommended alternatives */}
      <div>
        <p style={{ margin:"0 0 8px", fontSize:11, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", color:"#4a6a8a" }}>
          Better alternatives
        </p>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {alts.map(alt => {
            const altRatio = contrastHex(alt, bgColor);
            const isHov = hovered === alt;
            return (
              <button
                key={alt}
                title={`${alt} — ${altRatio.toFixed(1)}:1 ${wcagLabel(altRatio)}`}
                onMouseEnter={() => setHovered(alt)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onApply?.(alt)}
                style={{
                  display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                  background: isHov ? "rgba(25,118,210,0.12)" : "rgba(255,255,255,0.5)",
                  border:`1.5px solid ${isHov ? "rgba(25,118,210,0.5)" : "rgba(25,118,210,0.15)"}`,
                  borderRadius:10, padding:"6px 10px", cursor: onApply ? "pointer" : "default",
                  transition:"all 0.15s", minWidth:56,
                }}
              >
                <div style={{ width:28, height:28, borderRadius:6, background:alt, border:"1.5px solid rgba(0,0,0,0.15)" }} />
                <span style={{ fontSize:9, fontFamily:"monospace", color:"#2a5070", fontWeight:600 }}>{alt.toUpperCase()}</span>
                <span style={{ fontSize:9, fontWeight:700, color:wcagColor(altRatio) }}>{wcagLabel(altRatio)}</span>
              </button>
            );
          })}
        </div>
        {onApply && <p style={{ margin:"6px 0 0", fontSize:11, color:"#6a8aaa" }}>Click a color to apply it in Text Designer</p>}
      </div>
    </div>
  );
}

// ─── Live Preview ─────────────────────────────────────────────────────────────

function LivePreview({ imageUrl, layers }: { imageUrl: string; layers?: TextLayersState }) {
  return (
    <div style={{ background:"rgba(210,230,255,0.55)", border:"1px solid rgba(25,118,210,0.25)", backdropFilter:"blur(20px)", borderRadius:16, overflow:"hidden", display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"10px 14px", borderBottom:"1px solid rgba(25,118,210,0.15)", display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ width:8, height:8, borderRadius:"50%", background:"#5b9bd5", display:"block" }} />
        <span style={{ fontSize:11, letterSpacing:"1.5px", textTransform:"uppercase", color:"#1e4060", fontWeight:600 }}>Live Preview</span>
        {layers && <span style={{ marginLeft:"auto", fontSize:11, color:"#4a8ab0", background:"rgba(25,118,210,0.08)", padding:"2px 8px", borderRadius:8 }}>from Text Designer</span>}
      </div>

      <div style={{ padding:16, flex:1 }}>
        <div style={{ position:"relative", borderRadius:10, overflow:"hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Design" style={{ width:"100%", display:"block" }} />

          {layers && (
            <>
              {(["header","subtext"] as const).map(key => {
                const l = layers[key];
                if (!l.text) return null;
                return (
                  <div key={key} style={{
                    position:"absolute", left:`${l.x}%`, top:`${l.y}%`,
                    transform:`translate(-50%,-50%) scale(${l.scale})`,
                    fontFamily:l.fontFamily, fontSize:l.fontSize * 0.5, fontWeight:l.fontWeight,
                    color:l.color,
                    textShadow: l.shadowEnabled ? `2px 2px ${l.shadowBlur * 0.5}px ${l.shadowColor}` : "none",
                    whiteSpace:"nowrap", pointerEvents:"none", lineHeight:1.1,
                  }}>{l.text}</div>
                );
              })}
              {layers.cta.enabled && (
                <div style={{
                  position:"absolute", left:`${layers.cta.x}%`, top:`${layers.cta.y}%`,
                  transform:`translate(-50%,-50%) scale(${layers.cta.scale})`,
                  pointerEvents:"none",
                  ...ctaButtonCss(layers.cta),
                  fontSize: layers.cta.fontSize * 0.5,
                  padding:"5px 12px",
                }}>
                  {layers.cta.text || "CTA Button"}
                </div>
              )}
            </>
          )}

          {/* Fallback when no layers yet */}
          {!layers && (
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:16, background:"linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }}>
              <div style={{ fontFamily:"var(--font-syne, system-ui)", fontSize:16, fontWeight:800, color:"#fff", marginBottom:4 }}>Headline Text</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.8)", lineHeight:1.5 }}>Add text in Text Designer to see your real design here</div>
            </div>
          )}
        </div>

        {!layers && (
          <p style={{ margin:"10px 0 0", fontSize:12, color:"#4a6a8a", textAlign:"center" }}>
            Design text in the Text Designer above — this preview will update in real time
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface RecommendationsSectionProps {
  dominantColors: string[];
  imageUrl: string;
  layers?: TextLayersState;
  onLayersChange?: (l: TextLayersState) => void;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function RecommendationsSection({ dominantColors, imageUrl, layers, onLayersChange }: RecommendationsSectionProps) {
  const bgHex = dominantColors.length > 0 ? buildColorInfo(dominantColors[0]).hex : "#1a3d5c";
  const extras = dominantColors.slice(1);

  const hasHeader  = !!layers?.header.text;
  const hasSubtext = !!layers?.subtext.text;
  const hasCtaText = !!layers?.cta.enabled;

  function applyHeaderColor(hex: string) {
    if (!layers || !onLayersChange) return;
    onLayersChange({ ...layers, header: { ...layers.header, color: hex } });
  }
  function applySubtextColor(hex: string) {
    if (!layers || !onLayersChange) return;
    onLayersChange({ ...layers, subtext: { ...layers.subtext, color: hex } });
  }
  function applyCtaColor(hex: string) {
    if (!layers || !onLayersChange) return;
    onLayersChange({ ...layers, cta: { ...layers.cta, bgColor: hex } });
  }

  return (
    <section style={{ padding:"0 0 8px", width:"100%", maxWidth:1280, margin:"0 auto" }}>

      {/* Section header */}
      <div style={{ marginBottom:28 }}>
        <p style={{ fontSize:11, letterSpacing:"2.5px", textTransform:"uppercase", color:"#1565c0", marginBottom:8 }}>
          Smart text color
        </p>
        <h2 style={{ fontFamily:"var(--font-syne, system-ui)", fontSize:"clamp(24px, 3vw, 38px)", fontWeight:800, letterSpacing:"-1px", color:"#0a1e38", lineHeight:1.15, marginBottom:12 }}>
          Text color <span style={{ color:"#1976d2" }}>recommendations</span>
        </h2>
        <p style={{ fontSize:15, color:"#2a4a6a", lineHeight:1.6, maxWidth:580 }}>
          Real-time analysis of every text layer in your design — flagging contrast issues and suggesting accessible alternatives.
        </p>
      </div>

      {/* Detected colors strip */}
      {dominantColors.length > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24, padding:"10px 14px", borderRadius:12, background:"rgba(210,230,255,0.35)", border:"1px solid rgba(25,118,210,0.18)", flexWrap:"wrap" }}>
          <span style={{ fontSize:11, letterSpacing:"1.5px", textTransform:"uppercase", color:"#1e4060", fontWeight:600, marginRight:4 }}>Detected colors</span>
          {dominantColors.map((hex, i) => {
            const info = buildColorInfo(hex);
            const isActive = i === 0;
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"3px 10px 3px 5px", borderRadius:20, background: isActive ? "rgba(25,118,210,0.15)" : "rgba(255,255,255,0.45)", border: isActive ? "1.5px solid rgba(25,118,210,0.45)" : "1px solid rgba(100,160,255,0.2)" }}>
                <span style={{ width:18, height:18, borderRadius:"50%", background:info.hex, display:"block", border:"1.5px solid rgba(255,255,255,0.5)", flexShrink:0 }} />
                <span style={{ fontFamily:"monospace", fontSize:11, fontWeight: isActive ? 700 : 500, color: isActive ? "#0a1e38" : "#2a5070" }}>{info.hex}</span>
                {isActive && <span style={{ fontSize:9, fontWeight:700, color:"#1565c0", background:"rgba(25,118,210,0.15)", padding:"1px 5px", borderRadius:8 }}>BG</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Main layout */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:24, alignItems:"start" }}>

        {/* Left: Live Preview */}
        <LivePreview imageUrl={imageUrl} layers={layers} />

        {/* Right: Per-layer analysis */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          <LayerCard
            name="Header"
            icon="Hh"
            currentColor={layers?.header.color ?? "#ffffff"}
            bgColor={bgHex}
            extractedColors={extras}
            active={hasHeader}
            onApply={onLayersChange ? applyHeaderColor : undefined}
          />

          <LayerCard
            name="Subtext"
            icon="Tt"
            currentColor={layers?.subtext.color ?? "#ffffff"}
            bgColor={bgHex}
            extractedColors={extras}
            active={hasSubtext}
            onApply={onLayersChange ? applySubtextColor : undefined}
          />

          <LayerCard
            name="CTA Button"
            icon="□"
            currentColor={layers?.cta.bgColor ?? "#1976d2"}
            bgColor={bgHex}
            extractedColors={extras}
            active={hasCtaText}
            note={hasCtaText ? `Button text (${layers!.cta.textColor}) vs button background: ${contrastHex(layers!.cta.textColor, layers!.cta.bgColor).toFixed(1)}:1 ${wcagLabel(contrastHex(layers!.cta.textColor, layers!.cta.bgColor))}` : undefined}
            onApply={onLayersChange ? applyCtaColor : undefined}
          />

        </div>
      </div>
    </section>
  );
}
