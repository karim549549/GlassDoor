"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";

interface CropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  aspectRatio: number; // 1 for avatar, 3 for cover
  onCropComplete: (croppedBlob: Blob) => void;
  isLoading?: boolean;
}

export function CropperModal({
  isOpen,
  onClose,
  imageSrc,
  aspectRatio,
  onCropComplete,
  isLoading = false,
}: CropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgLayout, setImgLayout] = useState({ width: 0, height: 0 });

  // Reset states on image source change
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [imageSrc, isOpen]);

  if (!imageSrc) return null;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const viewport = viewportRef.current;
    if (!viewport) return;

    const vWidth = viewport.clientWidth;
    const vHeight = viewport.clientHeight;

    // Calculate initial dimensions to cover the viewport
    const vAspect = vWidth / vHeight;
    const imgAspect = img.naturalWidth / img.naturalHeight;

    let w = 0;
    let h = 0;

    if (imgAspect > vAspect) {
      // Image is wider than viewport -> fit height, let width overflow
      h = vHeight;
      w = vHeight * imgAspect;
    } else {
      // Image is taller than viewport -> fit width, let height overflow
      w = vWidth;
      h = w / imgAspect;
    }

    setImgLayout({ width: w, height: h });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Support for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX - offset.x, y: touch.clientY - offset.y };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.current.x,
      y: touch.clientY - dragStart.current.y,
    });
  };

  const handleCrop = () => {
    const img = imgRef.current;
    const viewport = viewportRef.current;
    if (!img || !viewport) return;

    const vWidth = viewport.clientWidth;
    const vHeight = viewport.clientHeight;

    // Output target sizing
    const targetWidth = aspectRatio === 1 ? 400 : 1600;
    const targetHeight = aspectRatio === 1 ? 400 : 400;

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Fill background black in case image is offset too far
    ctx.fillStyle = "#0E0E0D";
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Apply matrix transformations matching viewport view
    ctx.translate(targetWidth / 2, targetHeight / 2);

    const scaleX = targetWidth / vWidth;
    const scaleY = targetHeight / vHeight;
    ctx.translate(offset.x * scaleX, offset.y * scaleY);

    const drawWidth = imgLayout.width * zoom * scaleX;
    const drawHeight = imgLayout.height * zoom * scaleY;

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-6 bg-[#F1EFE9] border border-[#0E0E0D] rounded-none shadow-2xl font-mono text-[0.65rem] uppercase tracking-wider text-[#0E0E0D] z-50">
        <div className="space-y-5">
          <div>
            <h3 className="font-display text-[1.1rem] italic lowercase first-letter:uppercase font-bold tracking-tight text-[#0E0E0D]">
              Reposition and crop image
            </h3>
            <p className="font-sans text-[0.58rem] text-muted-foreground leading-normal mt-1 lowercase first-letter:uppercase">
              Drag the image to position it. Use the slider to zoom in or out.
            </p>
          </div>

          {/* Viewport Frame */}
          <div
            ref={viewportRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className={`w-full overflow-hidden relative border border-[#0E0E0D]/65 bg-[#0E0E0D]/10 cursor-move ${
              aspectRatio === 1 ? "aspect-square max-w-[320px] mx-auto" : "aspect-[4/1]"
            }`}
          >
            <Image
              ref={imgRef}
              src={imageSrc}
              alt="Crop target"
              onLoad={handleImageLoad}
              unoptimized
              width={imgLayout.width || 1}
              height={imgLayout.height || 1}
              className="absolute select-none pointer-events-none origin-center"
              style={{
                width: imgLayout.width ? `${imgLayout.width}px` : "auto",
                height: imgLayout.height ? `${imgLayout.height}px` : "auto",
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                top: "50%",
                left: "50%",
                maxWidth: "none",
              }}
            />

            {/* Stark brutalist crosshair lines */}
            <div className="absolute inset-0 pointer-events-none border border-dashed border-[#F1EFE9]/25 flex items-center justify-center">
              <span className="w-4 h-px bg-[#F1EFE9]/40 absolute" />
              <span className="h-4 w-px bg-[#F1EFE9]/40 absolute" />
            </div>
          </div>

          {/* Zoom Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[0.55rem]">
              <span>Zoom</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-orange cursor-pointer bg-[#0E0E0D]/15 h-1 border-none focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleCrop}
              isLoading={isLoading}
              className="w-full"
            >
              Save Crop
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
