"use client";

import React, { useState } from "react";
import type { TextLayersState, TextLayerData } from "./TextDesignerSection";

const DESIGN_REF_WIDTH = 600;

type TabId = "desktop" | "mobile" | "social";

interface PreviewSectionProps {
  imageUrl: string;
  textColor: string;
  bgColor: string;
  layers?: TextLayersState;
}

function DesignComposite({ imageUrl, layers, displayWidth }: {
  imageUrl: string;
  layers: TextLayersState | undefined;
  displayWidth: number;
}) {
  const fontScale = displayWidth / DESIGN_REF_WIDTH;
  return (
    <div style={{ position:"relative", width:"100%" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="Design" draggable={false} style={{ width:"100%", display:"block" }} />
      {layers && (["header","subtext"] as const).map(key => {
        const l: TextLayerData = layers[key];
        if (!l.text) return null;
        return (
          <div key={key} style={{
            position:"absolute", left:`${l.x}%`, top:`${l.y}%`,
            transform:`translate(-50%,-50%) scale(${l.scale})`,
            fontFamily:l.fontFamily, fontSize:l.fontSize * fontScale, fontWeight:l.fontWeight,
            color:l.color,
            textShadow: l.shadowEnabled ? `2px 2px ${l.shadowBlur * fontScale}px ${l.shadowColor}` : "none",
            whiteSpace:"nowrap", pointerEvents:"none", userSelect:"none", lineHeight:1.1,
          }}>{l.text}</div>
        );
      })}
    </div>
  );
}

function DesktopTab({ imageUrl, layers }: { imageUrl: string; layers?: TextLayersState }) {
  return (
    <div style={{ display:"flex", justifyContent:"center", overflowX:"auto", paddingBottom:8 }}>
      <div style={{ width:720, flexShrink:0, background:"#fff", borderRadius:14, boxShadow:"0 12px 48px rgba(0,0,0,0.22)", overflow:"hidden" }}>
        {/* Browser chrome */}
        <div style={{ background:"#f1f5f9", padding:"10px 16px", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ display:"flex", gap:6 }}>
            {["#ff5f57","#febc2e","#28c840"].map((c,i) => (
              <div key={i} style={{ width:12, height:12, borderRadius:"50%", background:c }} />
            ))}
          </div>
          <div style={{ flex:1, background:"#e2e8f0", borderRadius:6, padding:"4px 10px", fontSize:11, color:"#64748b", textAlign:"center" }}>
            yourwebsite.com
          </div>
          <div style={{ width:60 }} />
        </div>
        {/* Page nav */}
        <div style={{ background:"#1e293b", height:36, padding:"0 20px", display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:60, height:8, background:"rgba(255,255,255,0.3)", borderRadius:4 }} />
          <div style={{ flex:1 }} />
          {[0,1,2].map(i => <div key={i} style={{ width:40, height:5, background:"rgba(255,255,255,0.2)", borderRadius:3 }} />)}
        </div>
        {/* Design */}
        <DesignComposite imageUrl={imageUrl} layers={layers} displayWidth={720} />
      </div>
    </div>
  );
}

function MobileTab({ imageUrl, layers }: { imageUrl: string; layers?: TextLayersState }) {
  return (
    <div style={{ display:"flex", justifyContent:"center" }}>
      <div style={{ width:290, background:"#111827", borderRadius:44, padding:12, boxShadow:"0 20px 60px rgba(0,0,0,0.45)", display:"flex", flexDirection:"column", alignItems:"center" }}>
        <div style={{ width:80, height:20, background:"#111827", borderRadius:"0 0 14px 14px", marginBottom:-10, zIndex:1, position:"relative" }} />
        <div style={{ width:266, background:"#fff", borderRadius:28, overflow:"hidden" }}>
          <div style={{ background:"#000", padding:"5px 14px", display:"flex", justifyContent:"space-between" }}>
            <span style={{ color:"#fff", fontSize:9, fontWeight:700 }}>9:41</span>
            <span style={{ color:"#fff", fontSize:9 }}>● ● ●</span>
          </div>
          <DesignComposite imageUrl={imageUrl} layers={layers} displayWidth={266} />
        </div>
        <div style={{ width:80, height:4, background:"rgba(255,255,255,0.35)", borderRadius:2, margin:"10px auto 0" }} />
      </div>
    </div>
  );
}

function SocialTab({ imageUrl, layers }: { imageUrl: string; layers?: TextLayersState }) {
  const formats = [
    { label:"Square",    ratio:"1:1",  w:200, h:200 },
    { label:"Portrait",  ratio:"4:5",  w:180, h:225 },
    { label:"Landscape", ratio:"16:9", w:280, h:158 },
  ];
  return (
    <div style={{ display:"flex", gap:24, flexWrap:"wrap", justifyContent:"center", alignItems:"flex-start" }}>
      {formats.map(fmt => (
        <div key={fmt.label} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
          <div style={{ width:fmt.w, height:fmt.h, borderRadius:12, overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,0.18)", background:"#0a1828", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:fmt.w, overflow:"hidden" }}>
              <DesignComposite imageUrl={imageUrl} layers={layers} displayWidth={fmt.w} />
            </div>
          </div>
          <div style={{ textAlign:"center" }}>
            <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#0a1e38" }}>{fmt.label}</p>
            <p style={{ margin:0, fontSize:11, color:"#4a6a8a" }}>{fmt.ratio}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PreviewSection({ imageUrl, textColor: _tc, bgColor: _bg, layers }: PreviewSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>("desktop");

  const TABS: { id: TabId; label: string }[] = [
    { id:"desktop", label:"🖥 Desktop"  },
    { id:"mobile",  label:"📱 Mobile"   },
    { id:"social",  label:"📸 Social Media" },
  ];

  const cardStyle: React.CSSProperties = {
    background:"rgba(210,230,255,0.55)", backdropFilter:"blur(12px)", borderRadius:20,
    border:"1px solid rgba(148,196,255,0.4)", boxShadow:"0 4px 24px rgba(79,110,247,0.08)",
    padding:28,
  };

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display:"flex", gap:6, marginBottom:24, background:"rgba(255,255,255,0.5)", padding:5, borderRadius:12, border:"1px solid rgba(25,118,210,0.15)", width:"fit-content" }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding:"9px 20px", borderRadius:9, border:"none", cursor:"pointer",
            fontSize:13, fontWeight:600, transition:"background 0.15s, color 0.15s",
            background: activeTab===tab.id ? "#1976d2" : "transparent",
            color: activeTab===tab.id ? "#fff" : "#4a6a8a",
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={cardStyle}>
        {activeTab === "desktop" && <DesktopTab imageUrl={imageUrl} layers={layers} />}
        {activeTab === "mobile"  && <MobileTab  imageUrl={imageUrl} layers={layers} />}
        {activeTab === "social"  && <SocialTab  imageUrl={imageUrl} layers={layers} />}
      </div>
    </div>
  );
}
