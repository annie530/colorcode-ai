"use client";

import { useState } from "react";

const CARD: React.CSSProperties = {
  background: "rgba(210, 230, 255, 0.55)",
  border: "1px solid rgba(25,118,210,0.25)",
  backdropFilter: "blur(20px)",
  borderRadius: 16,
};

export default function Hero() {
  return (
    <section style={{ padding: "96px 60px 80px", width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>

        {/* LEFT — text */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "#1565c0", background: "rgba(25,118,210,0.1)", border: "1px solid rgba(25,118,210,0.2)", borderRadius: 20, padding: "5px 14px", marginBottom: 28 }}>
            For designers &amp; beginners
          </div>

          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(42px, 5vw, 72px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 24, color: "#0a1e38" }}>
            Color that{" "}
            <span style={{ color: "#1565c0" }}>works</span>
            <br />for your{" "}
            <span style={{ color: "#1976d2" }}>DESIGN</span>
          </h1>

          <p style={{ fontSize: 19, fontWeight: 400, color: "#2a4a6a", lineHeight: 1.75, marginBottom: 32, maxWidth: 480 }}>
            Upload your design and get instant text color recommendations backed by color theory. See exactly why each color was chosen.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 48 }}>
            <HeroBtn href="/upload" primary>Analyse my design →</HeroBtn>
            <HeroBtn href="/color-theory">Learn color theory</HeroBtn>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            {[
              ["WCAG", "Accessibility standard"],
              ["AI-Powered", "Color analysis"],
              ["Real-time", "Live preview"],
            ].map(([a, b]) => (
              <div key={a} style={{ borderLeft: "2px solid rgba(25,118,210,0.25)", paddingLeft: 16 }}>
                <div style={{ fontFamily: "var(--font-syne)", fontSize: 15, fontWeight: 800, color: "#1976d2" }}>{a}</div>
                <div style={{ fontSize: 12, color: "#4a6a8a", marginTop: 2 }}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — interactive demo card */}
        <DemoCard />

      </div>
    </section>
  );
}

const RECS = [
  { hex: "#E8F4FD", bg: "#e8f4fd", name: "Light blue-white", desc: "WCAG AAA · 11.2:1 contrast" },
  { hex: "#F0C040", bg: "#f0c040", name: "Warm yellow",       desc: "Analogous harmony · 8.4:1"  },
  { hex: "#7ECFBE", bg: "#7ecfbe", name: "Soft teal",         desc: "Complementary · 5.9:1"      },
];

function DemoCard() {
  const [selected, setSelected] = useState(0);
  const activeColor = RECS[selected].bg;

  return (
    <div className="reveal" style={{ background: "rgba(210,230,255,0.55)", border: "1px solid rgba(25,118,210,0.25)", backdropFilter: "blur(20px)", borderRadius: 16, padding: 24 }}>
      {/* Window chrome */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#f48c7f","#f0c040","#7ecfbe"].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "block" }} />)}
        </div>
        <span style={{ fontSize: 11, color: "#1e4060" }}>Sample design</span>
      </div>

      {/* Mock design — text color updates live */}
      <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 16, border: "1px solid rgba(100,160,255,0.15)" }}>
        <div style={{ padding: "26px 22px", background: "linear-gradient(145deg,#1a3d5c,#0f2540)", transition: "all 0.25s" }}>
          <p style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: activeColor, marginBottom: 8, transition: "color 0.25s" }}>Annual Report 2025</p>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 22, fontWeight: 800, color: activeColor, lineHeight: 1.3, transition: "color 0.25s" }}>Design Meets<br />Function</h2>
          <p style={{ fontSize: 12, color: activeColor, opacity: 0.6, marginTop: 6, transition: "color 0.25s" }}>Clarity in every brand touchpoint.</p>
        </div>
      </div>

      {/* Recommendations — each row is clickable */}
      <p style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#1e4060", marginBottom: 10 }}>AI recommendations</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {RECS.map((r, i) => {
          const isActive = selected === i;
          return (
            <button
              key={r.hex}
              onClick={() => setSelected(i)}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "8px 10px", borderRadius: 8, width: "100%",
                background: isActive ? "rgba(25,118,210,0.15)" : "rgba(255,255,255,0.45)",
                border: `1.5px solid ${isActive ? "rgba(25,118,210,0.5)" : "rgba(100,160,255,0.15)"}`,
                cursor: "pointer", textAlign: "left",
                transition: "background 0.18s, border-color 0.18s",
                outline: "none",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.7)"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.45)"; }}
            >
              <span style={{ width: 26, height: 26, borderRadius: 5, flexShrink: 0, background: r.bg, border: "1px solid rgba(255,255,255,0.3)", display: "block", boxShadow: isActive ? `0 0 0 2px ${r.bg}55` : "none", transition: "box-shadow 0.18s" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: 11, color: "#0a1e38", display: "block" }}>{r.hex} — {r.name}</strong>
                <span style={{ fontSize: 10, color: "#1e4060" }}>{r.desc}</span>
              </div>
              {isActive && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(61,166,116,0.2)", color: "#3da674", whiteSpace: "nowrap", flexShrink: 0 }}>
                  Applied ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HeroBtn({ href, children, primary }: { href: string; children: React.ReactNode; primary?: boolean }) {
  const def: React.CSSProperties = primary
    ? { background: "#1976d2", color: "#fff", border: "none" }
    : { background: "transparent", color: "#1565c0", border: "1px solid rgba(25,118,210,0.4)" };
  return (
    <a
      href={href}
      style={{ ...def, display: "inline-block", padding: "12px 26px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "background 0.22s, color 0.22s, border-color 0.22s", fontFamily: "var(--font-space)", textDecoration: "none" }}
      onMouseEnter={e => { const el = e.currentTarget; el.style.background = "#f0a500"; el.style.color = "#1a0a00"; el.style.borderColor = "#f0a500"; }}
      onMouseLeave={e => { const el = e.currentTarget; Object.assign(el.style, def); }}
    >{children}</a>
  );
}
