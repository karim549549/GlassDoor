"use client";

import dynamic from "next/dynamic";
import { Image as ImageIcon } from "lucide-react";
import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import type { ContestFormInput } from "@/lib/contest/schema";
import { useCoverImageUpload } from "@/lib/contest/useCoverImageUpload";

// Only needed once a file has been selected, so it doesn't need to ship in
// the initial bundle for every visitor loading the create form.
const CropperModal = dynamic(
  () => import("@/components/profile/CropperModal").then((mod) => mod.CropperModal),
  { ssr: false }
);

interface CoverImageUploaderProps {
  register: UseFormRegister<ContestFormInput>;
  errors: FieldErrors<ContestFormInput>;
  setValue: UseFormSetValue<ContestFormInput>;
  watchCoverImageUrl: string;
}

export function CoverImageUploader({ register, errors, setValue, watchCoverImageUrl }: CoverImageUploaderProps) {
  const { isUploading, cropTarget, handleFileSelect, handleCroppedUpload, closeCropper } =
    useCoverImageUpload(setValue);

  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
        Upload Cover Image (Required)
      </label>

      <div className="border-2 border-dashed border-foreground/30 bg-secondary/20 p-5 text-center relative hover:bg-secondary/40 transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange mb-2" />
            <span className="font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
              Uploading image to storage...
            </span>
          </div>
        ) : watchCoverImageUrl ? (
          <div className="flex flex-col items-center justify-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={watchCoverImageUrl}
              alt="Uploaded cover preview"
              className="w-48 aspect-[4/1] object-cover border border-foreground/20 shadow-[2px_2px_0px_0px_#0E0E0D]"
            />
            <span className="font-mono text-[0.55rem] uppercase tracking-wider text-orange font-bold">
              [✓] IMAGE UPLOADED (CLICK TO CHANGE)
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <ImageIcon className="h-6 w-6 text-muted-foreground/40 mb-1.5" />
            <span className="font-mono text-[0.58rem] uppercase tracking-wider text-[#0E0E0D] font-bold block">
              Drag & drop image file or Click to browse
            </span>
            <span className="font-mono text-[0.48rem] uppercase tracking-widest text-muted-foreground block mt-0.5">
              PNG, JPEG, WEBP · Max 5MB
            </span>
          </div>
        )}
      </div>

      {/* Register coverImageUrl hidden input to satisfy react-hook-form schema validations */}
      <input type="hidden" {...register("coverImageUrl")} />

      {errors.coverImageUrl && (
        <span className="font-mono text-[0.6rem] text-accent tracking-wide mt-0.5">
          {errors.coverImageUrl.message}
        </span>
      )}

      {/* Cropper Modal for Event Cover Image */}
      <CropperModal
        isOpen={!!cropTarget}
        onClose={closeCropper}
        imageSrc={cropTarget}
        aspectRatio={3} // 3 represents the cover crop ratio (4:1)
        onCropComplete={handleCroppedUpload}
        isLoading={isUploading}
      />
    </div>
  );
}

export default CoverImageUploader;
