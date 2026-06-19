"use client";

import React, { useState, useRef } from "react";

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

export interface TextLayersState {
  header: TextLayerData;
  subtext: TextLayerData;
}

export function defaultTextLayers(): TextLayersState {
  return {
    header:  { text:"", fontFamily:"var(--font-syne), sans-serif",  fontSize:52, fontWeight:700, color:"#ffffff", x:50, y:35, shadowEnabled:false, shadowBlur:6,  shadowColor:"rgba(0,0,0,0.65)", scale:1 },
    subtext: { text:"", fontFamily:"var(--font-space), sans-serif", fontSize:26, fontWeight:400, color:"#ffffff", x:50, y:55, shadowEnabled:false, shadowBlur:4,  shadowColor:"rgba(0,0,0,0.5)",  scale:1 },
  };
}

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
const SAFE = 8;

export default function TextDesignerSection({ imageUrl, extractedColors, layers, onLayersChange }: Props) {
  const [activeTab, setActiveTab] = useState<"header"|"subtext">("header");
  const draggingRef = useRef<"header"|"subtext"|null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layer = layers[activeTab];

  function updateLayer(key: "header"|"subtext", patch: Partial<TextLayerData>) {
    onLayersChange({ ...layers, [key]: { ...layers[key], ...patch } });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!draggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left)  / rect.width)  * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top)   / rect.height) * 100));
    onLayersChange({ ...layers, [draggingRef.current]: { ...layers[draggingRef.current], x, y } });
  }

  const domBg = extractedColors[0] ?? "#1976D2";
  const candidates = ["#ffffff","#000000",...extractedColors.filter((_,i)=>i>0)];
  const recColors = [...new Set(candidates)]
    .slice(0,8)
    .map(c => ({ hex:c, ratio: contrastRatio(c, domBg) }))
    .sort((a,b) => b.ratio - a.ratio)
    .slice(0,6)
    .map(c => c.hex);

  const curLayer = layers[activeTab];
  const cr = contrastRatio(curLayer.color, domBg);
  const outsideSafe = (l: TextLayerData) => l.text && (l.x < SAFE || l.x > 100-SAFE || l.y < SAFE || l.y > 100-SAFE);

  const inputStyle: React.CSSProperties = {
    width:"100%", boxSizing:"border-box", padding:"8px 10px", borderRadius:8,
    border:"1.5px solid rgba(25,118,210,0.25)", background:"rgba(255,255,255,0.7)",
    fontSize:13, color:"#0a1e38", outline:"none", fontFamily:"var(--font-space), sans-serif",
  };

  return (
    <div style={{ display:"flex", gap:28, alignItems:"flex-start", flexWrap:"wrap" }}>

      {/* LEFT: Image canvas */}
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
                  padding:"2px 4px", borderRadius:2,
                  pointerEvents:"all",
                }}
              >
                {isEmpty ? (key === "header" ? "Header text" : "Subtext") : l.text}
              </div>
            );
          })}
        </div>

        {/* Safe zone warnings */}
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
        </div>
        <p style={{ fontSize:12, color:"#4a6a8a", margin:"8px 0 0", lineHeight:1.5 }}>
          Click &amp; drag text to reposition · Dashed box = safe zone
        </p>
      </div>

      {/* RIGHT: Controls */}
      <div style={{ flex:"0 0 290px", minWidth:260, background:"rgba(255,255,255,0.55)", backdropFilter:"blur(12px)", borderRadius:16, border:"1px solid rgba(25,118,210,0.18)", padding:22, display:"flex", flexDirection:"column", gap:18 }}>

        {/* Layer tabs */}
        <div style={{ display:"flex", borderRadius:10, overflow:"hidden", border:"1.5px solid rgba(25,118,210,0.2)" }}>
          {(["header","subtext"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex:1, padding:"9px 0", border:"none", fontWeight:700, fontSize:12,
              textTransform:"uppercase", letterSpacing:"0.8px", cursor:"pointer",
              background: activeTab===tab ? "#1976d2" : "transparent",
              color: activeTab===tab ? "#fff" : "#4a6a8a",
              transition:"background 0.15s",
            }}>
              {tab === "header" ? "Header" : "Subtext"}
            </button>
          ))}
        </div>

        {/* Text input */}
        <div>
          <LabelEl>Text</LabelEl>
          <input type="text" value={layer.text} onChange={e => updateLayer(activeTab, { text:e.target.value })}
            placeholder={activeTab==="header" ? "Enter headline..." : "Enter subtext..."} style={inputStyle} />
        </div>

        {/* Font family */}
        <div>
          <LabelEl>Font Family</LabelEl>
          <select value={layer.fontFamily} onChange={e => updateLayer(activeTab, { fontFamily:e.target.value })} style={inputStyle}>
            {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>

        {/* Font size */}
        <div>
          <LabelEl>Font Size — {layer.fontSize}px</LabelEl>
          <input type="range" min={12} max={150} step={1} value={layer.fontSize}
            onChange={e => updateLayer(activeTab, { fontSize:+e.target.value })} style={{ width:"100%", accentColor:"#1976d2" }} />
        </div>

        {/* Font weight */}
        <div>
          <LabelEl>Weight — {layer.fontWeight}</LabelEl>
          <input type="range" min={100} max={900} step={100} value={layer.fontWeight}
            onChange={e => updateLayer(activeTab, { fontWeight:+e.target.value })} style={{ width:"100%", accentColor:"#1976d2" }} />
        </div>

        {/* Scale */}
        <div>
          <LabelEl>Scale — {layer.scale.toFixed(2)}×</LabelEl>
          <input type="range" min={0.5} max={3} step={0.05} value={layer.scale}
            onChange={e => updateLayer(activeTab, { scale:+e.target.value })} style={{ width:"100%", accentColor:"#1976d2" }} />
        </div>

        {/* Color */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <LabelEl style={{ margin:0 }}>Text Color</LabelEl>
            <span style={{ fontSize:11, fontWeight:700, color:wcagTagColor(cr), background:`${wcagTagColor(cr)}18`, padding:"2px 8px", borderRadius:5 }}>
              {wcagTag(cr)} {cr.toFixed(1)}:1
            </span>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
            {recColors.map(c => {
              const isSelected = layer.color === c;
              return (
                <button key={c} onClick={() => updateLayer(activeTab, { color:c })} title={c}
                  style={{ width:28, height:28, borderRadius:"50%", background:c, border: isSelected ? "3px solid #1976d2" : "2px solid rgba(0,0,0,0.18)", cursor:"pointer", flexShrink:0, boxShadow: isSelected ? "0 0 0 2px #fff, 0 0 0 4px #1976d2" : "none" }}
                />
              );
            })}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <input type="color" value={layer.color} onChange={e => updateLayer(activeTab, { color:e.target.value })}
              style={{ width:40, height:36, border:"2px solid rgba(25,118,210,0.3)", borderRadius:8, cursor:"pointer", padding:2, background:"white", flexShrink:0 }} />
            <span style={{ fontSize:12, color:"#4a6a8a" }}>Custom</span>
            <code style={{ fontSize:11, color:"#0a1e38", background:"rgba(0,0,0,0.06)", padding:"2px 6px", borderRadius:4 }}>{layer.color.toUpperCase()}</code>
          </div>
        </div>

        {/* Drop shadow */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <LabelEl style={{ margin:0 }}>Drop Shadow</LabelEl>
            <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
              <input type="checkbox" checked={layer.shadowEnabled} onChange={e => updateLayer(activeTab, { shadowEnabled:e.target.checked })}
                style={{ accentColor:"#1976d2", width:15, height:15 }} />
              <span style={{ fontSize:12, color:"#4a6a8a" }}>{layer.shadowEnabled ? "On" : "Off"}</span>
            </label>
          </div>
          {layer.shadowEnabled && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div>
                <LabelEl>Blur — {layer.shadowBlur}px</LabelEl>
                <input type="range" min={0} max={30} step={1} value={layer.shadowBlur}
                  onChange={e => updateLayer(activeTab, { shadowBlur:+e.target.value })} style={{ width:"100%", accentColor:"#1976d2" }} />
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <input type="color" value={"#000000"}
                  onChange={e => updateLayer(activeTab, { shadowColor:e.target.value })}
                  style={{ width:36, height:30, border:"2px solid rgba(0,0,0,0.15)", borderRadius:6, cursor:"pointer", padding:2 }} />
                <span style={{ fontSize:12, color:"#4a6a8a" }}>Shadow color</span>
              </div>
            </div>
          )}
        </div>

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
