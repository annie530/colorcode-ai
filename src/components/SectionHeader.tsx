"use client";

export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.5px", color: "#0a1e38", lineHeight: 1.1, margin: "0 0 14px 0" }}>
        {title}
      </h2>
      <p style={{ fontSize: 17, fontWeight: 400, color: "#2a4a6a", lineHeight: 1.7, margin: 0, maxWidth: 600 }}>
        {subtitle}
      </p>
    </div>
  );
}
