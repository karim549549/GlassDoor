import { useState } from "react";
import type { UseFormSetValue } from "react-hook-form";
import { useToast } from "@/components/providers/ToastProvider";
import type { ContestFormInput } from "@/lib/contest/schema";

/**
 * Owns the cover-image upload flow for the contest create form: reading the
 * locally selected file, driving the crop modal, and uploading the cropped
 * result to Supabase storage. Isolated from the form component so the crop
 * modal (and its state) only needs to live where it's rendered.
 */
export function useCoverImageUpload(setValue: UseFormSetValue<ContestFormInput>) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [cropTarget, setCropTarget] = useState<string | null>(null);

  // Read selected file locally to target state
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast("File size must be under 5MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropTarget(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload cropped blob to Supabase
  const handleCroppedUpload = async (blob: Blob) => {
    setIsUploading(true);
    setCropTarget(null); // Close cropper modal

    const file = new File([blob], "cover.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/contest/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast(data.error || "Failed to upload cover image.", "error");
      } else {
        setValue("coverImageUrl", data.url, { shouldValidate: true });
        toast("Cover image cropped and uploaded successfully!", "success");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast("Network error. Failed to upload image.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const closeCropper = () => setCropTarget(null);

  return { isUploading, cropTarget, handleFileSelect, handleCroppedUpload, closeCropper };
}
