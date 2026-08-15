"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

interface FoxBackgroundProps {
  sectionRef: React.RefObject<HTMLElement | null>;
}

export function FoxBackground({ sectionRef }: FoxBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let destroyed = false;

    // Ambient embers drifting around the glowing fox tails
    const emberCount = 55;
    const embers: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      seed: number;
    }[] = [];

    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let i = 0; i < emberCount; i++) {
      embers.push({
        x: (Math.random() - 0.5) * Math.min(width * 0.85, 900),
        y: (Math.random() - 0.5) * Math.min(height * 0.85, 650),
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.25 - Math.random() * 0.5,
        size: 0.8 + Math.random() * 1.5,
        alpha: 0.2 + Math.random() * 0.6,
        seed: Math.random() * 100,
      });
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      if (destroyed) return;

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);

      const time = performance.now() * 0.001;

      for (const e of embers) {
        e.x += e.vx + Math.sin(time + e.seed) * 0.25;
        e.y += e.vy;

        // Wrap around bounds
        if (e.y < -h * 0.45) e.y = h * 0.45;
        if (e.x < -w * 0.45) e.x = w * 0.45;
        if (e.x > w * 0.45) e.x = -w * 0.45;

        const flicker = 0.7 + 0.3 * Math.sin(time * 3 + e.seed);
        const currentAlpha = e.alpha * flicker;

        // Outer glow
        ctx.globalAlpha = currentAlpha * 0.25;
        ctx.fillStyle = "#ff6b00";
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Inner spark
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = "#ffaa44";
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    render();

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [sectionRef]);

  return (
    <div className="absolute inset-0 pointer-events-none z-1 flex items-center justify-center overflow-hidden">
      {/* High-Resolution Glowing Neon Nine-Tailed Fox Artwork Layer (Starts at opacity: 0, fades in after 50% text reveal) */}
      <div className="fox-neon-art relative w-[min(960px,94vw)] h-[min(680px,84vh)] pointer-events-none select-none opacity-0 will-change-[opacity,transform,filter]">
        <Image
          src="/artwork/devsarena-fox-background.png"
          alt="DevsArena Nine-Tailed Fox Neon Background"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Floating Ambient Embers Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fox-embers-canvas absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-0 will-change-[opacity]"
      />
    </div>
  );
}

export default FoxBackground;
