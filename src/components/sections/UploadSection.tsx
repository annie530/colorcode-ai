"use client";

import React, { useCallback, useRef, useState } from "react";

interface UploadSectionProps {
  onColorsExtracted: (colors: string[], imageUrl: string) => void;
  onRemove?: () => void;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const ACCEPTED_EXTENSIONS = ["PNG", "JPG", "JPEG", "GIF", "WEBP"];
const NUM_COLORS = 6;
const SAMPLE_SIZE = 64; // downsample canvas dimension for speed

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
    Math.pow(a[1] - b[1], 2) +
    Math.pow(a[2] - b[2], 2)
  );
}

function extractDominantColors(imageEl: HTMLImageElement, count: number): string[] {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  ctx.drawImage(imageEl, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

  // Collect all opaque pixels
  const pixels: [number, number, number][] = [];
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 128) continue; // skip transparent
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }

  if (pixels.length === 0) return [];

  // Simple k-means with k = count
  // Seed centroids by spacing through the pixel array
  const step = Math.max(1, Math.floor(pixels.length / count));
  let centroids: [number, number, number][] = Array.from({ length: count }, (_, k) => {
    const px = pixels[Math.min(k * step, pixels.length - 1)];
    return [px[0], px[1], px[2]];
  });

  for (let iter = 0; iter < 10; iter++) {
    const sums: [number, number, number][] = centroids.map(() => [0, 0, 0]);
    const counts: number[] = new Array(count).fill(0);

    for (const px of pixels) {
      let minDist = Infinity;
      let minIdx = 0;
      for (let c = 0; c < count; c++) {
        const d = colorDistance(px, centroids[c]);
        if (d < minDist) { minDist = d; minIdx = c; }
      }
      sums[minIdx][0] += px[0];
      sums[minIdx][1] += px[1];
      sums[minIdx][2] += px[2];
      counts[minIdx]++;
    }

    centroids = centroids.map((centroid, c) =>
      counts[c] > 0
        ? [
            Math.round(sums[c][0] / counts[c]),
            Math.round(sums[c][1] / counts[c]),
            Math.round(sums[c][2] / counts[c]),
          ]
        : centroid
    );
  }

  return centroids.map(([r, g, b]) => rgbToHex(r, g, b));
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Perceived luminance
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}

