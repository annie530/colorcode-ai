"use client";

import { useEffect, useRef, useState } from "react";

const WHEEL_SIZE = 280;
const WHEEL_RADIUS = WHEEL_SIZE / 2 - 2;

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

export default function ColorWheelPromoSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pickedColor, setPickedColor] = useState<{ hex: string; x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cx = WHEEL_SIZE / 2;
    const cy = WHEEL_SIZE / 2;
    const r = WHEEL_RADIUS;

    ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE);

    for (let i = 0; i < 360; i++) {
      const startAngle = (i / 360) * 2 * Math.PI - Math.PI / 2;
      const endAngle = ((i + 1) / 360) * 2 * Math.PI - Math.PI / 2;
      const midAngle = (startAngle + endAngle) / 2;
      const grad = ctx.createLinearGradient(cx, cy, cx + r * Math.cos(midAngle), cy + r * Math.sin(midAngle));
      grad.addColorStop(0, `hsl(${i}, 0%, 100%)`);
      grad.addColorStop(1, `hsl(${i}, 100%, 50%)`);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // soft edge ring
    const edgeFade = ctx.createRadialGradient(cx, cy, r - 8, cx, cy, r + 2);
    edgeFade.addColorStop(0, "rgba(0,0,0,0)");
    edgeFade.addColorStop(1, "rgba(0,0,0,0.18)");
    ctx.beginPath();
    ctx.arc(cx, cy, r + 2, 0, 2 * Math.PI);
    ctx.fillStyle = edgeFade;
    ctx.fill();
  }, []);

  function pickColorAt(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = WHEEL_SIZE / rect.width;
    const scaleY = WHEEL_SIZE / rect.height;
    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    const cx = WHEEL_SIZE / 2;
    const cy = WHEEL_SIZE / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > WHEEL_RADIUS) return;
    const angle = Math.atan2(dy, dx) + Math.PI / 2;
    const hue = ((angle * 180) / Math.PI + 360) % 360;
    const sat = (dist / WHEEL_RADIUS) * 100;
    const hex = hslToHex(hue, sat, 50);
    const dotX = ((x / WHEEL_SIZE) * 100);
    const dotY = ((y / WHEEL_SIZE) * 100);
    setPickedColor({ hex, x: dotX, y: dotY });
  }

  const displayColor = pickedColor?.hex ?? "#20b4aa";

  return (
    <section style={{ width: "100%", padding: "80px 60px" }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 72,
        alignItems: "center",
      }}
      className="colorwheel-promo-grid"
      >

        {/* Left: text + CTA */}
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(32,180,170,0.12)", border: "1px solid rgba(32,180,170,0.35)",
            borderRadius: 99, padding: "5px 14px", marginBottom: 20,
          }}>
            <span style={{ fontSize: 13, color: "#0a7c76", fontWeight: 600, letterSpacing: "0.04em" }}>
              Interactive Color Wheel
            </span>
          </div>

          <h2 style={{
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 800,
            lineHeight: 1.15,
            color: "#0a3a3c",
            marginBottom: 18,
          }}>
            Explore color theory<br />
            <span style={{ color: "#20b4aa" }}>hands-on</span>
          </h2>

          <p style={{
            fontSize: 16,
            color: "#2a5a5c",
            lineHeight: 1.7,
            marginBottom: 12,
          }}>
            Click anywhere on the color wheel to pick a hue and see instant contrast pairing suggestions — analogous harmony, complementary contrast, and your own custom combinations.
          </p>
          <p style={{
            fontSize: 15,
            color: "#3a7070",
            lineHeight: 1.7,
            marginBottom: 32,
          }}>
            Built on WCAG contrast guidelines so every pairing you explore is accessibility-aware.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <a
              href="/color-theory"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: displayColor,
                color: "#fff",
                fontWeight: 700, fontSize: 15,
                padding: "14px 28px",
                borderRadius: 12,
                textDecoration: "none",
                boxShadow: `0 4px 24px ${displayColor}55`,
                transition: "transform 0.18s, box-shadow 0.18s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 8px 32px ${displayColor}88`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 4px 24px ${displayColor}55`;
              }}
            >
              Try the color wheel
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>

            {pickedColor && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: pickedColor.hex, border: "2px solid rgba(0,0,0,0.12)" }} />
                <span style={{ fontSize: 13, color: "#2a5a5c", fontFamily: "monospace" }}>{pickedColor.hex.toUpperCase()}</span>
              </div>
            )}
          </div>

          {!pickedColor && (
            <p style={{ marginTop: 16, fontSize: 13, color: "#5a9090" }}>
              ← Try clicking the wheel to pick a color
            </p>
          )}
        </div>

        {/* Right: mini interactive wheel */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div
            style={{
              position: "relative",
              width: WHEEL_SIZE,
              height: WHEEL_SIZE,
              borderRadius: "50%",
              boxShadow: hovered
                ? "0 20px 60px rgba(0,0,0,0.18), 0 0 0 6px rgba(32,180,170,0.2)"
                : "0 12px 40px rgba(0,0,0,0.12)",
              transition: "box-shadow 0.25s",
              cursor: "crosshair",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <canvas
              ref={canvasRef}
              width={WHEEL_SIZE}
              height={WHEEL_SIZE}
              style={{ display: "block", borderRadius: "50%", width: "100%", height: "100%" }}
              onClick={pickColorAt}
              onMouseMove={e => { if (e.buttons === 1) pickColorAt(e); }}
              onTouchMove={e => { e.preventDefault(); pickColorAt(e); }}
            />

            {/* cursor dot */}
            {pickedColor && (
              <div style={{
                position: "absolute",
                left: `${pickedColor.x}%`,
                top: `${pickedColor.y}%`,
                transform: "translate(-50%, -50%)",
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: pickedColor.hex,
                border: "3px solid #fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
                pointerEvents: "none",
                transition: "left 0.05s, top 0.05s",
              }} />
            )}
          </div>
        </div>
      </div>

      {/* responsive stacking */}
      <style>{`
        @media (max-width: 700px) {
          .colorwheel-promo-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
