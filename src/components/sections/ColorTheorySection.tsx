"use client";

import React, { useState, useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SelectedColor {
  hue: number;
  sat: number;
  lightness: number;
  hex: string;
  name: string;
}

interface ContrastOption {
  label: string;
  relation: string;
  hue: number;
  hex: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WHEEL_SIZE = 360;
const WHEEL_RADIUS = WHEEL_SIZE / 2 - 2;

// ---------------------------------------------------------------------------
// Color utilities
// ---------------------------------------------------------------------------

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const HUE_NAMES: [number, string][] = [
  [0, "Red"], [15, "Red-Orange"], [30, "Orange"], [45, "Amber"],
  [60, "Yellow"], [75, "Yellow-Green"], [90, "Chartreuse"], [105, "Lime"],
  [120, "Green"], [135, "Spring Green"], [150, "Mint"], [165, "Aquamarine"],
  [180, "Cyan"], [195, "Sky Blue"], [210, "Azure"], [225, "Cobalt"],
  [240, "Blue"], [255, "Blue-Violet"], [270, "Violet"], [285, "Purple"],
  [300, "Magenta"], [315, "Rose"], [330, "Crimson"], [345, "Carmine"],
];

function hueName(h: number): string {
  const normalized = ((h % 360) + 360) % 360;
  let best = HUE_NAMES[0][1];
  let bestDist = 360;
  for (const [angle, name] of HUE_NAMES) {
    const dist = Math.min(Math.abs(normalized - angle), 360 - Math.abs(normalized - angle));
    if (dist < bestDist) { bestDist = dist; best = name; }
  }
  return best;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const clean = hex.replace(/^#/, "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  return rgbToHsl(r, g, b);
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function cmykToRgb(c: number, m: number, y: number, k: number): [number, number, number] {
  const f = (x: number) => Math.round(255 * (1 - x / 100) * (1 - k / 100));
  return [f(c), f(m), f(y)];
}

function parseSearchInput(raw: string): { h: number; s: number; l: number } | null {
  const v = raw.trim();
  if (/^#?[0-9a-f]{3,6}$/i.test(v)) return hexToHsl(v.startsWith("#") ? v : "#" + v);
  const rgb = v.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (rgb) return rgbToHsl(+rgb[1] / 255, +rgb[2] / 255, +rgb[3] / 255);
  const hsl = v.match(/^hsl\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)$/i);
  if (hsl) return { h: +hsl[1], s: +hsl[2], l: +hsl[3] };
  const cmyk = v.match(/^cmyk\(\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)$/i);
  if (cmyk) {
    const [r, g, b] = cmykToRgb(+cmyk[1], +cmyk[2], +cmyk[3], +cmyk[4]);
    return rgbToHsl(r / 255, g / 255, b / 255);
  }
  return null;
}

function hexLuminance(hex: string): number {
  const clean = hex.replace(/^#/, "");
  const lin = (v: number) => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  const r = lin(parseInt(clean.slice(0, 2), 16) / 255);
  const g = lin(parseInt(clean.slice(2, 4), 16) / 255);
  const b = lin(parseInt(clean.slice(4, 6), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexContrastRatio(hex1: string, hex2: string): number {
  const l1 = hexLuminance(hex1), l2 = hexLuminance(hex2);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function wcagLevel(ratio: number): { label: string; color: string } {
  if (ratio >= 7)   return { label: "AAA — Excellent contrast", color: "#16a34a" };
  if (ratio >= 4.5) return { label: "AA — Good contrast",       color: "#2563eb" };
  if (ratio >= 3)   return { label: "AA Large — Borderline",    color: "#d97706" };
  return               { label: "Fail — Low contrast",          color: "#ef4444" };
}

function textOnBg(hex: string): string {
  return hexLuminance(hex) > 0.179 ? "#0a1e38" : "#ffffff";
}

// ---------------------------------------------------------------------------
// Contrast options
// ---------------------------------------------------------------------------

function getContrastOptions(hue: number): ContrastOption[] {
  const sat = 80;
  const lightness = 50;
  const pairs: [string, string, number][] = [
    ["Analogous",      "Adjacent hue · harmonious",       (hue + 30) % 360],
    ["Color Contrast", "Opposite hue · maximum contrast", (hue + 180) % 360],
  ];
  return pairs.map(([label, relation, h]) => ({
    label, relation, hue: h, hex: hslToHex(h, sat, lightness),
  }));
}

// ---------------------------------------------------------------------------
// Color Wheel
// ---------------------------------------------------------------------------

function ColorWheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const [selected, setSelected]       = useState<SelectedColor | null>(null);
  const [activeOption, setActiveOption] = useState<string | null>(null);
  const [customHex, setCustomHex]     = useState<string>("#ff6b35");
  const [searchVal, setSearchVal]     = useState("");
  const [searchErr, setSearchErr]     = useState(false);

  // Draw smooth gradient wheel once on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cx = WHEEL_SIZE / 2;
    const cy = WHEEL_SIZE / 2;
    const r  = WHEEL_RADIUS;
    const steps = 360;

    for (let i = 0; i < steps; i++) {
      const startAngle = (i / steps) * 2 * Math.PI - Math.PI / 2;
      const endAngle   = ((i + 1) / steps) * 2 * Math.PI - Math.PI / 2;
      const midAngle   = (startAngle + endAngle) / 2;
      const hue = i;

      const grad = ctx.createLinearGradient(
        cx, cy,
        cx + r * Math.cos(midAngle),
        cy + r * Math.sin(midAngle),
      );
      grad.addColorStop(0, `hsl(${hue}, 0%, 100%)`);
      grad.addColorStop(1, `hsl(${hue}, 100%, 50%)`);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }, []);

  function pickColorFromEvent(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - WHEEL_SIZE / 2;
    const y = e.clientY - rect.top  - WHEEL_SIZE / 2;
    const dist = Math.sqrt(x * x + y * y);
    if (dist > WHEEL_RADIUS) return;

    const angleRad = Math.atan2(y, x) + Math.PI / 2;
    const hue = Math.round(((angleRad * 180 / Math.PI) + 360) % 360);
    const sat = Math.round((dist / WHEEL_RADIUS) * 100);
    const lightness = 50;
    const hex = hslToHex(hue, sat, lightness);

    setSelected({ hue, sat, lightness, hex, name: hueName(hue) });
    setActiveOption(null);
  }

  function pickColorAt(e: React.MouseEvent<HTMLCanvasElement>) {
    pickColorFromEvent(e);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseSearchInput(searchVal);
    if (!parsed) { setSearchErr(true); return; }
    setSearchErr(false);
    const sat = Math.max(parsed.s, 60);
    const hex = hslToHex(parsed.h, sat, parsed.l);
    setSelected({ hue: parsed.h, sat, lightness: parsed.l, hex, name: hueName(parsed.h) });
    setActiveOption(null);
  }

  // Derive active comparison
  let comparison: ContrastOption | null = null;
  if (selected && activeOption) {
    if (activeOption === "Custom") {
      const hsl = hexToHsl(customHex) ?? { h: 0, s: 80, l: 50 };
      comparison = { label: "Custom", relation: "Your chosen color", hue: hsl.h, hex: customHex };
    } else {
      comparison = getContrastOptions(selected.hue).find(o => o.label === activeOption) ?? null;
    }
  }

  const ratio = selected && comparison ? hexContrastRatio(selected.hex, comparison.hex) : null;
  const wcag  = ratio ? wcagLevel(ratio) : null;

  // Cursor dot position on the wheel canvas
  const cursorPos = selected ? (() => {
    const rad = (selected.hue - 90) * Math.PI / 180;
    return {
      x: WHEEL_SIZE / 2 + (selected.sat / 100) * WHEEL_RADIUS * Math.cos(rad),
      y: WHEEL_SIZE / 2 + (selected.sat / 100) * WHEEL_RADIUS * Math.sin(rad),
    };
  })() : null;

  const contrastOptions = selected ? getContrastOptions(selected.hue) : [];

  // Shared button style builder
  function optionBtnStyle(isActive: boolean): React.CSSProperties {
    return {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "7px 10px",
      borderRadius: 9,
      background: isActive ? "rgba(25,118,210,0.12)" : "rgba(255,255,255,0.55)",
      border: `1.5px solid ${isActive ? "rgba(25,118,210,0.45)" : "rgba(25,118,210,0.15)"}`,
      cursor: "pointer",
      textAlign: "left",
      transition: "background 0.15s, border-color 0.15s",
    };
  }

  return (
    <div>
      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: 28, display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => { setSearchVal(e.target.value); setSearchErr(false); }}
            placeholder="Search — HEX (#1976D2)  ·  RGB (rgb(25,118,210))  ·  HSL (hsl(210,79%,46%))  ·  CMYK (cmyk(88,44,0,18))"
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 16px", borderRadius: 10, border: `1.5px solid ${searchErr ? "#ef4444" : "rgba(25,118,210,0.3)"}`, background: "rgba(255,255,255,0.7)", fontSize: 14, color: "#0a1e38", outline: "none", fontFamily: "var(--font-space)", backdropFilter: "blur(8px)" }}
          />
          {searchErr && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#ef4444" }}>Invalid format</span>}
        </div>
        <button
          type="submit"
          style={{ padding: "10px 20px", borderRadius: 10, background: "#1976d2", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font-space)", transition: "background 0.18s, color 0.18s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f0a500"; e.currentTarget.style.color = "#1a0a00"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#1976d2"; e.currentTarget.style.color = "#fff"; }}
        >Find Color</button>
      </form>

      {/* Wheel + panels */}
      <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* Canvas wheel */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <canvas
            ref={canvasRef}
            width={WHEEL_SIZE}
            height={WHEEL_SIZE}
            onMouseDown={e => { isDragging.current = true; pickColorFromEvent(e); }}
            onMouseMove={e => { if (isDragging.current) pickColorFromEvent(e); }}
            onMouseUp={() => { isDragging.current = false; }}
            onMouseLeave={() => { isDragging.current = false; }}
            onClick={pickColorAt}
            style={{ borderRadius: "50%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", cursor: "crosshair", display: "block" }}
            aria-label="Interactive color wheel — click or drag to select a color"
          />
          {cursorPos && (
            <div style={{
              position: "absolute",
              left: cursorPos.x - 8,
              top:  cursorPos.y - 8,
              width: 16, height: 16,
              borderRadius: "50%",
              border: "3px solid white",
              boxShadow: "0 0 0 1.5px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.3)",
              background: selected?.hex,
              pointerEvents: "none",
            }} />
          )}
        </div>

        {/* Info panel */}
        <div style={{ ...styles.infoPanel, flexShrink: 0, maxWidth: 240 }}>
          {selected ? (
            <>
              <div style={{ ...styles.colorSwatch, backgroundColor: selected.hex }} />
              <div style={styles.colorName}>{selected.name}</div>
              <div style={styles.colorValues}><span style={styles.badge}>HEX</span><code style={styles.code}>{selected.hex.toUpperCase()}</code></div>
              <div style={styles.colorValues}><span style={styles.badge}>HSL</span><code style={styles.code}>{selected.hue}°&nbsp;{selected.sat}%&nbsp;{selected.lightness}%</code></div>

              <div style={{ marginTop: 6 }}>
                <p style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#4f6ef7", fontWeight: 700, margin: "0 0 10px" }}>Contrast Options</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

                  {/* Preset contrast options */}
                  {contrastOptions.map((c) => {
                    const isActive = activeOption === c.label;
                    return (
                      <button
                        key={c.label}
                        onClick={() => setActiveOption(isActive ? null : c.label)}
                        style={optionBtnStyle(isActive)}
                        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.85)"; } }}
                        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.55)"; } }}
                      >
                        <span style={{ width: 28, height: 28, borderRadius: 7, background: c.hex, flexShrink: 0, display: "block", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#0a1e38" }}>{c.label}</div>
                          <div style={{ fontSize: 11, color: "#4a6a8a" }}>{c.relation} · <code style={{ fontFamily: "monospace" }}>{c.hex.toUpperCase()}</code></div>
                        </div>
                        {isActive && <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>✓</span>}
                      </button>
                    );
                  })}

                  {/* Custom color picker option */}
                  {(() => {
                    const isActive = activeOption === "Custom";
                    return (
                      <div>
                        <button
                          onClick={() => setActiveOption(isActive ? null : "Custom")}
                          style={optionBtnStyle(isActive)}
                          onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.85)"; } }}
                          onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.55)"; } }}
                        >
                          <span style={{ width: 28, height: 28, borderRadius: 7, background: customHex, flexShrink: 0, display: "block", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#0a1e38" }}>Custom Color</div>
                            <div style={{ fontSize: 11, color: "#4a6a8a" }}>Pick any color · <code style={{ fontFamily: "monospace" }}>{customHex.toUpperCase()}</code></div>
                          </div>
                          {isActive && <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>✓</span>}
                        </button>
                        {isActive && (
                          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px 4px" }}>
                            <input
                              type="color"
                              value={customHex}
                              onChange={(e) => setCustomHex(e.target.value)}
                              style={{ width: 44, height: 44, border: "2px solid rgba(25,118,210,0.25)", borderRadius: 10, cursor: "pointer", padding: 3, background: "white", flexShrink: 0 }}
                            />
                            <span style={{ fontSize: 11, color: "#4a6a8a", lineHeight: 1.5 }}>
                              Click the swatch to<br/>open the color picker
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                </div>
              </div>
            </>
          ) : (
            <div style={styles.infoPanelHint}>Click anywhere on the wheel to explore colors</div>
          )}
        </div>

        {/* Comparison panel */}
        {selected && comparison && ratio !== null && wcag !== null && (
          <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#4f6ef7", fontWeight: 700, margin: 0 }}>Comparison</p>

            {/* Side-by-side swatches */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}>
              <div style={{ background: selected.hex, padding: "22px 16px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: textOnBg(selected.hex), opacity: 0.65, marginBottom: 4 }}>Selected</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: textOnBg(selected.hex), lineHeight: 1.2 }}>{selected.name}</div>
                <code style={{ fontSize: 11, color: textOnBg(selected.hex), opacity: 0.8, fontFamily: "monospace", display: "block", marginTop: 4 }}>{selected.hex.toUpperCase()}</code>
              </div>
              <div style={{ background: comparison.hex, padding: "22px 16px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: textOnBg(comparison.hex), opacity: 0.65, marginBottom: 4 }}>{comparison.label}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: textOnBg(comparison.hex), lineHeight: 1.2 }}>{hueName(comparison.hue)}</div>
                <code style={{ fontSize: 11, color: textOnBg(comparison.hex), opacity: 0.8, fontFamily: "monospace", display: "block", marginTop: 4 }}>{comparison.hex.toUpperCase()}</code>
              </div>
            </div>

            {/* Contrast ratio */}
            <div style={{ background: "rgba(255,255,255,0.65)", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(25,118,210,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#4a6a8a", fontWeight: 500 }}>Contrast Ratio</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#0a1e38", fontFamily: "monospace" }}>{ratio.toFixed(1)}:1</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: wcag.color }}>{wcag.label}</div>
            </div>

            {/* Live text preview */}
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(25,118,210,0.12)" }}>
              <div style={{ background: comparison.hex, padding: "16px" }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: selected.hex, fontFamily: "var(--font-syne)" }}>Heading in selected color</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: selected.hex, opacity: 0.75 }}>Body text on contrast background</p>
              </div>
              <div style={{ background: selected.hex, padding: "16px" }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: comparison.hex, fontFamily: "var(--font-syne)" }}>Heading in contrast color</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: comparison.hex, opacity: 0.75 }}>Body text on selected background</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Learning Cards
// ---------------------------------------------------------------------------

interface LearningCardProps {
  icon: React.ReactNode;
  title: string;
  body: string;
  visual: React.ReactNode;
}

function LearningCard({ icon, title, body, visual }: LearningCardProps) {
  return (
    <div style={styles.card}>
      <div style={styles.cardIcon}>{icon}</div>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardBody}>{body}</p>
      <div style={styles.cardVisual}>{visual}</div>
    </div>
  );
}

// SVG icons

function IconHarmony() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" stroke="#4f6ef7" strokeWidth="1.5" />
      <circle cx="10" cy="16" r="5" fill="#4f6ef7" fillOpacity="0.7" />
      <circle cx="22" cy="16" r="5" fill="#f74fa8" fillOpacity="0.7" />
      <circle cx="16" cy="16" r="5" fill="#f7c24f" fillOpacity="0.7" />
    </svg>
  );
}

function IconPsychology() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 4C10.477 4 6 8.477 6 14c0 3.5 1.8 6.6 4.5 8.4V26h11v-3.6C24.2 20.6 26 17.5 26 14c0-5.523-4.477-10-10-10z" stroke="#7c3aed" strokeWidth="1.5" fill="none" />
      <path d="M13 16c0-1.657 1.343-3 3-3s3 1.343 3 3" stroke="#7c3aed" strokeWidth="1.5" />
      <line x1="16" y1="10" x2="16" y2="13" stroke="#7c3aed" strokeWidth="1.5" />
    </svg>
  );
}

function IconContrast() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" fill="#1e293b" />
      <path d="M16 4a12 12 0 0 1 0 24V4z" fill="#f8fafc" />
      <circle cx="16" cy="16" r="12" stroke="#334155" strokeWidth="1.5" />
    </svg>
  );
}

function IconTypography() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="3" y="6" width="26" height="20" rx="3" fill="#0ea5e9" fillOpacity="0.15" stroke="#0ea5e9" strokeWidth="1.5" />
      <text x="9" y="21" fontFamily="serif" fontSize="16" fill="#0ea5e9" fontWeight="bold">Aa</text>
    </svg>
  );
}

// Small visual examples

function HarmonyVisual() {
  const swatches = [
    ["#4f6ef7", "#f74fa8", "#f7c24f"],
    ["#22c55e", "#3b82f6", "#a855f7"],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {swatches.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 6 }}>
          {row.map((c) => (
            <div key={c} title={c} style={{ width: 36, height: 22, borderRadius: 4, backgroundColor: c, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          ))}
        </div>
      ))}
      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Triadic &amp; analogous palettes</div>
    </div>
  );
}

function PsychologyVisual() {
  const emotions: [string, string, string][] = [
    ["#ef4444", "Red", "Energy"],
    ["#3b82f6", "Blue", "Calm"],
    ["#22c55e", "Green", "Growth"],
    ["#f59e0b", "Yellow", "Joy"],
  ];
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {emotions.map(([color, name, feel]) => (
        <div key={name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#334155" }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: color, display: "inline-block", flexShrink: 0 }} />
          <span><strong>{name}</strong> — {feel}</span>
        </div>
      ))}
    </div>
  );
}

function ContrastVisual() {
  const pairs: [string, string, string][] = [
    ["#ffffff", "#1e293b", "AAA"],
    ["#fbbf24", "#1e293b", "AA"],
    ["#6b7280", "#d1d5db", "Fail"],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {pairs.map(([bg, fg, label]) => (
        <div key={label + bg} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ background: bg, color: fg, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, border: "1px solid rgba(0,0,0,0.08)", minWidth: 60, textAlign: "center" }}>Sample</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: label === "AAA" ? "#16a34a" : label === "AA" ? "#d97706" : "#ef4444" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function TypographyVisual() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {(
        [
          ["#1e293b", "#f8fafc", "Dark on Light"],
          ["#f8fafc", "#1e3a5f", "Light on Dark"],
          ["#4f6ef7", "#fefce8", "Accent"],
        ] as [string, string, string][]
      ).map(([color, bg, label]) => (
        <div key={label} style={{ backgroundColor: bg, padding: "3px 10px", borderRadius: 4, fontSize: 11, color, fontWeight: 600, border: "1px solid rgba(0,0,0,0.06)" }}>
          {label}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Section
// ---------------------------------------------------------------------------

export default function ColorTheorySection() {
  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.headingGroup}>
          <h2 style={styles.sectionTitle}>Color Theory</h2>
          <p style={styles.sectionSubtitle}>
            Master the principles behind effective color use — from the science of the wheel to accessibility standards.
          </p>
        </div>

        <div style={styles.wheelCard}>
          <h3 style={styles.wheelCardTitle}>Interactive Color Wheel</h3>
          <p style={styles.wheelCardSub}>
            Click anywhere on the wheel to select a color. Use the contrast options to compare harmony and readability.
          </p>
          <ColorWheel />
        </div>

        <div style={styles.grid}>
          <LearningCard icon={<IconHarmony />} title="Color Harmony" body="Harmonious palettes emerge when colors relate predictably on the wheel. Complementary pairs sit opposite each other, while triadic schemes use three evenly spaced hues for vibrant balance. Analogous groups of adjacent hues feel calm and cohesive." visual={<HarmonyVisual />} />
          <LearningCard icon={<IconPsychology />} title="Color Psychology" body="Colors carry emotional weight that varies across cultures and contexts. Red signals urgency and passion; blue conveys trust and calm. Understanding these associations helps you guide user perception and reinforce your brand message." visual={<PsychologyVisual />} />
          <LearningCard icon={<IconContrast />} title="Contrast & Accessibility" body="WCAG defines minimum contrast ratios — 4.5:1 for normal text (AA) and 7:1 for AAA compliance. Sufficient contrast ensures readability for users with low vision or color blindness. Always verify foreground/background pairs before shipping." visual={<ContrastVisual />} />
          <LearningCard icon={<IconTypography />} title="Typography & Color" body="The color of text affects legibility as much as the typeface itself. Light text on dark backgrounds can reduce eye strain in dim settings, while dark text on white remains the gold standard for long-form reading. Accent colors in headings create visual hierarchy." visual={<TypographyVisual />} />
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  section: {
    width: "100%",
    padding: "80px 24px",
    backgroundColor: "#f0f6ff",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  container: {
    maxWidth: 960,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 48,
  },
  headingGroup: { textAlign: "center" },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 12px",
    letterSpacing: "-0.5px",
  },
  sectionSubtitle: {
    fontSize: 17,
    color: "#475569",
    margin: 0,
    maxWidth: 560,
    marginInline: "auto",
    lineHeight: 1.6,
  },
  wheelCard: {
    background: "rgba(210,230,255,0.55)",
    borderRadius: 20,
    padding: "36px 40px",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(148,196,255,0.4)",
    boxShadow: "0 4px 24px rgba(79,110,247,0.08)",
  },
  wheelCardTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 6px",
  },
  wheelCardSub: {
    fontSize: 14,
    color: "#475569",
    margin: "0 0 28px",
    lineHeight: 1.55,
  },
  wheelSvg: {
    flexShrink: 0,
    display: "block",
    borderRadius: "50%",
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  },
  infoPanel: {
    flex: 1,
    minWidth: 180,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  infoPanelHint: {
    fontSize: 14,
    color: "#94a3b8",
    fontStyle: "italic",
    lineHeight: 1.5,
  },
  colorSwatch: {
    width: 80,
    height: 80,
    borderRadius: 14,
    boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
  },
  colorName: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
  },
  colorValues: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    color: "#4f6ef7",
    background: "rgba(79,110,247,0.1)",
    padding: "2px 7px",
    borderRadius: 6,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    whiteSpace: "nowrap" as const,
  },
  code: {
    fontSize: 14,
    fontFamily: "'Fira Code', 'Cascadia Code', monospace",
    color: "#1e293b",
    letterSpacing: "0.02em",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: 24,
  },
  card: {
    background: "rgba(210,230,255,0.55)",
    borderRadius: 18,
    padding: "28px 28px 24px",
    border: "1px solid rgba(148,196,255,0.4)",
    boxShadow: "0 2px 16px rgba(79,110,247,0.07)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    backdropFilter: "blur(6px)",
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "rgba(255,255,255,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  },
  cardBody: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.65,
    margin: 0,
    flex: 1,
  },
  cardVisual: {
    marginTop: 4,
    padding: "14px 16px",
    background: "rgba(255,255,255,0.6)",
    borderRadius: 10,
    border: "1px solid rgba(148,196,255,0.3)",
  },
};
