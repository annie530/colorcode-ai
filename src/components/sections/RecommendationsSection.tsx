"use client";

import { useState } from "react";
import { buildColorInfo, getTextRecs, TextRec } from "@/utils/colorUtils";

// ─── Shared card style (matches project design system) ────────────────────────

const CARD: React.CSSProperties = {
  background: "rgba(210,230,255,0.55)",
  border: "1px solid rgba(25,118,210,0.25)",
  backdropFilter: "blur(20px)",
  borderRadius: 16,
};

const SELECTED_CARD: React.CSSProperties = {
  ...CARD,
  border: "2px solid rgba(25,118,210,0.6)",
};

// ─── WCAG badge colours ────────────────────────────────────────────────────────

function wcagStyle(level: "AAA" | "AA" | "Fail"): React.CSSProperties {
  if (level === "AAA") {
    return {
      background: "rgba(27,134,72,0.18)",
      color: "#2ecc71",
      border: "1px solid rgba(27,134,72,0.35)",
    };
  }
  if (level === "AA") {
    return {
      background: "rgba(25,118,210,0.18)",
      color: "#7ab8f5",
      border: "1px solid rgba(25,118,210,0.35)",
    };
  }
  return {
    background: "rgba(211,47,47,0.18)",
    color: "#f08080",
    border: "1px solid rgba(211,47,47,0.35)",
  };
}

// ─── Role badge ────────────────────────────────────────────────────────────────

function roleBadgeStyle(): React.CSSProperties {
  return {
    background: "rgba(25,118,210,0.1)",
    color: "#1565c0",
    border: "1px solid rgba(25,118,210,0.2)",
    fontSize: 10,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 20,
    textTransform: "capitalize" as const,
    letterSpacing: "0.5px",
  };
}

// ─── Copy-to-clipboard helper ─────────────────────────────────────────────────

function CopyHex({ hex }: { hex: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy hex"
      style={{
        fontFamily: "monospace",
        fontSize: 13,
        fontWeight: 600,
        color: "#0a1e38",
        background: "rgba(255,255,255,0.55)",
        border: "1px solid rgba(25,118,210,0.18)",
        borderRadius: 6,
        padding: "2px 9px",
        cursor: "pointer",
        letterSpacing: "0.5px",
        transition: "background 0.15s",
      }}
    >
      {copied ? "Copied!" : hex}
    </button>
  );
}

// ─── Single recommendation card ───────────────────────────────────────────────

interface RecCardProps {
  rec: TextRec;
  selected: boolean;
  onClick: () => void;
}

function RecCard({ rec, selected, onClick }: RecCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        ...(selected ? SELECTED_CARD : CARD),
        padding: 16,
        cursor: "pointer",
        transition: "border 0.15s, box-shadow 0.15s",
        boxShadow: selected
          ? "0 0 0 3px rgba(25,118,210,0.15)"
          : "none",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Top row: swatch + hex + role */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Color swatch */}
        <span
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: rec.color.hex,
            flexShrink: 0,
            display: "block",
            border: "2px solid rgba(255,255,255,0.55)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <CopyHex hex={rec.color.hex} />
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={roleBadgeStyle()}>
              {rec.role.charAt(0).toUpperCase() + rec.role.slice(1)}
            </span>
            {/* WCAG badge */}
            <span
              style={{
                ...wcagStyle(rec.wcag),
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 20,
              }}
            >
              {rec.wcag}
            </span>
            {/* Contrast ratio */}
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#1e4060",
                background: "rgba(255,255,255,0.45)",
                border: "1px solid rgba(100,160,255,0.2)",
                borderRadius: 20,
                padding: "2px 8px",
              }}
            >
              {rec.contrast.toFixed(1)}:1
            </span>
          </div>
        </div>
      </div>

      {/* Reason */}
      <p
        style={{
          fontSize: 12,
          color: "#2a4a6a",
          lineHeight: 1.5,
          margin: 0,
          padding: "8px 10px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.4)",
          border: "1px solid rgba(100,160,255,0.12)",
        }}
      >
        {rec.reason}
      </p>
    </div>
  );
}

// ─── Live Preview panel ───────────────────────────────────────────────────────

interface LivePreviewProps {
  imageUrl: string;
  bgColor: string;
  textColor: string;
}

