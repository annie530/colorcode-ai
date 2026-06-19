"use client";

const CARD: React.CSSProperties = {
  background: "rgba(210, 230, 255, 0.55)",
  border: "1px solid rgba(25,118,210,0.25)",
  backdropFilter: "blur(20px)",
  borderRadius: 16,
};

const pills = ["Contrast ratio", "Warm vs cool", "Complementary", "Analogous harmony", "Visual hierarchy", "WCAG AA / AAA"];

const rows = [
  { bg: "#1a3d5c", label: "Dark blue + white",   pct: 95, score: "11.2", pass: "AAA",  ok: true  },
  { bg: "#5b9bd5", label: "Mid blue + white",    pct: 26, score: "3.1",  pass: "Fail", ok: false },
  { bg: "#f0c040", label: "Yellow + dark",       pct: 65, score: "7.4",  pass: "AA",   ok: true  },
  { bg: "#2a2a2a", label: "Near-black + light",  pct: 88, score: "14.8", pass: "AAA",  ok: true  },
];

const colorNodes = [
  { label: "Primary", hex: "#1976D2", bg: "#1976d2" },
  { label: "Accent",  hex: "#F0C040", bg: "#f0c040" },
  { label: "Success", hex: "#3DA674", bg: "#3da674" },
  { label: "Danger",  hex: "#E24C4C", bg: "#e24c4c" },
  { label: "Neutral", hex: "#8899AA", bg: "#8899aa" },
  { label: "Deep",    hex: "#7B5CC4", bg: "#7b5cc4" },
];

export default function ColorTheory() {
  return (
    <section style={{ padding: "72px 50px", width: "100%", maxWidth: 1280, margin: "0 auto" }}>

      {/* Section header — full width */}
      <div style={{ marginBottom: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "end" }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: "2.5px", textTransform: "uppercase", color: "#1565c0", marginBottom: 12 }}>Color theory built in</p>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(26px, 3vw, 42px)", fontWeight: 800, letterSpacing: "-1px", color: "#0a1e38", lineHeight: 1.15 }}>
            Know <span style={{ color: "#1976d2" }}>why</span> a color<br />works, not just that it does
          </h2>
        </div>
        <div>
          <p style={{ fontSize: 17, fontWeight: 400, color: "#2a4a6a", lineHeight: 1.7, marginBottom: 16 }}>
            ColorCode explains the science in plain words — WCAG standards, harmony rules, contrast ratios — so you build real design knowledge as you work.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {pills.map(p => (
              <span key={p} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: "rgba(25,118,210,0.1)", border: "1px solid rgba(25,118,210,0.2)", color: "#1565c0" }}>{p}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 3-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>

        {/* Contrast checker */}
        <div className="reveal" style={{ ...CARD, padding: 22 }}>
          <h4 style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#1e4060", marginBottom: 16 }}>Contrast checker</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {rows.map(r => (
              <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ width: 30, height: 22, borderRadius: 4, flexShrink: 0, background: r.bg, border: "1px solid rgba(255,255,255,0.1)", display: "block" }} />
                <span style={{ fontSize: 11, color: "#2a5070", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</span>
                <div style={{ width: 60, height: 5, borderRadius: 3, background: "rgba(100,160,255,0.15)", flexShrink: 0, overflow: "hidden" }}>
                  <div style={{ width: `${r.pct}%`, height: "100%", borderRadius: 3, background: r.ok ? "#5b9bd5" : "#d32f2f" }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#0a1e38", minWidth: 28, textAlign: "right" }}>{r.score}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: r.ok ? "rgba(25,118,210,0.2)" : "rgba(211,47,47,0.2)", color: r.ok ? "#7ab8f5" : "#f08080" }}>{r.pass}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Color palette */}
        <div className="reveal" style={{ ...CARD, padding: 22, transitionDelay: "80ms" }}>
          <h4 style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#1e4060", marginBottom: 16 }}>Color roles</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {colorNodes.map(c => (
              <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ width: 28, height: 28, borderRadius: 7, background: c.bg, flexShrink: 0, display: "block", border: "1px solid rgba(255,255,255,0.15)" }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#0a1e38" }}>{c.label}</div>
                  <div style={{ fontSize: 10, color: "#1e4060", fontFamily: "monospace" }}>{c.hex}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 8, background: "rgba(25,118,210,0.1)", border: "1px solid rgba(100,160,255,0.15)" }}>
            <div style={{ fontSize: 10, color: "#1e4060", marginBottom: 4 }}>Primary on white background</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#7ab8f5" }}>Contrast: 4.5:1 · Passes AA ✓</div>
          </div>
        </div>

        {/* Theory rules */}
        <div className="reveal" style={{ ...CARD, padding: 22, transitionDelay: "160ms" }}>
          <h4 style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#1e4060", marginBottom: 16 }}>Theory rules</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { color: "#7ab8f5", rule: "Complementary", tip: "Opposite hues create maximum contrast and visual tension." },
              { color: "#6dd4c0", rule: "Analogous",     tip: "Adjacent colors on the wheel feel harmonious and calm." },
              { color: "#f5c842", rule: "Triadic",       tip: "Three evenly spaced hues give vibrant balanced energy." },
              { color: "#b08af5", rule: "Split-comp",    tip: "Softer than complementary — easier on the eye." },
            ].map(item => (
              <div key={item.rule} style={{ padding: "9px 11px", borderRadius: 8, background: "rgba(255,255,255,0.5)", border: "1px solid rgba(100,160,255,0.1)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: item.color, marginBottom: 3 }}>{item.rule}</div>
                <div style={{ fontSize: 11, color: "#2a5070", lineHeight: 1.4 }}>{item.tip}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
