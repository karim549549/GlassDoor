"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";

export interface Parametric3DCardData {
  id: string;
  title: string;
  tag: string;
  description: string;
  organizer: string;
  initials: string;
  timeLabel: string;
  timeValue: string;
  isLive?: boolean;
  tech: string[];
  coordinates?: string;
  coverImageUrl?: string;
}

interface Parametric3DArenaCardProps {
  card: Parametric3DCardData;
  activeTimer?: string;
}

export function Parametric3DArenaCard({ card, activeTimer = "00:00:00" }: Parametric3DArenaCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isFlipped, setIsFlipped] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFlipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate rotation (-15deg to +15deg)
    const rotateY = ((mouseX - width / 2) / (width / 2)) * 18;
    const rotateX = -((mouseY - height / 2) / (height / 2)) * 18;

    setRotate({ x: rotateX, y: rotateY });
    setGlarePos({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlarePos({ x: 50, y: 50 });
  };

  const handleCardClick = () => {
    setIsFlipped((prev) => !prev);
  };

  return (
    <div
      className="w-full max-w-[480px] mx-auto select-none cursor-pointer"
      style={{ perspective: "1000px" }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        className="relative w-full min-h-[300px] bg-[#FAF8F5] text-[#0E0E0D] border-4 border-double border-[#0E0E0D] p-6 flex flex-col justify-between transition-transform duration-150 ease-out shadow-[6px_6px_0px_0px_#0E0E0D]"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped
            ? "rotateY(180deg)"
            : `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.02, 1.02, 1.02)`,
        }}
      >
        {/* Specular Glare Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 70%)`,
          }}
        />

        {/* Outer Dotted Guideline Frames */}
        <div className="absolute inset-1.5 border border-[#0E0E0D]/15 pointer-events-none" />
        <div className="absolute inset-2 border border-dashed border-[#0E0E0D]/10 pointer-events-none" />

        {/* FRONT FACE (Dynamic Parameters Rendered on 3D Surface) */}
        {!isFlipped ? (
          <div className="space-y-4 relative z-20" style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}>
            {/* Header: Tag + Title */}
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span
                  className="text-orange font-bold font-mono text-[0.58rem] tracking-[0.2em] border border-orange px-2 py-0.5 inline-block bg-orange/10"
                  style={{ transform: "translateZ(45px)" }}
                >
                  [{card.tag}]
                </span>

                {card.coordinates && (
                  <span
                    className="font-mono text-[0.48rem] font-bold text-[#0E0E0D]/50 uppercase tracking-widest border border-[#0E0E0D]/20 px-1.5 py-0.5 bg-white"
                    style={{ transform: "translateZ(35px)" }}
                  >
                    GPS: {card.coordinates}
                  </span>
                )}
              </div>

              <h3
                className="font-display italic text-2xl sm:text-3xl leading-tight text-[#0E0E0D] tracking-tight"
                style={{ transform: "translateZ(40px)" }}
              >
                {card.title}
              </h3>

              <p
                className="font-mono text-[0.55rem] text-muted-foreground uppercase tracking-widest leading-relaxed max-w-sm"
                style={{ transform: "translateZ(25px)" }}
              >
                {card.description}
              </p>
            </div>

            {/* Optional Aerial Cover Image */}
            {card.coverImageUrl && (
              <div
                className="relative w-full h-24 border border-[#0E0E0D] overflow-hidden my-2"
                style={{ transform: "translateZ(35px)" }}
              >
                <Image
                  src={card.coverImageUrl}
                  alt={card.title}
                  fill
                  className="object-cover opacity-90 hover:scale-105 transition-transform"
                />
              </div>
            )}

            {/* Bottom Row: Organizer + Timer + Tech Badges */}
            <div
              className="flex items-end justify-between gap-3 pt-3 border-t border-dashed border-[#0E0E0D]/25"
              style={{ transform: "translateZ(35px)" }}
            >
              {/* Organizer Badge */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full border border-[#0E0E0D] bg-[#0E0E0D] text-white flex items-center justify-center font-mono text-[0.52rem] font-bold">
                  {card.initials}
                </div>
                <div className="text-left">
                  <span className="font-mono text-[0.4rem] text-muted-foreground uppercase tracking-widest block font-bold leading-none">
                    [HOST]
                  </span>
                  <span className="font-mono text-[0.5rem] font-bold uppercase tracking-wider text-[#0E0E0D]">
                    {card.organizer}
                  </span>
                </div>
              </div>

              {/* Live Countdown */}
              <div className="text-right">
                <span className="font-mono text-[0.4rem] uppercase tracking-widest text-muted-foreground block font-bold">
                  [{card.timeLabel}]
                </span>
                <span className="font-mono text-xs font-bold text-orange">
                  {card.isLive ? activeTimer : card.timeValue}
                </span>
              </div>
            </div>

            <div className="text-center pt-1">
              <span className="font-mono text-[0.45rem] font-bold uppercase tracking-widest text-[#0E0E0D]/40">
                [ CLICK TO FLIP POSTCARD 🔄 ]
              </span>
            </div>
          </div>
        ) : (
          /* BACK FACE (3D Envelope Back Details) */
          <div
            className="space-y-4 text-center py-6 relative z-20 flex flex-col items-center justify-center min-h-[260px]"
            style={{ transform: "rotateY(180deg) translateZ(30px)" }}
          >
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-orange font-bold border border-orange px-2 py-0.5">
              OFFICIAL ARENA POSTCARD
            </span>

            <h4 className="font-display italic text-xl uppercase tracking-tight text-[#0E0E0D]">
              {card.title}
            </h4>

            <div className="p-3 bg-[#0E0E0D]/5 border border-[#0E0E0D]/20 font-mono text-[0.55rem] uppercase max-w-xs text-left space-y-1">
              <p>• HOSTED BY: {card.organizer}</p>
              <p>• LOCATION: {card.coordinates || "VIRTUAL ONLINE ARENA"}</p>
              <p>• TECH: {card.tech.join(", ")}</p>
            </div>

            <span className="font-mono text-[0.5rem] uppercase font-bold text-[#0E0E0D]/60 border border-[#0E0E0D] px-3 py-1 bg-white">
              CLICK AGAIN TO FLIP BACK ←
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Parametric3DArenaCard;
