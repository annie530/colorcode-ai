"use client";

const CARD: React.CSSProperties = {
  background: "rgba(210, 230, 255, 0.55)",
  border: "1px solid rgba(25,118,210,0.25)",
  backdropFilter: "blur(20px)",
  borderRadius: 20,
};

export default function CTA() {
  return (
    <section style={{ padding: "72px 50px 80px", width: "100%", maxWidth: 1280, margin: "0 auto" }}>
      <div className="reveal" style={{ ...CARD, padding: "52px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>

        {/* Left — text */}
        <div>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(26px, 3vw, 42px)", fontWeight: 800, letterSpacing: "-1px", color: "#0a1e38", marginBottom: 14, lineHeight: 1.15 }}>
            Start with your<br />next design
          </h2>
          <p style={{ fontSize: 17, fontWeight: 400, color: "#1e4060", marginBottom: 28, lineHeight: 1.7 }}>
            Free to try. No signup needed. Upload a design and get color recommendations in seconds — with the theory behind every pick.
          </p>
          <button
            style={{ padding: "14px 32px", borderRadius: 10, fontSize: 16, fontWeight: 700, background: "#1976d2", color: "#fff", border: "none", cursor: "pointer", transition: "background 0.22s, color 0.22s", fontFamily: "var(--font-space)" }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.background = "#f0a500"; el.style.color = "#1a0a00"; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.background = "#1976d2"; el.style.color = "#fff"; }}
          >
            Try ColorCode AI free →
          </button>
          <p style={{ marginTop: 14, fontSize: 12, color: "#4a6a8a" }}>No credit card · No account · Instant results</p>
        </div>

        {/* Right — visual */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Mini design mockup */}
          <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(100,160,255,0.15)" }}>
            <div style={{ padding: "18px 20px", background: "linear-gradient(135deg,#1a3d5c,#0f2540)" }}>
              <p style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "#7ecfbe", marginBottom: 6 }}>Your design</p>
              <h3 style={{ fontFamily: "var(--font-syne)", fontSize: 16, fontWeight: 800, color: "#e8f4fd" }}>Brand Campaign 2025</h3>
              <p style={{ fontSize: 11, color: "rgba(232,244,253,0.5)", marginTop: 3 }}>Making every word count.</p>
            </div>
          </div>

          {/* Recommendations */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { hex: "#E8F4FD", bg: "#e8f4fd", label: "Best contrast · AAA",  score: "11.2:1", top: true  },
              { hex: "#F0C040", bg: "#f0c040", label: "Warm accent · AA",     score: "8.4:1",  top: false },
              { hex: "#7ECFBE", bg: "#7ecfbe", label: "Teal harmony · AA",    score: "5.9:1",  top: false },
            ].map(r => (
              <div key={r.hex} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 12px", borderRadius: 9, background: r.top ? "rgba(25,118,210,0.12)" : "rgba(255,255,255,0.45)", border: `1px solid ${r.top ? "rgba(100,160,255,0.25)" : "rgba(100,160,255,0.1)"}` }}>
                <span style={{ width: 22, height: 22, borderRadius: 5, background: r.bg, flexShrink: 0, display: "block", border: "1px solid rgba(255,255,255,0.2)" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#0a1e38", fontFamily: "monospace" }}>{r.hex}</div>
                  <div style={{ fontSize: 10, color: "#1e4060" }}>{r.label}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#6dd4c0" }}>{r.score}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
