// Color utility functions — pure TypeScript, no external dependencies

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RGB { r: number; g: number; b: number }
export interface HSL { h: number; s: number; l: number }
export interface CMYK { c: number; m: number; y: number; k: number }
export interface ColorInfo { hex: string; rgb: RGB; hsl: HSL; cmyk: CMYK; name?: string }
export interface TextRec { color: ColorInfo; contrast: number; wcag: 'AAA' | 'AA' | 'Fail'; role: string; reason: string }

// ─── Conversion Utilities ─────────────────────────────────────────────────────

/**
 * Convert a hex color string to an RGB object.
 * Accepts 3-digit (#RGB) and 6-digit (#RRGGBB) forms, with or without the '#'.
 */
export function hexToRgb(hex: string): RGB {
  const clean = hex.replace(/^#/, '');
  const expanded =
    clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean;

  if (expanded.length !== 6) {
    throw new Error(`Invalid hex color: "${hex}"`);
  }

  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16),
  };
}

/**
 * Convert an RGB object to a 6-digit lowercase hex string (with leading '#').
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Convert RGB to HSL.
 * h ∈ [0, 360), s ∈ [0, 100], l ∈ [0, 100]
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB.
 * h ∈ [0, 360), s ∈ [0, 100], l ∈ [0, 100]
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    let tc = t;
    if (tc < 0) tc += 1;
    if (tc > 1) tc -= 1;
    if (tc < 1 / 6) return p + (q - p) * 6 * tc;
    if (tc < 1 / 2) return q;
    if (tc < 2 / 3) return p + (q - p) * (2 / 3 - tc) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

/**
 * Convert RGB to CMYK.
 * c, m, y, k ∈ [0, 100] (percentages).
 */
