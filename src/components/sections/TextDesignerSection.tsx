"use client";

import React, { useState, useRef, useEffect } from "react";

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
  strokeEnabled: boolean;
  strokeWidth: number;
  strokeColor: string;
  strokeRound: boolean;
  gradientEnabled: boolean;
  gradientColor1: string;
  gradientColor2: string;
  gradientAngle: number;
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
  scale: number;
  enabled: boolean;
}

export interface TextLayersState {
  header: TextLayerData;
  subtext: TextLayerData;
  cta: CtaButtonData;
}

interface Preset {
  name: string;
  layers: TextLayersState;
}

export function defaultTextLayers(): TextLayersState {
  return {
    header:  { text:"", fontFamily:"var(--font-syne), sans-serif",  fontSize:52, fontWeight:700, color:"#ffffff", x:50, y:35, shadowEnabled:false, shadowBlur:6,  shadowColor:"rgba(0,0,0,0.65)", scale:1, strokeEnabled:false, strokeWidth:2, strokeColor:"#000000", strokeRound:false, gradientEnabled:false, gradientColor1:"#ff6b6b", gradientColor2:"#ffd93d", gradientAngle:135 },
    subtext: { text:"", fontFamily:"var(--font-space), sans-serif", fontSize:26, fontWeight:400, color:"#ffffff", x:50, y:55, shadowEnabled:false, shadowBlur:4,  shadowColor:"rgba(0,0,0,0.5)",  scale:1, strokeEnabled:false, strokeWidth:1, strokeColor:"#000000", strokeRound:false, gradientEnabled:false, gradientColor1:"#6bcb77", gradientColor2:"#4d96ff", gradientAngle:135 },
    cta: { text:"", x:50, y:72, bgColor:"#1976d2", textColor:"#ffffff", pattern:"solid", fontSize:16, fontFamily:"var(--font-space), sans-serif", borderRadius:10, scale:1, enabled:false },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
function lightenHex(hex: string, amt: number): string {
  const c = hex.replace(/^#/,"");
  const r = Math.min(255, parseInt(c.slice(0,2),16) + amt);
  const g = Math.min(255, parseInt(c.slice(2,4),16) + amt);
  const b = Math.min(255, parseInt(c.slice(4,6),16) + amt);
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

function roundedStrokeShadowsArr(width: number, color: string): string[] {
  const out: string[] = [];
  for (let deg = 0; deg < 360; deg += 12) {
    const rad = (deg * Math.PI) / 180;
    const x = (Math.cos(rad) * width).toFixed(2);
    const y = (Math.sin(rad) * width).toFixed(2);
    out.push(`${x}px ${y}px 0 ${color}`);
  }
  return out;
}

export function ctaButtonCss(cta: CtaButtonData): React.CSSProperties {
  const br = cta.pattern === "pill" ? 999 : cta.borderRadius;
  const base: React.CSSProperties = {
    display:"inline-block", fontFamily:cta.fontFamily, fontSize:cta.fontSize,
    fontWeight:700, color:cta.pattern === "outline" ? cta.bgColor : cta.textColor,
    padding:"10px 24px", borderRadius:br, whiteSpace:"nowrap", lineHeight:1.2, cursor:"grab", userSelect:"none",
  };
  switch (cta.pattern) {
    case "solid":    return { ...base, background:cta.bgColor, border:"2px solid transparent" };
    case "pill":     return { ...base, background:cta.bgColor, border:"2px solid transparent" };
    case "outline":  return { ...base, background:"transparent", border:`2px solid ${cta.bgColor}`, color:cta.bgColor };
    case "gradient": return { ...base, background:`linear-gradient(135deg, ${cta.bgColor}, ${lightenHex(cta.bgColor, 55)})`, border:"2px solid transparent" };
    case "ghost":    return { ...base, background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)", border:"1.5px solid rgba(255,255,255,0.45)", color:cta.textColor };
  }
}

const FONTS = [
  { label:"Syne (Brand)",   value:"var(--font-syne), sans-serif"   },
  { label:"Space Grotesk",  value:"var(--font-space), sans-serif"  },
  { label:"Arial",          value:"Arial, sans-serif"              },
  { label:"Georgia",        value:"Georgia, serif"                 },
  { label:"Helvetica Neue", value:"'Helvetica Neue', sans-serif"   },
  { label:"Verdana",        value:"Verdana, sans-serif"            },
  { label:"Impact",         value:"Impact, sans-serif"             },
  { label:"Courier New",    value:"'Courier New', monospace"       },
];

const CTA_PATTERNS: { value: CtaPattern; label: string; desc: string }[] = [
  { value:"solid",    label:"Solid",    desc:"Filled block" },
  { value:"outline",  label:"Outline",  desc:"Border only"  },
  { value:"gradient", label:"Gradient", desc:"Color fade"   },
  { value:"pill",     label:"Pill",     desc:"Fully round"  },
  { value:"ghost",    label:"Glass",    desc:"Frosted"      },
];

const SAFE = 8;
const SNAP_ZONE = 6;
const LS_KEY = "colorcode-presets";
type DragKey = "header" | "subtext" | "cta";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  imageUrl: string;
  extractedColors: string[];
  layers: TextLayersState;
  onLayersChange: (l: TextLayersState) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TextDesignerSection({ imageUrl, extractedColors, layers, onLayersChange }: Props) {
  const [activeTab, setActiveTab] = useState<"header"|"subtext"|"cta">("header");
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [savingPreset, setSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState("");

  const draggingRef = useRef<DragKey | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setPresets(JSON.parse(raw));
    } catch {}
  }, []);

  function savePreset() {
    const name = presetName.trim();
    if (!name) return;
    const next = [...presets.filter(p => p.name !== name), { name, layers }];
    setPresets(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    setPresetName("");
    setSavingPreset(false);
  }

  function loadPreset(p: Preset) {
    const d = defaultTextLayers();
    onLayersChange({
      header:  { ...d.header,  ...p.layers.header  },
      subtext: { ...d.subtext, ...p.layers.subtext },
      cta:     { ...d.cta,     ...p.layers.cta     },
    });
  }

  function deletePreset(name: string) {
    const next = presets.filter(p => p.name !== name);
    setPresets(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  }

  function updateLayer(key: "header"|"subtext", patch: Partial<TextLayerData>) {
    onLayersChange({ ...layers, [key]: { ...layers[key], ...patch } });
  }
  function updateCta(patch: Partial<CtaButtonData>) {
    onLayersChange({ ...layers, cta: { ...layers.cta, ...patch } });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!draggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width)  * 100));
    let y = Math.max(0, Math.min(100, ((e.clientY - rect.top)  / rect.height) * 100));
    if (snapEnabled) {
      if (Math.abs(x - 50) < SNAP_ZONE) x = 50;
      if (Math.abs(y - 50) < SNAP_ZONE) y = 50;
    }
    if (draggingRef.current === "cta") {
      onLayersChange({ ...layers, cta: { ...layers.cta, x, y } });
    } else {
      onLayersChange({ ...layers, [draggingRef.current]: { ...layers[draggingRef.current], x, y } });
    }
  }

  const domBg = extractedColors[0] ?? "#1976D2";
  const candidates = ["#ffffff","#000000",...extractedColors.filter((_,i)=>i>0)];
  const recColors = [...new Set(candidates)].slice(0,8)
    .map(c => ({ hex:c, ratio:contrastRatio(c, domBg) }))
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

          {/* Safe zone */}
          <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
            <div style={{ position:"absolute", left:`${SAFE}%`, top:`${SAFE}%`, right:`${SAFE}%`, bottom:`${SAFE}%`, border:"1.5px dashed rgba(255,255,255,0.45)", borderRadius:4 }} />
          </div>

          {/* Snap center guide lines */}
          {snapEnabled && (
            <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:1 }}>
              <div style={{ position:"absolute", top:0, bottom:0, left:"50%", transform:"translateX(-50%)", width:1, borderLeft:"1.5px dashed rgba(99,179,237,0.65)" }} />
              <div style={{ position:"absolute", left:0, right:0, top:"50%", transform:"translateY(-50%)", height:1, borderTop:"1.5px dashed rgba(99,179,237,0.65)" }} />
              <div style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)", width:8, height:8, borderRadius:"50%", background:"rgba(99,179,237,0.8)", boxShadow:"0 0 0 3px rgba(99,179,237,0.25)" }} />
            </div>
          )}

          {/* Text overlays */}
          {(["header","subtext"] as const).map(key => {
            const l = layers[key];
            const isEmpty = !l.text;
            const isActive = activeTab === key;

            // Build combined textShadow: rounded stroke + drop shadow
            const shadowParts: string[] = [];
            if (!isEmpty && l.strokeEnabled && l.strokeRound) {
              shadowParts.push(...roundedStrokeShadowsArr(l.strokeWidth, l.strokeColor));
            }
            if (l.shadowEnabled) {
              shadowParts.push(`2px 2px ${l.shadowBlur}px ${l.shadowColor}`);
            }

            return (
              <div
                key={key}
                onMouseDown={e => { e.preventDefault(); draggingRef.current = key; setActiveTab(key); }}
                style={{
                  position:"absolute", left:`${l.x}%`, top:`${l.y}%`,
                  transform:`translate(-50%,-50%) scale(${l.scale})`,
                  cursor:"grab", userSelect:"none",
                  fontFamily:l.fontFamily, fontSize:l.fontSize, fontWeight:l.fontWeight,
                  fontStyle: isEmpty ? "italic" : "normal",
                  textShadow: shadowParts.length ? shadowParts.join(", ") : "none",
                  whiteSpace:"nowrap", lineHeight:1.1,
                  outline: isActive ? "2px dashed rgba(255,255,255,0.75)" : "none",
                  outlineOffset: isActive ? 5 : 0,
                  padding:"2px 4px", borderRadius:2, pointerEvents:"all",
                  WebkitTextStroke: (!isEmpty && l.strokeEnabled && !l.strokeRound) ? `${l.strokeWidth}px ${l.strokeColor}` : undefined,
                  ...(isEmpty ? { color:"rgba(255,255,255,0.3)" }
                    : l.gradientEnabled ? {
                        background:`linear-gradient(${l.gradientAngle}deg, ${l.gradientColor1}, ${l.gradientColor2})`,
                        WebkitBackgroundClip:"text",
                        WebkitTextFillColor:"transparent",
                        backgroundClip:"text",
                      }
                    : { color:l.color }),
                }}
              >
                {isEmpty ? (key === "header" ? "Header text" : "Subtext") : l.text}
              </div>
            );
          })}

          {/* CTA overlay */}
          {layers.cta.enabled && (
            <div
              onMouseDown={e => { e.preventDefault(); draggingRef.current = "cta"; setActiveTab("cta"); }}
              style={{
                position:"absolute", left:`${layers.cta.x}%`, top:`${layers.cta.y}%`,
                transform:`translate(-50%,-50%) scale(${layers.cta.scale})`,
                pointerEvents:"all",
                outline: activeTab==="cta" ? "2px dashed rgba(255,255,255,0.75)" : "none",
                outlineOffset: activeTab==="cta" ? 5 : 0,
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
          {layers.cta.enabled && outsideSafe({ text:layers.cta.text || "x", x:layers.cta.x, y:layers.cta.y }) && (
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#d97706", background:"rgba(251,191,36,0.12)", padding:"6px 12px", borderRadius:8, border:"1px solid rgba(251,191,36,0.3)" }}>
              ⚠ CTA button is outside the safe zone — may be cropped on some platforms
            </div>
          )}
        </div>

        {/* Canvas footer: hint + snap toggle */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:8, gap:8, flexWrap:"wrap" }}>
          <p style={{ fontSize:12, color:"#4a6a8a", margin:0 }}>
            Click &amp; drag text · Dashed box = safe zone
          </p>
          <button
            onClick={() => setSnapEnabled(s => !s)}
            style={{
              display:"flex", alignItems:"center", gap:6,
              fontSize:12, fontWeight:700, padding:"6px 13px",
              borderRadius:8, cursor:"pointer",
              background: snapEnabled ? "rgba(99,179,237,0.14)" : "rgba(0,0,0,0.05)",
              border: snapEnabled ? "1.5px solid rgba(99,179,237,0.55)" : "1.5px solid rgba(0,0,0,0.1)",
              color: snapEnabled ? "#2b6cb0" : "#4a6a8a",
              transition:"all 0.15s",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
            Snap to Center {snapEnabled ? "· On" : "· Off"}
          </button>
        </div>
      </div>

      {/* ── Controls ── */}
      <div style={{ flex:"0 0 290px", minWidth:260, background:"rgba(255,255,255,0.55)", backdropFilter:"blur(12px)", borderRadius:16, border:"1px solid rgba(25,118,210,0.18)", padding:22, display:"flex", flexDirection:"column", gap:18 }}>

        {/* ── Presets ── */}
        <div style={{ paddingBottom:16, borderBottom:"1px solid rgba(25,118,210,0.12)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <LabelEl style={{ margin:0 }}>Presets</LabelEl>
            <button
              onClick={() => { setSavingPreset(s => !s); setPresetName(""); }}
              style={{ fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:7, border:"1.5px solid rgba(25,118,210,0.3)", background: savingPreset ? "rgba(239,68,68,0.07)" : "rgba(25,118,210,0.08)", color: savingPreset ? "#b91c1c" : "#1565c0", cursor:"pointer" }}
            >
              {savingPreset ? "Cancel" : "+ Save current"}
            </button>
          </div>

          {savingPreset && (
            <div style={{ display:"flex", gap:6, marginBottom:10 }}>
              <input
                value={presetName}
                onChange={e => setPresetName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") savePreset(); }}
                placeholder="Preset name…"
                style={{ ...inputStyle, flex:1, fontSize:12 }}
                autoFocus
              />
              <button
                onClick={savePreset}
                disabled={!presetName.trim()}
                style={{ padding:"6px 12px", borderRadius:8, border:"none", background:presetName.trim() ? "#1976d2" : "rgba(0,0,0,0.1)", color:presetName.trim() ? "#fff" : "#aaa", fontWeight:700, fontSize:12, cursor:presetName.trim() ? "pointer" : "not-allowed" }}
              >
                Save
              </button>
            </div>
          )}

          {presets.length > 0 ? (
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {presets.map(p => (
                <div key={p.name} style={{ display:"flex", alignItems:"center", background:"rgba(25,118,210,0.08)", border:"1px solid rgba(25,118,210,0.2)", borderRadius:20, overflow:"hidden" }}>
                  <button
                    onClick={() => loadPreset(p)}
                    title={`Load "${p.name}"`}
                    style={{ fontSize:12, fontWeight:600, color:"#1565c0", padding:"4px 10px", border:"none", background:"transparent", cursor:"pointer" }}
                  >
                    {p.name}
                  </button>
                  <button
                    onClick={() => deletePreset(p.name)}
                    title="Delete preset"
                    style={{ fontSize:13, color:"#9a9a9a", padding:"4px 8px 4px 2px", border:"none", background:"transparent", cursor:"pointer", lineHeight:1 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize:12, color:"#8aaac0", margin:0, lineHeight:1.5 }}>
              No presets yet — style your layers and save for reuse across designs
            </p>
          )}
        </div>

        {/* ── Layer tabs ── */}
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
          const key = activeTab as "header"|"subtext";
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

              {/* ── Text Color (Solid / Gradient) ── */}
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <LabelEl style={{ margin:0 }}>Text Color</LabelEl>
                  {!l.gradientEnabled && (
                    <span style={{ fontSize:11, fontWeight:700, color:wcagTagColor(cr), background:`${wcagTagColor(cr)}18`, padding:"2px 8px", borderRadius:5 }}>
                      {wcagTag(cr)} {cr.toFixed(1)}:1
                    </span>
                  )}
                </div>

                {/* Solid / Gradient toggle */}
                <div style={{ display:"flex", borderRadius:8, overflow:"hidden", border:"1.5px solid rgba(25,118,210,0.2)", marginBottom:10 }}>
                  <button
                    onClick={() => updateLayer(key, { gradientEnabled:false })}
                    style={{ flex:1, padding:"6px 0", border:"none", fontWeight:700, fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", cursor:"pointer", background:!l.gradientEnabled ? "#1976d2" : "transparent", color:!l.gradientEnabled ? "#fff" : "#4a6a8a", transition:"background 0.15s" }}
                  >
                    Solid
                  </button>
                  <button
                    onClick={() => updateLayer(key, { gradientEnabled:true })}
                    style={{ flex:1, padding:"6px 0", border:"none", fontWeight:700, fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", cursor:"pointer", background:l.gradientEnabled ? "#1976d2" : "transparent", color:l.gradientEnabled ? "#fff" : "#4a6a8a", transition:"background 0.15s" }}
                  >
                    Gradient
                  </button>
                </div>

                {/* Solid color controls */}
                {!l.gradientEnabled && (
                  <>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                      {recColors.map(c => {
                        const isSelected = l.color === c;
                        return (
                          <button key={c} onClick={() => updateLayer(key, { color:c })} title={c}
                            style={{ width:28, height:28, borderRadius:"50%", background:c, border:isSelected ? "3px solid #1976d2" : "2px solid rgba(0,0,0,0.18)", cursor:"pointer", flexShrink:0, boxShadow:isSelected ? "0 0 0 2px #fff, 0 0 0 4px #1976d2" : "none" }} />
                        );
                      })}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <input type="color" value={l.color} onChange={e => updateLayer(key, { color:e.target.value })}
                        style={{ width:40, height:36, border:"2px solid rgba(25,118,210,0.3)", borderRadius:8, cursor:"pointer", padding:2, background:"white", flexShrink:0 }} />
                      <span style={{ fontSize:12, color:"#4a6a8a" }}>Custom</span>
                      <code style={{ fontSize:11, color:"#0a1e38", background:"rgba(0,0,0,0.06)", padding:"2px 6px", borderRadius:4 }}>{l.color.toUpperCase()}</code>
                    </div>
                  </>
                )}

                {/* Gradient controls */}
                {l.gradientEnabled && (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {/* Live gradient preview */}
                    <div style={{
                      padding:"8px 12px", borderRadius:8,
                      background:`linear-gradient(${l.gradientAngle}deg, ${l.gradientColor1}, ${l.gradientColor2})`,
                      textAlign:"center", fontSize:15, fontWeight:700,
                      WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                      backgroundClip:"text", border:"1px solid rgba(0,0,0,0.1)",
                      fontFamily:l.fontFamily,
                    }}>
                      {l.text || "Preview"}
                    </div>
                    <div style={{ display:"flex", gap:10 }}>
                      <div style={{ flex:1 }}>
                        <LabelEl>Color 1</LabelEl>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <input type="color" value={l.gradientColor1}
                            onChange={e => updateLayer(key, { gradientColor1:e.target.value })}
                            style={{ width:36, height:30, border:"2px solid rgba(0,0,0,0.15)", borderRadius:6, cursor:"pointer", padding:2 }} />
                          <code style={{ fontSize:10, color:"#0a1e38", background:"rgba(0,0,0,0.06)", padding:"2px 5px", borderRadius:4 }}>{l.gradientColor1.toUpperCase()}</code>
                        </div>
                      </div>
                      <div style={{ flex:1 }}>
                        <LabelEl>Color 2</LabelEl>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <input type="color" value={l.gradientColor2}
                            onChange={e => updateLayer(key, { gradientColor2:e.target.value })}
                            style={{ width:36, height:30, border:"2px solid rgba(0,0,0,0.15)", borderRadius:6, cursor:"pointer", padding:2 }} />
                          <code style={{ fontSize:10, color:"#0a1e38", background:"rgba(0,0,0,0.06)", padding:"2px 5px", borderRadius:4 }}>{l.gradientColor2.toUpperCase()}</code>
                        </div>
                      </div>
                    </div>
                    <div>
                      <LabelEl>Angle — {l.gradientAngle}°</LabelEl>
                      <input type="range" min={0} max={360} step={5} value={l.gradientAngle}
                        onChange={e => updateLayer(key, { gradientAngle:+e.target.value })} style={{ width:"100%", accentColor:"#1976d2" }} />
                    </div>
                  </div>
                )}
              </div>

              {/* ── Drop Shadow ── */}
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

              {/* ── Stroke ── */}
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <LabelEl style={{ margin:0 }}>Stroke</LabelEl>
                  <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
                    <input type="checkbox" checked={l.strokeEnabled} onChange={e => updateLayer(key, { strokeEnabled:e.target.checked })}
                      style={{ accentColor:"#1976d2", width:15, height:15 }} />
                    <span style={{ fontSize:12, color:"#4a6a8a" }}>{l.strokeEnabled ? "On" : "Off"}</span>
                  </label>
                </div>
                {l.strokeEnabled && (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <div>
                      <LabelEl>Width — {l.strokeWidth}px</LabelEl>
                      <input type="range" min={1} max={12} step={0.5} value={l.strokeWidth}
                        onChange={e => updateLayer(key, { strokeWidth:+e.target.value })} style={{ width:"100%", accentColor:"#1976d2" }} />
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <input type="color" value={l.strokeColor}
                        onChange={e => updateLayer(key, { strokeColor:e.target.value })}
                        style={{ width:36, height:30, border:"2px solid rgba(0,0,0,0.15)", borderRadius:6, cursor:"pointer", padding:2 }} />
                      <span style={{ fontSize:12, color:"#4a6a8a" }}>Stroke color</span>
                      <code style={{ fontSize:11, color:"#0a1e38", background:"rgba(0,0,0,0.06)", padding:"2px 6px", borderRadius:4 }}>{l.strokeColor.toUpperCase()}</code>
                    </div>
                    {/* Corner style */}
                    <div>
                      <LabelEl>Corner Style</LabelEl>
                      <div style={{ display:"flex", borderRadius:8, overflow:"hidden", border:"1.5px solid rgba(25,118,210,0.2)" }}>
                        <button
                          onClick={() => updateLayer(key, { strokeRound:false })}
                          style={{ flex:1, padding:"6px 0", border:"none", fontWeight:700, fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", cursor:"pointer", background:!l.strokeRound ? "#1976d2" : "transparent", color:!l.strokeRound ? "#fff" : "#4a6a8a", transition:"background 0.15s" }}
                        >
                          Sharp
                        </button>
                        <button
                          onClick={() => updateLayer(key, { strokeRound:true })}
                          style={{ flex:1, padding:"6px 0", border:"none", fontWeight:700, fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", cursor:"pointer", background:l.strokeRound ? "#1976d2" : "transparent", color:l.strokeRound ? "#fff" : "#4a6a8a", transition:"background 0.15s" }}
                        >
                          Round
                        </button>
                      </div>
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
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(25,118,210,0.07)", borderRadius:10, padding:"10px 14px" }}>
              <span style={{ fontSize:13, fontWeight:700, color:"#0a1e38" }}>Show CTA Button</span>
              <div
                onClick={() => updateCta({ enabled:!layers.cta.enabled })}
                style={{ width:40, height:22, borderRadius:11, position:"relative", cursor:"pointer", background:layers.cta.enabled ? "#1976d2" : "rgba(0,0,0,0.2)", transition:"background 0.2s" }}
              >
                <div style={{ position:"absolute", top:3, left:layers.cta.enabled ? 21 : 3, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.25)" }} />
              </div>
            </div>

            {layers.cta.enabled && (
              <>
                <div>
                  <LabelEl>Button Text</LabelEl>
                  <input type="text" value={layers.cta.text} onChange={e => updateCta({ text:e.target.value })}
                    placeholder="e.g. Get Started" style={inputStyle} />
                </div>
                <div>
                  <LabelEl>Button Style</LabelEl>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                    {CTA_PATTERNS.map(p => {
                      const isSelected = layers.cta.pattern === p.value;
                      const preview = ctaButtonCss({ ...layers.cta, pattern:p.value });
                      return (
                        <button key={p.value} onClick={() => updateCta({ pattern:p.value })}
                          style={{ padding:"8px 6px", borderRadius:8, cursor:"pointer", border:isSelected ? "2px solid #1976d2" : "1.5px solid rgba(25,118,210,0.2)", background:isSelected ? "rgba(25,118,210,0.08)" : "rgba(255,255,255,0.6)", display:"flex", flexDirection:"column", alignItems:"center", gap:5, transition:"border 0.15s, background 0.15s" }}
                        >
                          <div style={{ ...preview, fontSize:9, padding:"3px 8px", borderRadius:p.value==="pill" ? 99 : 5, cursor:"default", pointerEvents:"none" }}>{p.label}</div>
                          <span style={{ fontSize:10, color:isSelected ? "#1976d2" : "#4a6a8a", fontWeight:600 }}>{p.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <LabelEl>Font</LabelEl>
                  <select value={layers.cta.fontFamily} onChange={e => updateCta({ fontFamily:e.target.value })} style={inputStyle}>
                    {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <LabelEl>Font Size — {layers.cta.fontSize}px</LabelEl>
                  <input type="range" min={11} max={32} step={1} value={layers.cta.fontSize}
                    onChange={e => updateCta({ fontSize:+e.target.value })} style={{ width:"100%", accentColor:"#1976d2" }} />
                </div>
                {layers.cta.pattern !== "pill" && (
                  <div>
                    <LabelEl>Corner Radius — {layers.cta.borderRadius}px</LabelEl>
                    <input type="range" min={0} max={32} step={1} value={layers.cta.borderRadius}
                      onChange={e => updateCta({ borderRadius:+e.target.value })} style={{ width:"100%", accentColor:"#1976d2" }} />
                  </div>
                )}
                <div>
                  <LabelEl>Scale — {layers.cta.scale.toFixed(2)}×</LabelEl>
                  <input type="range" min={0.5} max={3} step={0.05} value={layers.cta.scale}
                    onChange={e => updateCta({ scale:+e.target.value })} style={{ width:"100%", accentColor:"#1976d2" }} />
                </div>
                <div>
                  <LabelEl>Button Color</LabelEl>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                    {recColors.map(c => {
                      const isSelected = layers.cta.bgColor === c;
                      return (
                        <button key={c} onClick={() => updateCta({ bgColor:c })} title={c}
                          style={{ width:28, height:28, borderRadius:"50%", background:c, border:isSelected ? "3px solid #1976d2" : "2px solid rgba(0,0,0,0.18)", cursor:"pointer", flexShrink:0, boxShadow:isSelected ? "0 0 0 2px #fff, 0 0 0 4px #1976d2" : "none" }} />
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
