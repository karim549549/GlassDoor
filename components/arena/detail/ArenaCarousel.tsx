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
    <div className="w-full space-y-2">
      {/* Carousel Main Slide Frame */}
      <div className="relative w-full aspect-[16/10] bg-[#0E0E0D] border-2 border-[#F1EFE9]/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden group">
        <Image
          src={currentImage}
          alt={`${title} screenshot ${activeIndex + 1}`}
          fill
          className="object-cover transition-all duration-500"
          sizes="(max-width: 768px) 100vw, 380px"
        />

        {/* Dark subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Slide Counter Indicator */}
        <div className="absolute top-2 left-2 bg-[#0E0E0D]/80 text-[#F1EFE9] px-2 py-0.5 font-mono text-[0.52rem] uppercase tracking-widest border border-white/20">
          {activeIndex + 1} / {images.length}
        </div>

        {/* Lightbox Trigger */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-2 right-2 p-1.5 bg-[#0E0E0D]/80 hover:bg-[#0E0E0D] text-[#F1EFE9] border border-white/20 transition-all opacity-0 group-hover:opacity-100"
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
              className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1 bg-[#0E0E0D]/70 hover:bg-[#0E0E0D] text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
              }
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 bg-[#0E0E0D]/70 hover:bg-[#0E0E0D] text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Navigation Dots / Thumbnail Selectors */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 transition-all duration-200 ${
                idx === activeIndex
                  ? "w-6 bg-orange"
                  : "w-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 md:p-8 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[#F1EFE9]">
            <span className="font-mono text-xs text-orange tracking-widest uppercase font-bold">
              {title} — MEDIA {activeIndex + 1}/{images.length}
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 text-[#F1EFE9]/80 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
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
