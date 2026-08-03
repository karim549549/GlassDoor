"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Maximize2, Image as ImageIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";

interface ArenaCoverGalleryProps {
  coverImageUrl?: string | null;
  additionalImages?: string[];
  title: string;
}

export function ArenaCoverGallery({
  coverImageUrl,
  additionalImages = [],
  title,
}: ArenaCoverGalleryProps) {
  // Combine cover image with additional images if available
  const allImages = [
    ...(coverImageUrl ? [coverImageUrl] : []),
    ...additionalImages,
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const currentImage = allImages[activeIndex] || null;

  return (
    <div className="w-full space-y-3">
      {/* Main Cover Image Frame */}
      <div className="relative w-full aspect-[16/9] md:aspect-[16/10] bg-[#0E0E0D] border-2 border-[#0E0E0D] shadow-[6px_6px_0px_0px_#0E0E0D] overflow-hidden group">
        {currentImage ? (
          <Image
            src={currentImage}
            alt={`${title} cover`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
        ) : (
          /* Generative Blueprint Retro Fallback */
          <div className="absolute inset-0 bg-[#0E0E0D] p-6 flex flex-col justify-between text-[#F1EFE9]">
            <BackgroundGrid opacity={0.12} patternSize={24} />
            <div className="relative z-10 flex justify-between items-start">
              <span className="font-mono text-[0.6rem] text-orange tracking-widest uppercase font-bold border border-orange/40 px-2 py-0.5">
                [ARENA COVER MEDIA]
              </span>
              <span className="font-mono text-[0.55rem] text-[#F1EFE9]/40 uppercase tracking-widest">
                NO_COVER_ATTACHED
              </span>
            </div>
            <div className="relative z-10 space-y-1 text-center py-6">
              <ImageIcon className="w-10 h-10 mx-auto text-orange/60 stroke-[1.5]" />
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#F1EFE9]/70 font-bold">
                {title}
              </p>
            </div>
            <div className="relative z-10 flex justify-between items-end font-mono text-[0.55rem] text-[#F1EFE9]/30 uppercase">
              <span>GLASS_DOOR_ARENA</span>
              <span>GRID_REF_2026</span>
            </div>
          </div>
        )}

        {/* Lightbox Trigger Button */}
        {currentImage && (
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute top-3 right-3 bg-[#0E0E0D]/80 hover:bg-[#0E0E0D] text-[#F1EFE9] p-2 border border-[#F1EFE9]/20 transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 font-mono text-[0.55rem] uppercase tracking-wider"
            title="Expand cover image"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>ENLARGE</span>
          </button>
        )}

        {/* Image index overlay badge */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-3 bg-[#0E0E0D]/85 text-[#F1EFE9] px-2.5 py-1 font-mono text-[0.55rem] tracking-widest border border-[#F1EFE9]/20">
            MEDIA {activeIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Additional Images / Thumbnail Carousel Bar */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
          {allImages.map((imgUrl, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-20 h-14 shrink-0 border-2 transition-all duration-200 overflow-hidden ${
                idx === activeIndex
                  ? "border-orange shadow-[2px_2px_0px_0px_#0E0E0D]"
                  : "border-[#0E0E0D]/30 opacity-60 hover:opacity-100 hover:border-[#0E0E0D]"
              }`}
            >
              <Image
                src={imgUrl}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && currentImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 md:p-8 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[#F1EFE9]">
            <span className="font-mono text-xs text-orange tracking-widest uppercase font-bold">
              {title} — MEDIA SHOWCASE ({activeIndex + 1}/{allImages.length})
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 text-[#F1EFE9]/80 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative w-full flex-1 max-h-[80vh] my-auto flex items-center justify-center">
            <div className="relative w-full h-full max-w-5xl">
              <Image
                src={currentImage}
                alt={`${title} enlarged`}
                fill
                className="object-contain"
              />
            </div>

            {/* Prev / Next Controls */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
                  }
                  className="absolute left-4 p-3 bg-black/60 hover:bg-black text-white border border-white/20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() =>
                    setActiveIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
                  }
                  className="absolute right-4 p-3 bg-black/60 hover:bg-black text-white border border-white/20"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ArenaCoverGallery;
