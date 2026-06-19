"use client";

export default function Navbar() {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center",
      padding: "0 32px", height: 72,
      background: "rgba(10,58,60,0.88)",
      backdropFilter: "blur(14px)",
      borderBottom: "1px solid rgba(32,180,170,0.25)",
      width: "100%",
    }}>

      <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, textDecoration: "none" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="ColorCode AI logo" style={{ height: 60, width: "auto", flexShrink: 0 }} />
      </a>

      <div style={{ display: "flex", gap: 4, fontSize: 13, justifyContent: "center" }} className="nav-links-hide">
        <NavLink href="/upload"       icon={<UploadIcon />}>UPLOAD DESIGN</NavLink>
        <NavLink href="/color-theory" icon={<StarIcon />}>COLOR THEORY</NavLink>
      </div>
      <div />
    </nav>
  );
}

function NavLink({ href, children, icon }: { href: string; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <a href={href}
      style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, color: "#b8ece8", textDecoration: "none", transition: "background 0.18s, color 0.18s", whiteSpace: "nowrap" }}
      onMouseEnter={e => { const el = e.currentTarget; el.style.background = "rgba(255,255,255,0.12)"; el.style.color = "#e8fffe"; }}
      onMouseLeave={e => { const el = e.currentTarget; el.style.background = "transparent"; el.style.color = "#b8ece8"; }}
    >{icon}{children}</a>
  );
}


function UploadIcon() { return <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>; }
function StarIcon()   { return <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77l-6.18 3.23L7 14.14 2 9.27l6.91-1.01z"/></svg>; }