function LivePreview({ imageUrl, bgColor, textColor }: LivePreviewProps) {
  return (
    <div
      style={{
        ...CARD,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 360,
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(25,118,210,0.15)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#5b9bd5",
            display: "block",
          }}
        />
        <span
          style={{
            fontSize: 11,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#1e4060",
            fontWeight: 600,
          }}
        >
          Live Preview
        </span>
      </div>

      {/* Mock design card */}
      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Image with overlay */}
        <div
          style={{
            position: "relative",
            borderRadius: 10,
            overflow: "hidden",
            flex: 1,
            minHeight: 180,
            background: bgColor,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Uploaded design"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              opacity: 0.85,
            }}
          />

          {/* Text overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: 16,
              background: `linear-gradient(to top, ${bgColor}cc 0%, transparent 60%)`,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-syne, system-ui)",
                fontSize: 18,
                fontWeight: 800,
                color: textColor,
                lineHeight: 1.2,
                marginBottom: 4,
                textShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            >
              Headline Text
            </div>
            <div
              style={{
                fontSize: 12,
                color: textColor,
                opacity: 0.85,
                lineHeight: 1.5,
              }}
            >
              Body copy — this is how your text will look against the extracted background color.
            </div>
            <div style={{ marginTop: 10 }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: 11,
                  fontWeight: 700,
                  color: bgColor,
                  background: textColor,
                  padding: "5px 14px",
                  borderRadius: 20,
                  cursor: "pointer",
                }}
              >
                Call to Action
              </span>
            </div>
          </div>
        </div>

        {/* Color info strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.45)",
            border: "1px solid rgba(100,160,255,0.15)",
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: textColor,
              display: "block",
              border: "1.5px solid rgba(255,255,255,0.5)",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 11, color: "#1e4060" }}>
            Text color:{" "}
            <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0a1e38" }}>
              {textColor}
            </span>
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 10,
              color: "#2a5070",
              background: "rgba(25,118,210,0.08)",
              padding: "2px 7px",
              borderRadius: 10,
              border: "1px solid rgba(25,118,210,0.15)",
            }}
          >
            on {bgColor}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface RecommendationsSectionProps {
  dominantColors: string[];
  imageUrl: string;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RecommendationsSection({
  dominantColors,
  imageUrl,
}: RecommendationsSectionProps) {
  const bgHex =
    dominantColors.length > 0
      ? buildColorInfo(dominantColors[0]).hex
      : "#1a3d5c";

  const recs: TextRec[] = getTextRecs(bgHex);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedRec = recs[selectedIndex] ?? recs[0];
  const selectedTextColor = selectedRec?.color.hex ?? "#ffffff";

  return (
    <section
      style={{
        padding: "72px 50px",
        width: "100%",
        maxWidth: 1280,
        margin: "0 auto",
      }}
    >
      {/* Section header */}
      <div style={{ marginBottom: 36 }}>
        <p
          style={{
            fontSize: 11,
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            color: "#1565c0",
            marginBottom: 10,
          }}
        >
          Smart text color
        </p>
        <h2
          style={{
            fontFamily: "var(--font-syne, system-ui)",
            fontSize: "clamp(24px, 3vw, 38px)",
            fontWeight: 800,
            letterSpacing: "-1px",
            color: "#0a1e38",
            lineHeight: 1.15,
            marginBottom: 14,
          }}
        >
          Text color{" "}
          <span style={{ color: "#1976d2" }}>recommendations</span>
        </h2>
        <p
          style={{
            fontSize: 16,
            fontWeight: 400,
            color: "#2a4a6a",
            lineHeight: 1.6,
            maxWidth: 580,
          }}
        >
          Based on the dominant background color extracted from your image, here
          are the best text colors ranked by contrast and WCAG compliance.
        </p>
      </div>

      {/* Detected background swatches */}
      {dominantColors.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 28,
            padding: "10px 14px",
            borderRadius: 12,
            background: "rgba(210,230,255,0.35)",
            border: "1px solid rgba(25,118,210,0.18)",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 11,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "#1e4060",
              fontWeight: 600,
              marginRight: 4,
            }}
          >
            Detected colors
          </span>
          {dominantColors.map((hex, i) => {
            const info = buildColorInfo(hex);
            const isActive = i === 0;
            return (
              <div
                key={i}
                title={info.hex}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "3px 10px 3px 5px",
                  borderRadius: 20,
                  background: isActive
                    ? "rgba(25,118,210,0.15)"
                    : "rgba(255,255,255,0.45)",
                  border: isActive
                    ? "1.5px solid rgba(25,118,210,0.45)"
                    : "1px solid rgba(100,160,255,0.2)",
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: info.hex,
                    display: "block",
                    border: "1.5px solid rgba(255,255,255,0.5)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#0a1e38" : "#2a5070",
                  }}
                >
                  {info.hex}
                </span>
                {isActive && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: "#1565c0",
                      background: "rgba(25,118,210,0.15)",
                      padding: "1px 5px",
                      borderRadius: 8,
                      marginLeft: 2,
                    }}
                  >
                    BG
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Main 2-column layout: live preview + rec cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Left: Live Preview */}
        <LivePreview
          imageUrl={imageUrl}
          bgColor={bgHex}
          textColor={selectedTextColor}
        />

        {/* Right: Recommendation cards (2×2 grid) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          {recs.map((rec, i) => (
            <RecCard
              key={rec.color.hex}
              rec={rec}
              selected={i === selectedIndex}
              onClick={() => setSelectedIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
