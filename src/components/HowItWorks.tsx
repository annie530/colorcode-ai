"use client";

const CARD: React.CSSProperties = {
  background: "rgba(210, 230, 255, 0.55)",
  border: "1px solid rgba(25,118,210,0.25)",
  backdropFilter: "blur(20px)",
  borderRadius: 16,
};

const steps = [
  {
    num: "01",
    title: "Upload your design",
    desc: "Drag and drop any image file. ColorCode scans the background colors and dominant tones automatically.",
    color: "#7ab8f5",
    visual: (
      <div style={{ background: "rgba(25,118,210,0.08)", padding: "18px 16px", borderRadius: 10, border: "1px solid rgba(100,160,255,0.12)" }}>
        <div style={{ border: "2px dashed rgba(100,160,255,0.3)", borderRadius: 8, padding: "16px 12px", textAlign: "center" }}>
          <svg width="24" height="24" fill="none" stroke="#7ab8f5" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: "0 auto 6px" }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <div style={{ fontSize: 11, color: "#7ab8f5" }}>poster.png</div>
          <div style={{ fontSize: 10, color: "#4a6a8a", marginTop: 2 }}>2.4 MB · detected</div>
        </div>
      </div>
    ),
  },
  {
    num: "02",
    title: "AI reads your colors",
    desc: "The AI detects background tones, runs contrast checks, and picks text colors that pass accessibility standards.",
    color: "#6dd4c0",
    visual: (
      <div style={{ background: "rgba(0,150,120,0.07)", padding: "16px", borderRadius: 10, border: "1px solid rgba(109,212,192,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6dd4c0", animation: "none" }} />
          <span style={{ fontSize: 11, color: "#6dd4c0" }}>Analysing background…</span>
        </div>
        {["Dominant hue: Deep blue","Background: #1A3D5C","Luminance: 0.04"].map((t, i) => (
          <div key={i} style={{ fontSize: 10, color: "#1e4060", padding: "3px 0", borderBottom: i < 2 ? "1px solid rgba(109,212,192,0.08)" : "none" }}>{t}</div>
        ))}
      </div>
    ),
  },
  {
    num: "03",
    title: "Preview and copy",
    desc: "See your design update live with each color option. Click to copy the exact hex code straight into your design tool.",
    color: "#f5c842",
    visual: (
      <div style={{ background: "linear-gradient(135deg,#1a3d5c,#0f2540)", padding: "14px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontFamily: "var(--font-syne)", fontSize: 13, fontWeight: 800, color: "#e8f4fd", marginBottom: 8 }}>Design Preview</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {["#E8F4FD","#F0C040","#7ECFBE"].map((c, i) => (
            <span key={i} style={{ width: 20, height: 20, borderRadius: "50%", background: c, display: "block", border: i===0 ? "2px solid #f0a500" : "1px solid rgba(255,255,255,0.2)" }} />
          ))}
          <span style={{ marginLeft: 6, fontSize: 10, padding: "2px 8px", background: "rgba(240,165,0,0.2)", borderRadius: 4, color: "#f5c842", fontFamily: "monospace", cursor: "pointer" }}>#E8F4FD ⎘</span>
        </div>
      </div>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section style={{ padding: "72px 50px", width: "100%", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "start", marginBottom: 48 }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: "2.5px", textTransform: "uppercase", color: "#1565c0", marginBottom: 12 }}>How it works</p>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(26px, 3vw, 42px)", fontWeight: 800, letterSpacing: "-1px", color: "#0a1e38", lineHeight: 1.15 }}>
            Three steps to<br />perfect text color
          </h2>
        </div>
        <p style={{ fontSize: 17, fontWeight: 400, color: "#2a4a6a", lineHeight: 1.75, alignSelf: "end" }}>
          No color theory knowledge required. Upload, get recommendations, and copy the code — the explanation comes included so you learn as you go.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {steps.map((s, i) => (
          <div key={i} className="reveal" style={{ ...CARD, padding: 24, transitionDelay: `${i * 100}ms` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontFamily: "var(--font-syne)", fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.num}</span>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a1e38" }}>{s.title}</h3>
            </div>
            <div style={{ marginBottom: 14 }}>{s.visual}</div>
            <p style={{ fontSize: 15, fontWeight: 400, color: "#1e4060", lineHeight: 1.65 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
