"use client";

const CARD: React.CSSProperties = {
  background: "rgba(210, 230, 255, 0.55)",
  border: "1px solid rgba(25,118,210,0.25)",
  backdropFilter: "blur(20px)",
  borderRadius: 16,
};

const features = [
  { title: "Upload any design",  desc: "Drop in a PNG or JPEG — poster, slide, social post, brand asset.",       iconBg: "rgba(25,118,210,0.2)",  iconColor: "#7ab8f5", delay: 0,
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>,
    visual: <UploadVisual /> },
  { title: "Instant AI picks",   desc: "Ranked color options with contrast scores and a plain-English reason.",   iconBg: "rgba(0,150,120,0.2)",   iconColor: "#6dd4c0", delay: 80,
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/></svg>,
    visual: <AIVisual /> },
  { title: "Live preview",       desc: "Tap any color and watch your design update in real time.",                iconBg: "rgba(200,130,0,0.2)",   iconColor: "#f5c842", delay: 160,
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    visual: <PreviewVisual /> },
  { title: "Learn as you go",    desc: "Every pick comes with the color theory rule behind it.",                  iconBg: "rgba(100,50,200,0.2)",  iconColor: "#b08af5", delay: 240,
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
    visual: <LearnVisual /> },
];

export default function Features() {
  return (
    <section style={{ padding: "72px 50px", width: "100%", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 56, alignItems: "start" }}>

        {/* Left — heading column */}
        <div style={{ position: "sticky", top: 88 }}>
          <p style={{ fontSize: 11, letterSpacing: "2.5px", textTransform: "uppercase", color: "#1565c0", marginBottom: 12 }}>What it does</p>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 800, letterSpacing: "-1px", color: "#0a1e38", marginBottom: 14, lineHeight: 1.15 }}>
            Everything<br />in one place
          </h2>
          <p style={{ fontSize: 17, fontWeight: 400, color: "#2a4a6a", lineHeight: 1.7 }}>
            One tool that picks colors, checks readability, and teaches you why — all at once.
          </p>

          {/* Mini color wheel */}
          <div style={{ marginTop: 32, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["#e24c4c","#e0882a","#d4b800","#3da674","#5b9bd5","#7b5cc4"].map((c, i) => (
              <span key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: c, display: "block", border: "2px solid rgba(255,255,255,0.4)" }} />
            ))}
          </div>
        </div>

        {/* Right — 2×2 card grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {features.map(f => (
            <div key={f.title} className="reveal" style={{ ...CARD, padding: 22, transitionDelay: `${f.delay}ms` }}>
              {/* Icon + title */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: f.iconBg, color: f.iconColor, flexShrink: 0 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a1e38" }}>{f.title}</h3>
              </div>
              {/* Visual */}
              <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 12, border: "1px solid rgba(100,160,255,0.12)" }}>
                {f.visual}
              </div>
              <p style={{ fontSize: 15, fontWeight: 400, color: "#1e4060", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

function UploadVisual() {
  return (
    <div style={{ background: "rgba(25,118,210,0.08)", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 90 }}>
      <svg width="28" height="28" fill="none" stroke="#7ab8f5" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      <span style={{ fontSize: 11, color: "#7ab8f5" }}>Drop your design here</span>
      <div style={{ display: "flex", gap: 6 }}>
        {["PNG","JPG","SVG"].map(t => <span key={t} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "rgba(100,160,255,0.15)", color: "#1e4060", border: "1px solid rgba(100,160,255,0.2)" }}>{t}</span>)}
      </div>
    </div>
  );
}

function AIVisual() {
  return (
    <div style={{ background: "rgba(0,150,120,0.07)", padding: "14px 16px", minHeight: 90 }}>
      {[{c:"#e8f4fd",w:"82%",label:"11.2:1"},{c:"#f0c040",w:"61%",label:"8.4:1"},{c:"#7ecfbe",w:"44%",label:"5.9:1"}].map((r,i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < 2 ? 8 : 0 }}>
          <span style={{ width: 16, height: 16, borderRadius: 3, background: r.c, border: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }} />
          <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ width: r.w, height: "100%", borderRadius: 3, background: "#6dd4c0" }} />
          </div>
          <span style={{ fontSize: 10, color: "#6dd4c0", minWidth: 30 }}>{r.label}</span>
        </div>
      ))}
    </div>
  );
}

function PreviewVisual() {
  return (
    <div style={{ background: "linear-gradient(135deg,#1a3d5c,#0f2540)", padding: "14px 16px", minHeight: 90, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontFamily: "var(--font-syne)", fontSize: 13, fontWeight: 800, color: "#e8f4fd", marginBottom: 3 }}>Brand Header</div>
        <div style={{ fontSize: 10, color: "rgba(232,244,253,0.55)" }}>Subtitle text sample</div>
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        {["#e8f4fd","#f0c040","#7ecfbe","#f48c7f"].map((c,i) => (
          <span key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: c, display: "block", border: i===0 ? "2px solid #f0a500" : "2px solid transparent", cursor: "pointer" }} />
        ))}
      </div>
    </div>
  );
}

function LearnVisual() {
  return (
    <div style={{ background: "rgba(100,50,200,0.08)", padding: "12px 14px", minHeight: 90 }}>
      {[
        { label: "Contrast ratio", tip: "11.2:1 — passes WCAG AAA" },
        { label: "Complementary", tip: "Blue + orange = high energy" },
      ].map((item, i) => (
        <div key={i} style={{ padding: "6px 10px", borderRadius: 7, background: "rgba(100,50,200,0.12)", border: "1px solid rgba(176,138,245,0.2)", marginBottom: i === 0 ? 6 : 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#b08af5", marginBottom: 2 }}>{item.label}</div>
          <div style={{ fontSize: 10, color: "#8899bb" }}>{item.tip}</div>
        </div>
      ))}
    </div>
  );
}
