"use client";

import React, { useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TextLayerData {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  x: number;
  y: number;
  shadowEnabled: boolean;
  shadowBlur: number;
  shadowColor: string;
  scale: number;
}

export type CtaPattern = "solid" | "outline" | "gradient" | "pill" | "ghost";

export interface CtaButtonData {
  text: string;
  x: number;
  y: number;
  bgColor: string;
  textColor: string;
  pattern: CtaPattern;
  fontSize: number;
  fontFamily: string;
  borderRadius: number;
  enabled: boolean;
}

export interface TextLayersState {
  header: TextLayerData;
  subtext: TextLayerData;
  cta: CtaButtonData;
}

export function defaultTextLayers(): TextLayersState {
  return {
    header:  { text:"", fontFamily:"var(--font-syne), sans-serif",  fontSize:52, fontWeight:700, color:"#ffffff", x:50, y:35, shadowEnabled:false, shadowBlur:6,  shadowColor:"rgba(0,0,0,0.65)", scale:1 },
    subtext: { text:"", fontFamily:"var(--font-space), sans-serif", fontSize:26, fontWeight:400, color:"#ffffff", x:50, y:55, shadowEnabled:false, shadowBlur:4,  shadowColor:"rgba(0,0,0,0.5)",  scale:1 },
    cta: { text:"", x:50, y:72, bgColor:"#1976d2", textColor:"#ffffff", pattern:"solid", fontSize:16, fontFamily:"var(--font-space), sans-serif", borderRadius:10, enabled:false },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface Props {
  imageUrl: string;
  extractedColors: string[];
  layers: TextLayersState;
  onLayersChange: (l: TextLayersState) => void;
}

function hexLuminance(hex: string): number {
  const c = hex.replace(/^#/,"");
  const lin = (v: number) => v <= 0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
  const r = lin(parseInt(c.slice(0,2),16)/255);
  const g = lin(parseInt(c.slice(2,4),16)/255);
  const b = lin(parseInt(c.slice(4,6),16)/255);
  return 0.2126*r + 0.7152*g + 0.0722*b;
}
function contrastRatio(a: string, b: string): number {
  const l1 = hexLuminance(a), l2 = hexLuminance(b);
  const [hi,lo] = l1>l2 ? [l1,l2] : [l2,l1];
  return (hi+0.05)/(lo+0.05);
}
function wcagTag(r: number): string {
  if (r>=7) return "AAA"; if (r>=4.5) return "AA"; if (r>=3) return "AA Lg"; return "Fail";
}
function wcagTagColor(r: number): string {
  if (r>=4.5) return "#16a34a"; if (r>=3) return "#d97706"; return "#ef4444";
}

// Lighten a hex color for gradient second stop
function lightenHex(hex: string, amt: number): string {
  const c = hex.replace(/^#/,"");
  const r = Math.min(255, parseInt(c.slice(0,2),16) + amt);
  const g = Math.min(255, parseInt(c.slice(2,4),16) + amt);
  const b = Math.min(255, parseInt(c.slice(4,6),16) + amt);
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

export function ctaButtonCss(cta: CtaButtonData): React.CSSProperties {
  const br = cta.pattern === "pill" ? 999 : cta.borderRadius;
  const base: React.CSSProperties = {
    display: "inline-block",
    fontFamily: cta.fontFamily,
    fontSize: cta.fontSize,
    fontWeight: 700,
    color: cta.pattern === "outline" ? cta.bgColor : cta.textColor,
    padding: "10px 24px",
    borderRadius: br,
    whiteSpace: "nowrap",
    lineHeight: 1.2,
    cursor: "grab",
    userSelect: "none",
  };
  switch (cta.pattern) {
    case "solid":
      return { ...base, background: cta.bgColor, border: "2px solid transparent" };
    case "pill":
      return { ...base, background: cta.bgColor, border: "2px solid transparent" };
    case "outline":
      return { ...base, background: "transparent", border: `2px solid ${cta.bgColor}`, color: cta.bgColor };
    case "gradient":
      return { ...base, background: `linear-gradient(135deg, ${cta.bgColor}, ${lightenHex(cta.bgColor, 55)})`, border: "2px solid transparent" };
    case "ghost":
      return { ...base, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: `1.5px solid rgba(255,255,255,0.45)`, color: cta.textColor };
  }
}

const FONTS = [
  { label: "Syne (Brand)",    value: "var(--font-syne), sans-serif"   },
  { label: "Space Grotesk",   value: "var(--font-space), sans-serif"  },
  { label: "Arial",           value: "Arial, sans-serif"              },
  { label: "Georgia",         value: "Georgia, serif"                 },
  { label: "Helvetica Neue",  value: "'Helvetica Neue', sans-serif"   },
  { label: "Verdana",         value: "Verdana, sans-serif"            },
  { label: "Impact",          value: "Impact, sans-serif"             },
  { label: "Courier New",     value: "'Courier New', monospace"       },
];

const CTA_PATTERNS: { value: CtaPattern; label: string; desc: string }[] = [
  { value: "solid",    label: "Solid",    desc: "Filled block" },
  { value: "outline",  label: "Outline",  desc: "Border only"  },
  { value: "gradient", label: "Gradient", desc: "Color fade"   },
  { value: "pill",     label: "Pill",     desc: "Fully round"  },
  { value: "ghost",    label: "Glass",    desc: "Frosted"      },
];

const SAFE = 8;
type DragKey = "header" | "subtext" | "cta";

// ─── Component ────────────────────────────────────────────────────────────────

export default function TextDesignerSection({ imageUrl, extractedColors, layers, onLayersChange }: Props) {
  const [activeTab, setActiveTab] = useState<"header" | "subtext" | "cta">("header");
  const draggingRef = useRef<DragKey | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function updateLayer(key: "header" | "subtext", patch: Partial<TextLayerData>) {
    onLayersChange({ ...layers, [key]: { ...layers[key], ...patch } });
  }
  function updateCta(patch: Partial<CtaButtonData>) {
    onLayersChange({ ...layers, cta: { ...layers.cta, ...patch } });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!draggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width)  * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top)  / rect.height) * 100));
    if (draggingRef.current === "cta") {
      onLayersChange({ ...layers, cta: { ...layers.cta, x, y } });
    } else {
      onLayersChange({ ...layers, [draggingRef.current]: { ...layers[draggingRef.current], x, y } });
    }
  }

  const domBg = extractedColors[0] ?? "#1976D2";
  const candidates = ["#ffffff","#000000",...extractedColors.filter((_,i)=>i>0)];
  const recColors = [...new Set(candidates)].slice(0,8)
    .map(c => ({ hex:c, ratio: contrastRatio(c, domBg) }))
    .sort((a,b) => b.ratio - a.ratio).slice(0,6).map(c => c.hex);

  const outsideSafe = (l: { text: string; x: number; y: number }) =>
    l.text && (l.x < SAFE || l.x > 100-SAFE || l.y < SAFE || l.y > 100-SAFE);

  const textLayer = activeTab !== "cta" ? layers[activeTab as "header"|"subtext"] : null;
  const cr = textLayer ? contrastRatio(textLayer.color, domBg) : 0;
  const ctaColorCr = contrastRatio(layers.cta.textColor, layers.cta.bgColor);

  const inputStyle: React.CSSProperties = {
    width:"100%", boxSizing:"border-box", padding:"8px 10px", borderRadius:8,
    border:"1.5px solid rgba(25,118,210,0.25)", background:"rgba(255,255,255,0.7)",
    fontSize:13, color:"#0a1e38", outline:"none", fontFamily:"var(--font-space), sans-serif",
  };

  return (
    <div style={{ display:"flex", gap:28, alignItems:"flex-start", flexWrap:"wrap" }}>

      {/* ── Canvas ── */}
      <div style={{ flex:"1 1 400px", minWidth:320 }}>
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={() => { draggingRef.current = null; }}
          onMouseLeave={() => { draggingRef.current = null; }}
          style={{ position:"relative", borderRadius:12, overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.22)", userSelect:"none", cursor:"default" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Design" draggable={false} style={{ width:"100%", display:"block" }} />

          {/* Safe zone overlay */}
          <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
            <div style={{ position:"absolute", left:`${SAFE}%`, top:`${SAFE}%`, right:`${SAFE}%`, bottom:`${SAFE}%`, border:"1.5px dashed rgba(255,255,255,0.45)", borderRadius:4 }} />
          </div>

          {/* Text overlays */}
          {(["header","subtext"] as const).map(key => {
            const l = layers[key];
            const isEmpty = !l.text;
            const isActive = activeTab === key;
            return (
              <div
                key={key}
                onMouseDown={(e) => { e.preventDefault(); draggingRef.current = key; setActiveTab(key); }}
                style={{
                  position:"absolute", left:`${l.x}%`, top:`${l.y}%`,
                  transform:`translate(-50%,-50%) scale(${l.scale})`,
                  cursor:"grab", userSelect:"none",
                  fontFamily:l.fontFamily, fontSize:l.fontSize, fontWeight:l.fontWeight,
                  color: isEmpty ? "rgba(255,255,255,0.3)" : l.color,
                  fontStyle: isEmpty ? "italic" : "normal",
                  textShadow: l.shadowEnabled ? `2px 2px ${l.shadowBlur}px ${l.shadowColor}` : "none",
                  whiteSpace:"nowrap", lineHeight:1.1,
                  outline: isActive ? "2px dashed rgba(255,255,255,0.75)" : "none",
                  outlineOffset: isActive ? 5 : 0,
                  padding:"2px 4px", borderRadius:2, pointerEvents:"all",
                }}
              >
                {isEmpty ? (key === "header" ? "Header text" : "Subtext") : l.text}
              </div>
            );
          })}

          {/* CTA button overlay */}
          {layers.cta.enabled && (
            <div
              onMouseDown={(e) => { e.preventDefault(); draggingRef.current = "cta"; setActiveTab("cta"); }}
              style={{
                position:"absolute", left:`${layers.cta.x}%`, top:`${layers.cta.y}%`,
                transform:"translate(-50%,-50%)",
                pointerEvents:"all",
                outline: activeTab === "cta" ? "2px dashed rgba(255,255,255,0.75)" : "none",
                outlineOffset: activeTab === "cta" ? 5 : 0,
                borderRadius: layers.cta.pattern === "pill" ? 999 : layers.cta.borderRadius,
                ...ctaButtonCss(layers.cta),
              }}
            >
              {layers.cta.text || "CTA Button"}
            </div>
          )}
        </div>

        {/* Warnings */}
        <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:4 }}>
          {outsideSafe(layers.header) && (
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#d97706", background:"rgba(251,191,36,0.12)", padding:"6px 12px", borderRadius:8, border:"1px solid rgba(251,191,36,0.3)" }}>
              ⚠ Header is outside the safe zone — may be cropped on some platforms
            </div>
          )}
          {outsideSafe(layers.subtext) && (
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#d97706", background:"rgba(251,191,36,0.12)", padding:"6px 12px", borderRadius:8, border:"1px solid rgba(251,191,36,0.3)" }}>
              ⚠ Subtext is outside the safe zone — may be cropped on some platforms
            </div>
          )}
          {layers.cta.enabled && outsideSafe({ text: layers.cta.text || "x", x: layers.cta.x, y: layers.cta.y }) && (
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#d97706", background:"rgba(251,191,36,0.12)", padding:"6px 12px", borderRadius:8, border:"1px solid rgba(251,191,36,0.3)" }}>
              ⚠ CTA button is outside the safe zone — may be cropped on some platforms
            </div>
          )}
        </div>
        <p style={{ fontSize:12, color:"#4a6a8a", margin:"8px 0 0", lineHeight:1.5 }}>
          Click &amp; drag text to reposition · Dashed box = safe zone
        </p>
      </div>

      {/* ── Controls ── */}
      <div style={{ flex:"0 0 290px", minWidth:260, background:"rgba(255,255,255,0.55)", backdropFilter:"blur(12px)", borderRadius:16, border:"1px solid rgba(25,118,210,0.18)", padding:22, display:"flex", flexDirection:"column", gap:18 }}>

        {/* Tabs */}
        <div style={{ display:"flex", borderRadius:10, overflow:"hidden", border:"1.5px solid rgba(25,118,210,0.2)" }}>
          {(["header","subtext","cta"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex:1, padding:"9px 0", border:"none", fontWeight:700, fontSize:11,
              textTransform:"uppercase", letterSpacing:"0.7px", cursor:"pointer",
              background: activeTab===tab ? "#1976d2" : "transparent",
              color: activeTab===tab ? "#fff" : "#4a6a8a",
              transition:"background 0.15s",
            }}>
              {tab === "cta" ? "CTA" : tab === "header" ? "Header" : "Subtext"}
            </button>
          ))}
        </div>

        {/* ── Text layer controls ── */}
        {activeTab !== "cta" && textLayer && (() => {
          const key = activeTab as "header" | "subtext";
          const l = textLayer;
          return (
            <>
              <div>
                <LabelEl>Text</LabelEl>
                <input type="text" value={l.text} onChange={e => updateLayer(key, { text:e.target.value })}
                  placeholder={key==="header" ? "Enter headline..." : "Enter subtext..."} style={inputStyle} />
              </div>

              <div>
                <LabelEl>Font Family</LabelEl>
                <select value={l.fontFamily} onChange={e => updateLayer(key, { fontFamily:e.target.value })} style={inputStyle}>
                  {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>

              <div>
                <LabelEl>Font Size — {l.fontSize}px</LabelEl>
                <input type="range" min={12} max={150} step={1} value={l.fontSize}
                  onChange={e => updateLayer(key, { fontSize:+e.target.value })} style={{ width:"100%", accentColor:"#1976d2" }} />
              </div>

              <div>
                <LabelEl>Weight — {l.fontWeight}</LabelEl>
                <input type="range" min={100} max={900} step={100} value={l.fontWeight}
                  onChange={e => updateLayer(key, { fontWeight:+e.target.value })} style={{ width:"100%", accentColor:"#1976d2" }} />
              </div>

              <div>
                <LabelEl>Scale — {l.scale.toFixed(2)}×</LabelEl>
                <input type="range" min={0.5} max={3} step={0.05} value={l.scale}
                  onChange={e => updateLayer(key, { scale:+e.target.value })} style={{ width:"100%", accentColor:"#1976d2" }} />
              </div>

              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <LabelEl style={{ margin:0 }}>Text Color</LabelEl>
                  <span style={{ fontSize:11, fontWeight:700, color:wcagTagColor(cr), background:`${wcagTagColor(cr)}18`, padding:"2px 8px", borderRadius:5 }}>
                    {wcagTag(cr)} {cr.toFixed(1)}:1
                  </span>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                  {recColors.map(c => {
                    const isSelected = l.color === c;
                    return (
                      <button key={c} onClick={() => updateLayer(key, { color:c })} title={c}
                        style={{ width:28, height:28, borderRadius:"50%", background:c, border: isSelected ? "3px solid #1976d2" : "2px solid rgba(0,0,0,0.18)", cursor:"pointer", flexShrink:0, boxShadow: isSelected ? "0 0 0 2px #fff, 0 0 0 4px #1976d2" : "none" }} />
                    );
                  })}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <input type="color" value={l.color} onChange={e => updateLayer(key, { color:e.target.value })}
                    style={{ width:40, height:36, border:"2px solid rgba(25,118,210,0.3)", borderRadius:8, cursor:"pointer", padding:2, background:"white", flexShrink:0 }} />
                  <span style={{ fontSize:12, color:"#4a6a8a" }}>Custom</span>
                  <code style={{ fontSize:11, color:"#0a1e38", background:"rgba(0,0,0,0.06)", padding:"2px 6px", borderRadius:4 }}>{l.color.toUpperCase()}</code>
                </div>
              </div>

              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <LabelEl style={{ margin:0 }}>Drop Shadow</LabelEl>
                  <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
                    <input type="checkbox" checked={l.shadowEnabled} onChange={e => updateLayer(key, { shadowEnabled:e.target.checked })}
                      style={{ accentColor:"#1976d2", width:15, height:15 }} />
                    <span style={{ fontSize:12, color:"#4a6a8a" }}>{l.shadowEnabled ? "On" : "Off"}</span>
                  </label>
                </div>
                {l.shadowEnabled && (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <div>
                      <LabelEl>Blur — {l.shadowBlur}px</LabelEl>
                      <input type="range" min={0} max={30} step={1} value={l.shadowBlur}
                        onChange={e => updateLayer(key, { shadowBlur:+e.target.value })} style={{ width:"100%", accentColor:"#1976d2" }} />
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <input type="color" value={"#000000"}
                        onChange={e => updateLayer(key, { shadowColor:e.target.value })}
                        style={{ width:36, height:30, border:"2px solid rgba(0,0,0,0.15)", borderRadius:6, cursor:"pointer", padding:2 }} />
                      <span style={{ fontSize:12, color:"#4a6a8a" }}>Shadow color</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          );
        })()}

        {/* ── CTA controls ── */}
        {activeTab === "cta" && (
          <>
            {/* Enable toggle */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(25,118,210,0.07)", borderRadius:10, padding:"10px 14px" }}>
              <span style={{ fontSize:13, fontWeight:700, color:"#0a1e38" }}>Show CTA Button</span>
              <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                <div
                  onClick={() => updateCta({ enabled: !layers.cta.enabled })}
                  style={{
                    width:40, height:22, borderRadius:11, position:"relative", cursor:"pointer",
                    background: layers.cta.enabled ? "#1976d2" : "rgba(0,0,0,0.2)",
                    transition:"background 0.2s",
                  }}
                >
                  <div style={{
                    position:"absolute", top:3, left: layers.cta.enabled ? 21 : 3,
                    width:16, height:16, borderRadius:"50%", background:"#fff",
                    transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.25)",
                  }} />
                </div>
                <span style={{ fontSize:12, color:"#4a6a8a" }}>{layers.cta.enabled ? "On" : "Off"}</span>
              </label>
            </div>

            {layers.cta.enabled && (
              <>
                {/* Button text */}
                <div>
                  <LabelEl>Button Text</LabelEl>
                  <input type="text" value={layers.cta.text} onChange={e => updateCta({ text:e.target.value })}
                    placeholder="e.g. Get Started" style={inputStyle} />
                </div>

                {/* Pattern picker */}
                <div>
                  <LabelEl>Button Style</LabelEl>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                    {CTA_PATTERNS.map(p => {
                      const isSelected = layers.cta.pattern === p.value;
                      const preview = ctaButtonCss({ ...layers.cta, pattern: p.value });
                      return (
                        <button
                          key={p.value}
                          onClick={() => updateCta({ pattern: p.value })}
                          style={{
                            padding:"8px 6px", borderRadius:8, cursor:"pointer",
                            border: isSelected ? "2px solid #1976d2" : "1.5px solid rgba(25,118,210,0.2)",
                            background: isSelected ? "rgba(25,118,210,0.08)" : "rgba(255,255,255,0.6)",
                            display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                            transition:"border 0.15s, background 0.15s",
                          }}
                        >
                          {/* Mini preview swatch */}
                          <div style={{
                            ...preview,
                            fontSize:9, padding:"3px 8px", borderRadius: p.value==="pill" ? 99 : 5,
                            cursor:"default", pointerEvents:"none",
                          }}>
                            {p.label}
                          </div>
                          <span style={{ fontSize:10, color: isSelected ? "#1976d2" : "#4a6a8a", fontWeight:600 }}>{p.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font */}
                <div>
                  <LabelEl>Font</LabelEl>
                  <select value={layers.cta.fontFamily} onChange={e => updateCta({ fontFamily:e.target.value })} style={inputStyle}>
                    {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>

                {/* Font size */}
                <div>
                  <LabelEl>Font Size — {layers.cta.fontSize}px</LabelEl>
                  <input type="range" min={11} max={32} step={1} value={layers.cta.fontSize}
                    onChange={e => updateCta({ fontSize:+e.target.value })} style={{ width:"100%", accentColor:"#1976d2" }} />
                </div>

                {/* Corner radius — hide for pill */}
                {layers.cta.pattern !== "pill" && (
                  <div>
                    <LabelEl>Corner Radius — {layers.cta.borderRadius}px</LabelEl>
                    <input type="range" min={0} max={32} step={1} value={layers.cta.borderRadius}
                      onChange={e => updateCta({ borderRadius:+e.target.value })} style={{ width:"100%", accentColor:"#1976d2" }} />
                  </div>
                )}

                {/* Button color */}
                <div>
                  <LabelEl>Button Color</LabelEl>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                    {recColors.map(c => {
                      const isSelected = layers.cta.bgColor === c;
                      return (
                        <button key={c} onClick={() => updateCta({ bgColor:c })} title={c}
                          style={{ width:28, height:28, borderRadius:"50%", background:c, border: isSelected ? "3px solid #1976d2" : "2px solid rgba(0,0,0,0.18)", cursor:"pointer", flexShrink:0, boxShadow: isSelected ? "0 0 0 2px #fff, 0 0 0 4px #1976d2" : "none" }} />
                      );
                    })}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <input type="color" value={layers.cta.bgColor} onChange={e => updateCta({ bgColor:e.target.value })}
                      style={{ width:40, height:36, border:"2px solid rgba(25,118,210,0.3)", borderRadius:8, cursor:"pointer", padding:2, background:"white", flexShrink:0 }} />
                    <span style={{ fontSize:12, color:"#4a6a8a" }}>Custom</span>
                    <code style={{ fontSize:11, color:"#0a1e38", background:"rgba(0,0,0,0.06)", padding:"2px 6px", borderRadius:4 }}>{layers.cta.bgColor.toUpperCase()}</code>
                  </div>
                </div>

                {/* Text color */}
                {layers.cta.pattern !== "outline" && (
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                      <LabelEl style={{ margin:0 }}>Text Color</LabelEl>
                      <span style={{ fontSize:11, fontWeight:700, color:wcagTagColor(ctaColorCr), background:`${wcagTagColor(ctaColorCr)}18`, padding:"2px 8px", borderRadius:5 }}>
                        {wcagTag(ctaColorCr)} {ctaColorCr.toFixed(1)}:1
                      </span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <input type="color" value={layers.cta.textColor} onChange={e => updateCta({ textColor:e.target.value })}
                        style={{ width:40, height:36, border:"2px solid rgba(25,118,210,0.3)", borderRadius:8, cursor:"pointer", padding:2, background:"white", flexShrink:0 }} />
                      <button onClick={() => updateCta({ textColor:"#ffffff" })} style={{ fontSize:11, padding:"4px 8px", borderRadius:6, border:"1px solid rgba(0,0,0,0.15)", cursor:"pointer", background:"#fff", color:"#333" }}>White</button>
                      <button onClick={() => updateCta({ textColor:"#000000" })} style={{ fontSize:11, padding:"4px 8px", borderRadius:6, border:"1px solid rgba(0,0,0,0.15)", cursor:"pointer", background:"#000", color:"#fff" }}>Black</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}

function LabelEl({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ fontSize:11, fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", color:"#4a6a8a", margin:"0 0 6px", ...style }}>
      {children}
    </p>
  );
}