export function rgbToCmyk(rgb: RGB): CMYK {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const k = 1 - Math.max(r, g, b);

  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

/**
 * Build a full ColorInfo object from a hex string.
 */
export function buildColorInfo(hex: string): ColorInfo {
  const normalised = hex.startsWith('#') ? hex : `#${hex}`;
  const rgb = hexToRgb(normalised);
  return {
    hex: rgbToHex(rgb), // normalise to 6-digit lowercase
    rgb,
    hsl: rgbToHsl(rgb),
    cmyk: rgbToCmyk(rgb),
  };
}

// ─── WCAG Contrast Helpers ────────────────────────────────────────────────────

/**
 * Compute WCAG 2.1 relative luminance for an RGB color.
 * Returns a value in [0, 1].
 */
export function getLuminance(rgb: RGB): number {
  const linearise = (channel: number): number => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  return (
    0.2126 * linearise(rgb.r) +
    0.7152 * linearise(rgb.g) +
    0.0722 * linearise(rgb.b)
  );
}

/**
 * Compute the WCAG 2.1 contrast ratio between two RGB colors.
 * Returns a value in [1, 21].
 */
export function getContrastRatio(a: RGB, b: RGB): number {
  const lumA = getLuminance(a);
  const lumB = getLuminance(b);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Map a contrast ratio to a WCAG conformance level.
 * AAA >= 7 : 1, AA >= 4.5 : 1, otherwise Fail.
 */
export function getWCAG(ratio: number): 'AAA' | 'AA' | 'Fail' {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'Fail';
}

// ─── Text Recommendations ─────────────────────────────────────────────────────

/**
 * Given a background hex color, return 4 text color recommendations
 * sorted by contrast ratio (highest first), with WCAG level, role, and reason.
 */
export function getTextRecs(bgHex: string): TextRec[] {
  const bg = hexToRgb(bgHex.startsWith('#') ? bgHex : `#${bgHex}`);

  const candidates: Array<{ hex: string; label: string }> = [
    { hex: '#FFFFFF', label: 'White' },
    { hex: '#F0F4FF', label: 'Near-white' },
    { hex: '#0A1020', label: 'Black' },
    { hex: '#0A1E38', label: 'Dark navy' },
    { hex: '#F0A500', label: 'Gold' },
    { hex: '#20B4AA', label: 'Teal' },
    { hex: '#F07070', label: 'Coral' },
  ];

  const scored = candidates.map(({ hex, label }) => {
    const rgb = hexToRgb(hex);
    const ratio = getContrastRatio(bg, rgb);
    const wcag = getWCAG(ratio);
    return { hex, label, rgb, ratio, wcag };
  });

  // Sort descending by contrast ratio
  scored.sort((a, b) => b.ratio - a.ratio);

  const roles = ['primary', 'secondary', 'accent', 'cta'];

  const buildReason = (item: typeof scored[0]): string => {
    const ratioStr = item.ratio.toFixed(1);
    if (item.wcag === 'AAA') {
      return `Excellent contrast (${ratioStr}:1) — passes WCAG AAA, ideal for body text`;
    }
    if (item.wcag === 'AA') {
      return `Good contrast (${ratioStr}:1) — passes WCAG AA, suitable for large text and UI components`;
    }
    return `Low contrast (${ratioStr}:1) — fails WCAG; use sparingly for decorative elements only`;
  };

  return scored.slice(0, 4).map((item, i) => ({
    color: buildColorInfo(item.hex),
    contrast: Math.round(item.ratio * 100) / 100,
    wcag: item.wcag,
    role: roles[i],
    reason: buildReason(item),
  }));
}

// ─── Palette Generation ───────────────────────────────────────────────────────

/** Wrap a hue value into [0, 360). */
function wrapHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

/**
 * Generate a color palette from a base hex color.
 * Supports: complementary, analogous, triadic, monochromatic, split-complementary.
 */
export function generatePalette(
  baseHex: string,
  type: 'complementary' | 'analogous' | 'triadic' | 'monochromatic' | 'split-complementary',
): ColorInfo[] {
  const base = buildColorInfo(baseHex.startsWith('#') ? baseHex : `#${baseHex}`);
  const { h, s, l } = base.hsl;

  const makeColor = (hue: number, sat: number, lit: number): ColorInfo => {
    const hsl: HSL = { h: wrapHue(hue), s: Math.max(0, Math.min(100, sat)), l: Math.max(0, Math.min(100, lit)) };
    const rgb = hslToRgb(hsl);
    return buildColorInfo(rgbToHex(rgb));
  };

  switch (type) {
    case 'complementary':
      return [
        base,
        makeColor(h + 180, s, l),
        makeColor(h + 30, s, Math.min(l + 10, 90)),
        makeColor(h + 210, s, Math.min(l + 10, 90)),
      ];

    case 'analogous':
      return [
        makeColor(h - 60, s, l),
        makeColor(h - 30, s, l),
        base,
        makeColor(h + 30, s, l),
        makeColor(h + 60, s, l),
      ];

    case 'triadic':
      return [
        base,
        makeColor(h + 120, s, l),
        makeColor(h + 240, s, l),
        makeColor(h + 60, Math.max(s - 20, 10), Math.min(l + 15, 90)),
      ];

    case 'monochromatic':
      return [
        makeColor(h, s, 20),
        makeColor(h, s, 40),
        makeColor(h, s, 60),
        makeColor(h, s, 80),
      ];

    case 'split-complementary':
      return [
        base,
        makeColor(h + 150, s, l),
        makeColor(h + 210, s, l),
        makeColor(h + 180, Math.max(s - 15, 10), Math.min(l + 15, 90)),
        makeColor(h + 330, s, Math.max(l - 10, 10)),
      ];

    default:
      throw new Error(`Unknown palette type: "${type}"`);
  }
}

// ─── Canvas Color Extraction ──────────────────────────────────────────────────

/** Euclidean distance between two RGB colors. */
function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt(
    (a.r - b.r) ** 2 +
    (a.g - b.g) ** 2 +
    (a.b - b.b) ** 2,
  );
}

/**
 * Extract dominant colors from an HTMLCanvasElement using a simple k-means
 * quantization over sampled pixels.
 *
 * Samples every 10th pixel, runs 3 iterations of k-means with k=8,
 * and returns hex strings sorted from most to least dominant.
 */
export function extractColorsFromCanvas(canvas: HTMLCanvasElement): string[] {
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data; // Uint8ClampedArray: [r,g,b,a, r,g,b,a, ...]

  // Sample every 10th pixel, skip fully-transparent pixels
  const samples: RGB[] = [];
  for (let i = 0; i < data.length; i += 4 * 10) {
    const alpha = data[i + 3];
    if (alpha < 128) continue; // skip transparent
    samples.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
  }

  if (samples.length === 0) return [];

  const K = 8;

  // Seed centroids by spreading evenly through the sample array
  const centroids: RGB[] = Array.from({ length: K }, (_, i) =>
    samples[Math.floor((i / K) * samples.length)],
  );

  let assignments: number[] = new Array(samples.length).fill(0);

  // Run 3 iterations of k-means
  for (let iter = 0; iter < 3; iter++) {
    // Assignment step
    for (let si = 0; si < samples.length; si++) {
      let bestCluster = 0;
      let bestDist = Infinity;
      for (let k = 0; k < K; k++) {
        const d = colorDistance(samples[si], centroids[k]);
        if (d < bestDist) {
          bestDist = d;
          bestCluster = k;
        }
      }
      assignments[si] = bestCluster;
    }

    // Update step — recompute centroids as mean of assigned samples
    const sums: Array<{ r: number; g: number; b: number; count: number }> = Array.from(
      { length: K },
      () => ({ r: 0, g: 0, b: 0, count: 0 }),
    );

    for (let si = 0; si < samples.length; si++) {
      const k = assignments[si];
      sums[k].r += samples[si].r;
      sums[k].g += samples[si].g;
      sums[k].b += samples[si].b;
      sums[k].count += 1;
    }

    for (let k = 0; k < K; k++) {
      if (sums[k].count > 0) {
        centroids[k] = {
          r: Math.round(sums[k].r / sums[k].count),
          g: Math.round(sums[k].g / sums[k].count),
          b: Math.round(sums[k].b / sums[k].count),
        };
      }
    }
  }

  // Count cluster sizes for sorting
  const clusterSizes: number[] = new Array(K).fill(0);
  for (const a of assignments) clusterSizes[a]++;

  // Sort clusters by size (most dominant first), skip empty clusters
  const sortedClusters = Array.from({ length: K }, (_, k) => ({ k, size: clusterSizes[k] }))
    .filter((c) => c.size > 0)
    .sort((a, b) => b.size - a.size);

  return sortedClusters.map(({ k }) => rgbToHex(centroids[k]));
}
