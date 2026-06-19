"use client";

import React, { useState } from "react";
import type { TextLayersState, TextLayerData } from "./TextDesignerSection";
import { ctaButtonCss } from "./TextDesignerSection";

const DESIGN_REF_WIDTH = 600;

// ─── Phone models ─────────────────────────────────────────────────────────────

interface PhoneModel {
  id: string;
  name: string;
  brand: string;
  w: number; // logical points/dp
  h: number;
  camera: "dynamic-island" | "punch-hole" | "notch";
}

const PHONE_MODELS: PhoneModel[] = [
  { id: "iphone16pro",  name: "iPhone 16 Pro",       brand: "Apple",   w: 393, h: 852, camera: "dynamic-island" },
  { id: "iphone15",     name: "iPhone 15",           brand: "Apple",   w: 390, h: 844, camera: "notch"          },
  { id: "samsungs24",   name: "Samsung Galaxy S24",  brand: "Samsung", w: 360, h: 780, camera: "punch-hole"     },
  { id: "samsungA55",   name: "Samsung Galaxy A55",  brand: "Samsung", w: 360, h: 800, camera: "punch-hole"     },
  { id: "oppoFindX7",   name: "Oppo Find X7",        brand: "Oppo",    w: 412, h: 892, camera: "punch-hole"     },
  { id: "vivoX100",     name: "Vivo X100",           brand: "Vivo",    w: 393, h: 852, camera: "punch-hole"     },
  { id: "pixel9",       name: "Google Pixel 9",      brand: "Google",  w: 412, h: 892, camera: "punch-hole"     },
];

const SCREEN_H = 390; // target screen height in CSS px

// ─── Shared design composite ──────────────────────────────────────────────────

