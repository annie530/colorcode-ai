"use client";

import { useState, useCallback } from "react";
import { generatePalette, buildColorInfo } from "@/utils/colorUtils";
import type { ColorInfo } from "@/utils/colorUtils";

// ─── Types ────────────────────────────────────────────────────────────────────

type PaletteType =
  | "complementary"
  | "analogous"
  | "triadic"
  | "monochromatic"
  | "split-complementary";

interface Tab {
  id: PaletteType;
  label: string;
  description: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: Tab[] = [
  {
    id: "complementary",
    label: "Complementary",
    description:
      "Opposite hues — maximum contrast and visual energy. Ideal for bold, high-impact designs.",
  },
  {
    id: "analogous",
    label: "Analogous",
    description:
      "Adjacent hues on the wheel — harmonious and serene. Works well for natural, cohesive palettes.",
  },
  {
    id: "triadic",
    label: "Triadic",
    description:
      "Three evenly spaced hues — vibrant yet balanced. Great for diverse, lively compositions.",
  },
  {
    id: "monochromatic",
    label: "Monochromatic",
    description:
      "Same hue, varying lightness — elegant and unified. Perfect for sophisticated, minimalist designs.",
  },
  {
    id: "split-complementary",
    label: "Split Complementary",
    description:
      "Base hue plus two neighbors of its complement — high contrast with less tension than pure complementary.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isLightColor(hex: string): boolean {
  try {
    const info = buildColorInfo(hex);
    return info.hsl.l > 55;
  } catch {
    return false;
  }
}

function getTextColor(hex: string): string {
  return isLightColor(hex) ? "#1a1a2e" : "#ffffff";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SwatchProps {
  color: ColorInfo;
  onCopy: (hex: string) => void;
  copiedHex: string | null;
}

function Swatch({ color, onCopy, copiedHex }: SwatchProps) {
  const isCopied = copiedHex === color.hex;
  const textColor = getTextColor(color.hex);

  return (
    <div style={styles.swatchWrapper}>
      <button
        onClick={() => onCopy(color.hex)}
        title={`Click to copy ${color.hex}`}
        style={{
          ...styles.swatch,
          backgroundColor: color.hex,
          boxShadow: isCopied
            ? `0 0 0 3px ${color.hex}, 0 0 0 5px #3b82f6`
            : "0 2px 8px rgba(0,0,0,0.18)",
        }}
        aria-label={`Copy color ${color.hex}`}
      >
        {isCopied && (
          <span style={{ ...styles.copiedBadge, color: textColor }}>
            Copied!
          </span>
        )}
      </button>
      <span style={styles.swatchHex}>{color.hex}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface PaletteSectionProps {
  baseColor: string;
}

export default function PaletteSection({ baseColor }: PaletteSectionProps) {
  const [activeTab, setActiveTab] = useState<PaletteType>("complementary");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copyAllDone, setCopyAllDone] = useState(false);

  const palette = (() => {
    try {
      return generatePalette(baseColor, activeTab);
    } catch {
      return [];
    }
  })();

  const handleCopy = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1800);
    });
  }, []);

  const handleCopyAll = useCallback(() => {
    const allHex = palette.map((c) => c.hex).join(", ");
    navigator.clipboard.writeText(allHex).then(() => {
      setCopyAllDone(true);
      setTimeout(() => setCopyAllDone(false), 2000);
    });
  }, [palette]);

  const activeTabInfo = TABS.find((t) => t.id === activeTab)!;

  return (
    <section style={styles.section}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.heading}>Color Palette Harmonies</h2>
        <p style={styles.subheading}>
          Explore color relationships based on your selected base color.
        </p>
      </div>

      {/* Tab Bar */}
      <div style={styles.tabBar} role="tablist" aria-label="Palette types">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tabButton,
                ...(isActive ? styles.tabButtonActive : styles.tabButtonInactive),
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Card */}
      <div style={styles.card}>
        {/* Description */}
        <p style={styles.description}>{activeTabInfo.description}</p>

        {/* Swatches */}
        <div style={styles.swatchRow} role="list" aria-label="Color swatches">
          {palette.map((color) => (
            <div key={color.hex} role="listitem">
              <Swatch
                color={color}
                onCopy={handleCopy}
                copiedHex={copiedHex}
              />
            </div>
          ))}
        </div>

        {/* Palette Strip */}
        <div style={styles.stripWrapper} aria-label="Palette strip">
          {palette.map((color, i) => (
            <div
              key={`${color.hex}-${i}`}
              style={{
                ...styles.stripSegment,
                backgroundColor: color.hex,
                borderRadius:
                  i === 0
                    ? "8px 0 0 8px"
                    : i === palette.length - 1
                    ? "0 8px 8px 0"
                    : "0",
              }}
              title={color.hex}
            />
          ))}
        </div>

        {/* Copy All */}
        <div style={styles.copyAllRow}>
          <button
            onClick={handleCopyAll}
            style={{
              ...styles.copyAllButton,
              ...(copyAllDone ? styles.copyAllButtonDone : {}),
            }}
          >
            {copyAllDone
              ? "Copied!"
              : `Copy All (${palette.map((c) => c.hex).join(", ")})`}
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  section: {
    width: "100%",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: "#1a1a2e",
  },
  header: {
    marginBottom: "20px",
  },
  heading: {
    fontSize: "1.5rem",
    fontWeight: 700,
    margin: "0 0 6px 0",
    color: "#1a1a2e",
  },
  subheading: {
    fontSize: "0.95rem",
    color: "#4b5563",
    margin: 0,
  },
  tabBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "16px",
  },
  tabButton: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 500,
    transition: "background 0.15s, color 0.15s",
    outline: "none",
    lineHeight: 1.4,
  },
  tabButtonActive: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
  },
  tabButtonInactive: {
    backgroundColor: "rgba(210,230,255,0.55)",
    color: "#1a1a2e",
  },
  card: {
    backgroundColor: "rgba(210,230,255,0.55)",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid rgba(59,130,246,0.12)",
  },
  description: {
    fontSize: "0.95rem",
    color: "#374151",
    margin: "0 0 20px 0",
    lineHeight: 1.6,
  },
  swatchRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "24px",
  },
  swatchWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  swatch: {
    width: "64px",
    height: "64px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.12s, box-shadow 0.12s",
    padding: 0,
  },
  copiedBadge: {
    fontSize: "0.6rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    pointerEvents: "none",
    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
  },
  swatchHex: {
    fontSize: "0.72rem",
    color: "#374151",
    fontFamily: "'Menlo', 'Consolas', 'Monaco', monospace",
    letterSpacing: "0.02em",
    userSelect: "all",
  },
  stripWrapper: {
    display: "flex",
    width: "100%",
    height: "40px",
    borderRadius: "8px",
    overflow: "hidden",
    marginBottom: "20px",
  },
  stripSegment: {
    flex: 1,
    height: "100%",
  },
  copyAllRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  copyAllButton: {
    padding: "9px 18px",
    borderRadius: "8px",
    border: "1.5px solid #3b82f6",
    backgroundColor: "transparent",
    color: "#3b82f6",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  copyAllButtonDone: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
  },
};