export default function UploadSection({ onColorsExtracted, onRemove }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const processFile = useCallback((file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Unsupported file type. Please upload PNG, JPG, JPEG, GIF, or WEBP.");
      return;
    }
    setError(null);
    setColors([]);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFileName(file.name);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset so same file can be re-selected
      e.target.value = "";
    },
    [processFile]
  );

  const handleAnalyse = useCallback(() => {
    if (!previewUrl || !imageRef.current) return;
    setIsLoading(true);
    setError(null);

    // Small delay to let loading state render
    setTimeout(() => {
      try {
        const extracted = extractDominantColors(imageRef.current!, NUM_COLORS);
        setColors(extracted);
        setIsLoading(false);
        onColorsExtracted(extracted, previewUrl);
      } catch {
        setError("Failed to extract colors. Please try a different image.");
        setIsLoading(false);
      }
    }, 60);
  }, [previewUrl, onColorsExtracted]);

  const handleImageLoad = useCallback(() => {
    // Image is ready; nothing automatic — user clicks Analyse
  }, []);

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setFileName(null);
    setColors([]);
    setError(null);
    onRemove?.();
  }, [onRemove]);

  const cardStyle: React.CSSProperties = {
    background: "rgba(210,230,255,0.55)",
    border: "1.5px solid rgba(25,118,210,0.25)",
    borderRadius: 16,
    padding: "32px 28px",
    maxWidth: 560,
    margin: "0 auto",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: "#0a1e38",
  };

  const dropZoneStyle: React.CSSProperties = {
    border: `2px dashed ${isDragging ? "rgba(25,118,210,0.7)" : "rgba(25,118,210,0.35)"}`,
    borderRadius: 12,
    padding: "36px 20px",
    textAlign: "center",
    background: isDragging ? "rgba(25,118,210,0.07)" : "rgba(255,255,255,0.45)",
    cursor: "pointer",
    transition: "background 0.15s, border-color 0.15s",
    marginBottom: 20,
  };

  const chipContainerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    marginTop: 10,
  };

  const chipStyle: React.CSSProperties = {
    background: "rgba(25,118,210,0.12)",
    color: "#1e4060",
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.3,
  };

  const browseButtonStyle: React.CSSProperties = {
    display: "inline-block",
    marginTop: 14,
    padding: "9px 22px",
    background: "rgba(25,118,210,0.13)",
    color: "#1565c0",
    border: "1.5px solid rgba(25,118,210,0.3)",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s",
  };

  const analyseButtonStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "13px 0",
    background: isLoading ? "rgba(25,118,210,0.35)" : "#1565c0",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    cursor: isLoading || !previewUrl ? "not-allowed" : "pointer",
    opacity: !previewUrl && !isLoading ? 0.5 : 1,
    marginTop: 20,
    letterSpacing: 0.2,
    transition: "background 0.15s, opacity 0.15s",
  };

  const swatchGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    marginTop: 16,
  };

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0a1e38" }}>
          Upload Your Design
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#1e4060", lineHeight: 1.5 }}>
          Supported: <span style={{ fontWeight: 600 }}>Posters · Social Media · UI Designs · Advertisements · Presentations</span>
        </p>
      </div>

      {/* Drop Zone */}
      <div
        style={dropZoneStyle}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload image drop zone"
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
      >
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          style={{ margin: "0 auto 10px", display: "block", opacity: 0.55 }}
          stroke="#1565c0"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="16 16 12 12 8 16" />
          <line x1="12" y1="12" x2="12" y2="21" />
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
        </svg>

        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#0a1e38" }}>
          Drag &amp; drop your image here
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#1e4060" }}>
          or click to browse from your device
        </p>

        {/* File type chips */}
        <div style={chipContainerStyle}>
          {ACCEPTED_EXTENSIONS.map((ext) => (
            <span key={ext} style={chipStyle}>{ext}</span>
          ))}
        </div>

        <button
          style={browseButtonStyle}
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          type="button"
        >
          Browse Files
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        style={{ display: "none" }}
        onChange={handleFileChange}
        aria-hidden="true"
      />

      {/* Error */}
      {error && (
        <p style={{ color: "#c62828", fontSize: 13, marginBottom: 12, marginTop: -8 }}>
          {error}
        </p>
      )}

      {/* Preview */}
      {previewUrl && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#1e4060", fontWeight: 500 }}>
              Preview — <span style={{ fontWeight: 400, opacity: 0.75 }}>{fileName}</span>
            </p>
            <button
              onClick={handleRemove}
              type="button"
              title="Remove image"
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(198,40,40,0.08)",
                color: "#c62828",
                border: "1px solid rgba(198,40,40,0.25)",
                borderRadius: 7,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(198,40,40,0.16)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(198,40,40,0.08)")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Remove
            </button>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              background: "rgba(255,255,255,0.5)",
              borderRadius: 10,
              padding: 10,
              border: "1px solid rgba(25,118,210,0.15)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={previewUrl}
              alt="Uploaded preview"
              onLoad={handleImageLoad}
              style={{
                maxHeight: 200,
                maxWidth: "100%",
                borderRadius: 8,
                objectFit: "contain",
                display: "block",
              }}
              crossOrigin="anonymous"
            />
          </div>
        </div>
      )}

      {/* Color swatches */}
      {colors.length > 0 && (
        <div>
          <p style={{ margin: "14px 0 0", fontSize: 13, fontWeight: 600, color: "#1e4060" }}>
            Dominant Colors
          </p>
          <div style={swatchGridStyle}>
            {colors.map((hex, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px solid rgba(25,118,210,0.15)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                }}
              >
                <div
                  style={{
                    background: hex,
                    height: 52,
                    width: "100%",
                  }}
                  aria-label={`Color swatch ${hex}`}
                />
                <div
                  style={{
                    background: "rgba(255,255,255,0.75)",
                    padding: "4px 6px",
                    textAlign: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#0a1e38",
                    letterSpacing: 0.5,
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {hex}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyse CTA */}
      <button
        style={analyseButtonStyle}
        onClick={handleAnalyse}
        disabled={!previewUrl || isLoading}
        type="button"
        aria-busy={isLoading}
      >
        {isLoading ? "Analysing your design..." : "Analyse Colors"}
      </button>
    </div>
  );
}