function DesignComposite({ imageUrl, layers, displayWidth, maxH }: {
  imageUrl: string;
  layers: TextLayersState | undefined;
  displayWidth: number;
  maxH?: number; // when set: clips height and centers content vertically
}) {
  const fontScale = displayWidth / DESIGN_REF_WIDTH;

  const inner = (
    <div style={{ position: "relative", width: "100%" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="Design" draggable={false} style={{ width: "100%", display: "block" }} />
      {layers && (["header", "subtext"] as const).map(key => {
        const l: TextLayerData = layers[key];
        if (!l.text) return null;
        return (
          <div key={key} style={{
            position: "absolute", left: `${l.x}%`, top: `${l.y}%`,
            transform: `translate(-50%,-50%) scale(${l.scale})`,
            fontFamily: l.fontFamily, fontSize: l.fontSize * fontScale, fontWeight: l.fontWeight,
            color: l.color,
            textShadow: l.shadowEnabled ? `2px 2px ${l.shadowBlur * fontScale}px ${l.shadowColor}` : "none",
            whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none", lineHeight: 1.1,
          }}>{l.text}</div>
        );
      })}
      {layers?.cta.enabled && (
        <div style={{
          position: "absolute", left: `${layers.cta.x}%`, top: `${layers.cta.y}%`,
          transform: `translate(-50%,-50%) scale(${layers.cta.scale})`,
          pointerEvents: "none", userSelect: "none",
          ...ctaButtonCss(layers.cta),
          fontSize: layers.cta.fontSize * fontScale,
          padding: `${8 * fontScale}px ${20 * fontScale}px`,
        }}>
          {layers.cta.text || "CTA Button"}
        </div>
      )}
    </div>
  );

  if (maxH !== undefined) {
    return (
      <div style={{ height: maxH, overflow: "hidden", display: "flex", alignItems: "center", position: "relative" }}>
        {inner}
      </div>
    );
  }
  return inner;
}

// ─── Desktop preview ──────────────────────────────────────────────────────────

function DesktopPreview({ imageUrl, layers }: { imageUrl: string; layers?: TextLayersState }) {
  const W = 480;
  return (
    <div style={{ flex: "1 1 420px", minWidth: 300 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4a6a8a" strokeWidth="2" strokeLinecap="round">
          <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
        </svg>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#4a6a8a", textTransform: "uppercase", letterSpacing: "0.9px" }}>Desktop</span>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.18)", overflow: "hidden", maxWidth: W }}>
        {/* Browser chrome */}
        <div style={{ background: "#f1f5f9", padding: "9px 14px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 5 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <div style={{ flex: 1, background: "#e2e8f0", borderRadius: 5, padding: "3px 10px", fontSize: 10, color: "#64748b", textAlign: "center" }}>
            yourwebsite.com
          </div>
          <div style={{ width: 48 }} />
        </div>
        {/* Nav bar */}
        <div style={{ background: "#1e293b", height: 28, padding: "0 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 6, background: "rgba(255,255,255,0.3)", borderRadius: 3 }} />
          <div style={{ flex: 1 }} />
          {[0, 1, 2].map(i => <div key={i} style={{ width: 32, height: 4, background: "rgba(255,255,255,0.18)", borderRadius: 2 }} />)}
        </div>
        <DesignComposite imageUrl={imageUrl} layers={layers} displayWidth={W} />
      </div>
    </div>
  );
}

// ─── Mobile preview ───────────────────────────────────────────────────────────

function MobilePreview({ imageUrl, layers }: { imageUrl: string; layers?: TextLayersState }) {
  const [modelId, setModelId] = useState(PHONE_MODELS[0].id);
  const model = PHONE_MODELS.find(m => m.id === modelId) ?? PHONE_MODELS[0];

  const scale = SCREEN_H / model.h;
  const screenW = Math.round(model.w * scale);
  const statusH = Math.round(28 * scale);
  const contentH = SCREEN_H - statusH;
  const frameP = 11; // outer frame padding

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, alignSelf: "flex-start" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4a6a8a" strokeWidth="2" strokeLinecap="round">
          <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" />
        </svg>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#4a6a8a", textTransform: "uppercase", letterSpacing: "0.9px" }}>Mobile</span>
      </div>

      {/* Model picker */}
      <select
        value={modelId}
        onChange={e => setModelId(e.target.value)}
        style={{
          fontSize: 12, padding: "5px 10px", borderRadius: 8,
          border: "1.5px solid rgba(25,118,210,0.25)", background: "rgba(255,255,255,0.7)",
          color: "#0a1e38", cursor: "pointer", width: screenW + frameP * 2,
        }}
      >
        {PHONE_MODELS.map(m => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>

      {/* Phone outer frame */}
      <div style={{
        background: "linear-gradient(145deg, #1f2937, #111827)",
        borderRadius: Math.round(44 * scale),
        padding: frameP,
        boxShadow: "0 24px 64px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.08), 0 0 0 1px rgba(0,0,0,0.6)",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>

        {/* Notch / Dynamic Island */}
        {model.camera === "notch" && (
          <div style={{
            width: Math.round(80 * scale), height: Math.round(22 * scale),
            background: "#111827", borderRadius: `0 0 ${Math.round(14 * scale)}px ${Math.round(14 * scale)}px`,
            marginBottom: Math.round(-8 * scale), zIndex: 2, position: "relative",
          }} />
        )}
        {model.camera === "dynamic-island" && (
          <div style={{
            width: Math.round(120 * scale), height: Math.round(36 * scale),
            background: "#0a0a0a", borderRadius: Math.round(36 * scale),
            marginBottom: Math.round(-4 * scale), zIndex: 2, position: "relative",
            display: "flex", alignItems: "center", justifyContent: "center", gap: Math.round(6 * scale),
          }}>
            <div style={{ width: Math.round(10 * scale), height: Math.round(10 * scale), borderRadius: "50%", background: "#1a1a2e" }} />
            <div style={{ width: Math.round(14 * scale), height: Math.round(14 * scale), borderRadius: "50%", background: "#1a1a2e", border: `${Math.round(1.5 * scale)}px solid #222` }} />
          </div>
        )}

        {/* Screen */}
        <div style={{
          width: screenW,
          borderRadius: Math.round(30 * scale),
          overflow: "hidden",
          background: "#fff",
          position: "relative",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
        }}>
          {/* Status bar */}
          <div style={{
            background: "#000", height: statusH,
            padding: `0 ${Math.round(12 * scale)}px`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ color: "#fff", fontSize: Math.round(9 * scale), fontWeight: 700 }}>9:41</span>
            {model.camera === "punch-hole" && (
              <div style={{
                width: Math.round(11 * scale), height: Math.round(11 * scale),
                borderRadius: "50%", background: "#0a0a0a", border: `${Math.round(1.5 * scale)}px solid #222`,
              }} />
            )}
            <div style={{ display: "flex", gap: Math.round(3 * scale), alignItems: "center" }}>
              {[3, 4, 5, 4].map((h, i) => (
                <div key={i} style={{ width: Math.round(3 * scale), height: Math.round(h * scale), background: "rgba(255,255,255,0.8)", borderRadius: 1 }} />
              ))}
              <svg width={Math.round(12 * scale)} height={Math.round(8 * scale)} viewBox="0 0 16 10" fill="none">
                <rect x="0.5" y="0.5" width="13" height="9" rx="2" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
                <rect x="14" y="3" width="2" height="4" rx="1" fill="rgba(255,255,255,0.4)"/>
                <rect x="1.5" y="1.5" width="9" height="7" rx="1.5" fill="rgba(255,255,255,0.8)"/>
              </svg>
            </div>
          </div>

          {/* Design — centered vertically in screen */}
          <DesignComposite imageUrl={imageUrl} layers={layers} displayWidth={screenW} maxH={contentH} />
        </div>

        {/* Home indicator */}
        <div style={{
          width: Math.round(80 * scale), height: Math.round(4 * scale),
          background: "rgba(255,255,255,0.32)", borderRadius: Math.round(2 * scale),
          margin: `${Math.round(8 * scale)}px auto 0`,
        }} />
      </div>

      {/* Phone label */}
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#0a1e38" }}>{model.name}</p>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#4a6a8a" }}>{model.w} × {model.h} pt</p>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface PreviewSectionProps {
  imageUrl: string;
  textColor: string;
  bgColor: string;
  layers?: TextLayersState;
}

export default function PreviewSection({ imageUrl, layers }: PreviewSectionProps) {
  return (
    <div style={{
      background: "rgba(210,230,255,0.55)", backdropFilter: "blur(12px)", borderRadius: 20,
      border: "1px solid rgba(148,196,255,0.4)", boxShadow: "0 4px 24px rgba(79,110,247,0.08)",
      padding: 28,
    }}>
      <div style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
        <DesktopPreview imageUrl={imageUrl} layers={layers} />
        <MobilePreview imageUrl={imageUrl} layers={layers} />
      </div>
    </div>
  );
}
