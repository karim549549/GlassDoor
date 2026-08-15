"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

interface ArenaCarouselProps {
  images: string[];
  title: string;
}

export function ArenaCarousel({ images, title }: ArenaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Auto-play carousel every 4 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) {
    return null;
  }

  const currentImage = images[activeIndex];

  return (
    <div className="w-full space-y-2.5">
      {/* 2-Column Section: Active Main Image (Left) + Vertical Scrollable Thumbnail Column (Right) */}
      <div className="flex gap-2 h-[200px] sm:h-[220px] md:h-[240px]">
        {/* Main Active Image Frame */}
        <div className="relative flex-1 h-full bg-foreground border-2 border-background/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden group">
          <Image
            src={currentImage}
            alt={`${title} screenshot ${activeIndex + 1}`}
            fill
            className="object-cover transition-all duration-500"
            sizes="(max-width: 768px) 100vw, 320px"
            priority
          />

          {/* Dark subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Counter Indicator */}
          <div className="absolute top-2 left-2 z-10 bg-foreground/85 text-background px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-widest border border-white/20">
            {activeIndex + 1} / {images.length}
          </div>

          {/* Lightbox Trigger */}
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute top-2 right-2 z-10 p-1.5 bg-foreground/85 hover:bg-foreground text-background border border-white/20 transition-all opacity-0 group-hover:opacity-100"
            title="Enlarge Image"
          >
            <Maximize2 className="w-3 h-3" />
          </button>

          {/* Left / Right Carousel Controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                }
                className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 p-1 bg-foreground/80 hover:bg-foreground text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                }
                className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 p-1 bg-foreground/80 hover:bg-foreground text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* RIGHT SIDE VERTICAL SCROLLABLE THUMBNAIL COLUMN (Exact height of active image) */}
        {images.length > 1 && (
          <div className="w-20 sm:w-24 h-full overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-orange scrollbar-track-foreground shrink-0">
            {images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative w-full aspect-[4/3] border-2 transition-all duration-200 overflow-hidden block ${
                  idx === activeIndex
                    ? "border-orange shadow-[2px_2px_0px_0px_var(--foreground)] opacity-100 scale-[0.98]"
                    : "border-white/20 opacity-60 hover:opacity-100 hover:border-white/60"
                }`}
              >
                <Image
                  src={imgUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CIRCULAR DOTS INDICATOR POSITIONED UNDERNEATH THE IMAGE FRAME (Active Dot in Orange) */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 pt-0.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`transition-all duration-200 ${
                idx === activeIndex
                  ? "w-2.5 h-2.5 rounded-full bg-orange scale-110 shadow-[0_0_8px_rgba(255,87,34,0.6)]"
                  : "w-2 h-2 rounded-full bg-background/40 hover:bg-background/80"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 md:p-8 flex flex-col justify-between">
          <div className="flex justify-between items-center text-background">
            <span className="font-mono text-xs text-orange tracking-widest uppercase font-bold">
              {title} — MEDIA {activeIndex + 1}/{images.length}
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 text-background/80 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative w-full flex-1 max-h-[80vh] my-auto flex items-center justify-center">
            <div className="relative w-full h-full max-w-5xl">
              <Image src={currentImage} alt="Enlarged" fill className="object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArenaCarousel;
