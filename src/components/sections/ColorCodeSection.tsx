"use client";

import { useState, useCallback } from "react";
import { buildColorInfo } from "@/utils/colorUtils";

interface ColorCodeSectionProps {
  colors: string[];
}

interface FormatCard {
  label: string;
  value: string;
}

function isValidHex(hex: string): boolean {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());
}

function normaliseHex(hex: string): string {
  const clean = hex.trim().startsWith("#") ? hex.trim() : `#${hex.trim()}`;
  return clean.toUpperCase();
}

export default function ColorCodeSection({ colors }: ColorCodeSectionProps) {
  const [selectedColor, setSelectedColor] = useState<string>("#1976D2");
  const [hexInput, setHexInput] = useState<string>("#1976D2");
  const [hexInputError, setHexInputError] = useState<boolean>(false);
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const applyColor = useCallback((hex: string) => {
    const normalised = normaliseHex(hex);
    setSelectedColor(normalised);
    setHexInput(normalised);
    setHexInputError(false);
  }, []);

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyColor(e.target.value);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    if (isValidHex(val)) {
      setHexInputError(false);
      applyColor(val);
    } else {
      setHexInputError(true);
    }
  };

  const handleHexInputBlur = () => {
    if (!isValidHex(hexInput)) {
      setHexInput(selectedColor);
      setHexInputError(false);
    }
  };

  const copyToClipboard = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [key]: false }));
      }, 1500);
    } catch {
      // fallback for environments without clipboard API
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [key]: false }));
      }, 1500);
    }
  };

  let colorInfo;
  try {
    colorInfo = buildColorInfo(selectedColor);
  } catch {
    colorInfo = buildColorInfo("#1976D2");
  }

  const { rgb, hsl, cmyk } = colorInfo;

  const formatCards: FormatCard[] = [
    {
      label: "HEX",
      value: selectedColor.toUpperCase(),
    },
    {
      label: "RGB",
      value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    },
    {
      label: "HSL",
      value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    },
    {
      label: "CMYK",
      value: `C:${cmyk.c} M:${cmyk.m} Y:${cmyk.y} K:${cmyk.k}`,
    },
  ];

  return (
    <section style={{ color: "#0a1e38", fontFamily: "system-ui, sans-serif" }}>
      {/* Color picker row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        {/* Large preview circle */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            backgroundColor: selectedColor,
            boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
            flexShrink: 0,
            border: "3px solid rgba(255,255,255,0.7)",
          }}
          aria-label={`Color preview: ${selectedColor}`}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#1565c0",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Pick a color
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <input
              type="color"
              value={selectedColor.toLowerCase()}
              onChange={handlePickerChange}
              style={{
                width: 48,
                height: 48,
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                padding: 2,
                background: "rgba(210,230,255,0.55)",
              }}
              aria-label="Color picker"
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <input
                type="text"
                value={hexInput}
                onChange={handleHexInputChange}
                onBlur={handleHexInputBlur}
                maxLength={7}
                placeholder="#1976D2"
                style={{
                  fontFamily: "monospace",
                  fontSize: "1rem",
                  padding: "0.45rem 0.75rem",
                  border: hexInputError
                    ? "1.5px solid #e53935"
                    : "1.5px solid rgba(21,101,192,0.35)",
                  borderRadius: 8,
                  color: "#0a1e38",
                  background: "rgba(210,230,255,0.55)",
                  outline: "none",
                  width: 120,
                }}
                aria-label="Hex color input"
                aria-invalid={hexInputError}
              />
              {hexInputError && (
                <span style={{ fontSize: "0.7rem", color: "#e53935" }}>
                  Invalid hex color
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Format cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {formatCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: "rgba(210,230,255,0.55)",
              borderRadius: 14,
              padding: "1.1rem 1.1rem 0.9rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.45rem",
              boxShadow: "0 2px 10px rgba(21,101,192,0.08)",
              border: "1px solid rgba(21,101,192,0.12)",
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#1565c0",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {card.label}
            </span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "0.92rem",
                color: "#0a1e38",
                wordBreak: "break-all",
                lineHeight: 1.4,
              }}
            >
              {card.value}
            </span>
            <button
              onClick={() => copyToClipboard(card.label, card.value)}
              style={{
                marginTop: "0.35rem",
                padding: "0.3rem 0.85rem",
                borderRadius: 7,
                border: "1.5px solid rgba(21,101,192,0.35)",
                background: copied[card.label]
                  ? "rgba(21,101,192,0.15)"
                  : "rgba(255,255,255,0.65)",
                color: copied[card.label] ? "#1565c0" : "#0a1e38",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
                alignSelf: "flex-start",
              }}
              aria-label={`Copy ${card.label} value`}
            >
              {copied[card.label] ? "Copied!" : "Copy"}
            </button>
          </div>
        ))}
      </div>

      {/* Extracted color swatches */}
      {colors.length > 0 && (
        <div>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#1565c0",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "0.6rem",
            }}
          >
            Colors from your design
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
            {colors.map((hex, i) => {
              const isActive =
                hex.toUpperCase() === selectedColor.toUpperCase();
              return (
                <button
                  key={`${hex}-${i}`}
                  onClick={() => applyColor(hex)}
                  title={hex.toUpperCase()}
                  aria-label={`Select color ${hex.toUpperCase()}`}
                  aria-pressed={isActive}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: hex,
                    border: isActive
                      ? "3px solid #1565c0"
                      : "2px solid rgba(255,255,255,0.7)",
                    boxShadow: isActive
                      ? "0 0 0 2px rgba(21,101,192,0.35)"
                      : "0 2px 6px rgba(0,0,0,0.15)",
                    cursor: "pointer",
                    padding: 0,
                    transition: "transform 0.12s, box-shadow 0.12s",
                    transform: isActive ? "scale(1.15)" : "scale(1)",
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
