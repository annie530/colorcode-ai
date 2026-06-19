"use client";

import { useEffect, useRef } from "react";

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Star = { x: number; y: number; r: number; a: number };
    let stars: Star[] = [];
    let animId: number;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = document.body.scrollHeight;
    }

    function makeStars(n: number) {
      if (!canvas) return;
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        r: Math.random() * 1.4 + 0.2,
        a: Math.random() * 0.7 + 0.15,
      }));
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${s.a})`;
        ctx.fill();
      }
    }

    let tick = 0;
    function animate() {
      tick++;
      if (tick % 2 === 0) {
        for (const s of stars) {
          s.a += (Math.random() - 0.5) * 0.04;
          s.a = Math.max(0.05, Math.min(0.85, s.a));
        }
        draw();
      }
      animId = requestAnimationFrame(animate);
    }

    resize();
    makeStars(320);
    draw();
    animate();

    const onResize = () => { resize(); makeStars(320); draw(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}
