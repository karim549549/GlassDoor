"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type FoxBackgroundProps = {
  sectionRef: React.RefObject<HTMLElement | null>;
};

type Particle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  order: number;
  seed: number;
};

export function FoxBackground({ sectionRef }: FoxBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    const glowImg = glowImageRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let destroyed = false;
    let particles: Particle[] = [];
    let progress = 0;

    const mask = new window.Image();
    mask.src = "/artwork/devsarena-fox-mask.png";

    const random = (seed: number) => {
      const x = Math.sin(seed * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    const loadTargets = async () => {
      await new Promise<void>((resolve, reject) => {
        mask.onload = () => resolve();
        mask.onerror = () => reject(new Error("Failed to load fox mask"));
      });

      if (destroyed) return;

      // Sample mask at reduced resolution for high-performance coordinate lookup
      const sampleCanvas = document.createElement("canvas");
      const sampleWidth = 240;
      const sampleHeight = Math.round(
        sampleWidth * (mask.naturalHeight / mask.naturalWidth)
      );

      sampleCanvas.width = sampleWidth;
      sampleCanvas.height = sampleHeight;

      const sampleCtx = sampleCanvas.getContext("2d", {
        willReadFrequently: true,
      });
      if (!sampleCtx) return;

      sampleCtx.drawImage(mask, 0, 0, sampleWidth, sampleHeight);
      const pixels = sampleCtx.getImageData(0, 0, sampleWidth, sampleHeight).data;

      const candidates: { x: number; y: number }[] = [];
      for (let y = 0; y < sampleHeight; y++) {
        for (let x = 0; x < sampleWidth; x++) {
          const alpha = pixels[(y * sampleWidth + x) * 4];
          if (alpha > 75) {
            candidates.push({ x, y });
          }
        }
      }

      // Sort top-to-bottom for head-to-tail assembly flow
      candidates.sort((a, b) => a.y - b.y);

      if (candidates.length === 0) return;

      const mobile = window.innerWidth < 768;
      const count = mobile ? 750 : 1500;
      particles = [];

      for (let i = 0; i < count; i++) {
        const source = candidates[i % candidates.length];
        const nx = source.x / sampleWidth - 0.5;
        const ny = source.y / sampleHeight - 0.5;

        const tx = nx * Math.min(window.innerWidth * 0.75, 950);
        const ty = ny * Math.min(window.innerHeight * 0.95, 800);

        particles.push({
          x: (random(i + 1) - 0.5) * window.innerWidth * 1.3,
          y: (random(i + 2) - 0.5) * window.innerHeight * 1.3,
          tx,
          ty,
          order: i / count,
          seed: random(i + 10),
        });
      }

      resize();
      render();
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = () => {
      if (destroyed) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);

      const buildProgress = Math.min(progress / 0.65, 1);
      const energy = Math.max(0, (progress - 0.65) / 0.35);

      // Fade in the ambient neon fox graphic as particles assemble
      if (glowImg) {
        const glowOpacity = Math.min(Math.max((progress - 0.25) / 0.45, 0), 0.55);
        glowImg.style.opacity = glowOpacity.toFixed(2);
        glowImg.style.transform = `translate(-50%, -50%) scale(${0.85 + glowOpacity * 0.15})`;
      }

      ctx.save();
      ctx.translate(width / 2, height / 2);

      for (const p of particles) {
        const reveal = gsap.utils.clamp(0, 1, (buildProgress - p.order * 0.7) / 0.3);
        const eased = reveal * reveal * (3 - 2 * reveal);

        let x = p.x + (p.tx - p.x) * eased;
        let y = p.y + (p.ty - p.y) * eased;

        if (energy > 0) {
          const dx = p.tx;
          const dy = p.ty;
          const length = Math.max(1, Math.hypot(dx, dy));
          x += (dx / length) * energy * (10 + p.seed * 20);
          y += (dy / length) * energy * (10 + p.seed * 20);
        }

        // Shimmer motion
        const shimmer = Math.sin(performance.now() * 0.002 + p.seed * 20) * 0.4 * eased;
        x += shimmer;
        y += Math.cos(performance.now() * 0.0017 + p.seed * 17) * 0.3 * eased;

        const alpha = 0.1 + eased * 0.8;
        const size = 0.8 + eased * (1.2 + p.seed * 1.3);

        // Ambient particle glow
        ctx.globalAlpha = alpha * 0.15;
        ctx.fillStyle = "#ff6b00";
        ctx.beginPath();
        ctx.arc(x, y, size * 4.0, 0, Math.PI * 2);
        ctx.fill();

        // Core spark
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    window.addEventListener("resize", resize);

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 80%",
      end: "bottom 20%",
      scrub: true,
      onUpdate: (self) => {
        progress = self.progress;
      },
    });

    loadTargets().catch(() => {});

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      trigger.kill();
      window.removeEventListener("resize", resize);
    };
  }, [sectionRef]);

  return (
    <div className="absolute inset-0 pointer-events-none z-1 overflow-hidden">
      {/* Layer 1: Ambient Glowing Neon Fox Artwork Asset */}
      <div
        ref={glowImageRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(700px,90vw)] h-[min(600px,80vh)] opacity-0 transition-opacity duration-300 pointer-events-none mix-blend-screen select-none"
      >
        <Image
          src="/artwork/devsarena-fox-background.png"
          alt="DevsArena Nine-Tailed Fox Neon Background"
          fill
          className="object-contain filter drop-shadow-[0_0_35px_rgba(255,107,0,0.45)]"
          priority
        />
      </div>

      {/* Layer 2: Particle Constellation Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
      />
    </div>
  );
}

export default FoxBackground;
