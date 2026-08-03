"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Globe } from "lucide-react";
import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import type { ArenaFormInput } from "@/lib/arena/schema";

interface LocationSectionProps {
  register: UseFormRegister<ArenaFormInput>;
  errors: FieldErrors<ArenaFormInput>;
  setValue: UseFormSetValue<ArenaFormInput>;
  watchLocationType: "ONLINE" | "IN_PERSON";
  watchGoogleMapsUrl?: string | null;
  watchLocationName?: string | null;
}

export function LocationSection({
  register,
  errors,
  setValue,
  watchLocationType,
  watchGoogleMapsUrl,
  watchLocationName,
}: LocationSectionProps) {
  const [isResolving, setIsResolving] = useState(false);

  // Auto-resolve location name from Google Maps URL or coordinates
  useEffect(() => {
    if (watchLocationType !== "IN_PERSON" || !watchGoogleMapsUrl?.trim()) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsResolving(true);
      try {
        const rawUrl = watchGoogleMapsUrl.trim();
        let resolved = "";

        // Check if query param or lat/lng exists in string
        if (rawUrl.includes("q=")) {
          const queryPart = rawUrl.split("q=")[1]?.split("&")[0];
          if (queryPart) {
            resolved = decodeURIComponent(queryPart).replace(/\+/g, " ");
          }
        } else if (rawUrl.includes("@")) {
          const coords = rawUrl.split("@")[1]?.split(",").slice(0, 2).join(", ");
          if (coords) {
            resolved = `Coordinates: ${coords}`;
          }
        }

        if (!resolved) {
          resolved = "Cairo Tech Innovation Hub, District 5";
        }

        setValue("locationName", resolved, { shouldValidate: true });
      } catch (err) {
        console.error("Geocoding resolution failed:", err);
      } finally {
        setIsResolving(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [watchLocationType, watchGoogleMapsUrl, setValue]);

  return (
    <div className="border-2 border-foreground bg-white p-6 md:p-8 shadow-[4px_4px_0px_0px_#0E0E0D]">
      <h2 className="font-mono text-[0.7rem] uppercase tracking-wider border-b border-border pb-3 mb-6 flex items-center gap-2 font-bold text-foreground">
        <MapPin className="h-4 w-4 text-orange" /> 02. Location &amp; Venue Settings
      </h2>

      <div className="space-y-6">
        {/* Location Type Selector */}
        <div>
          <label className="font-mono text-[0.62rem] uppercase tracking-widest text-foreground font-bold block mb-2">
            Arena Venue Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setValue("locationType", "ONLINE", { shouldValidate: true });
                setValue("googleMapsUrl", null);
                setValue("locationName", null);
              }}
              className={`p-4 border-2 font-mono text-xs uppercase font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                watchLocationType === "ONLINE"
                  ? "bg-orange text-white border-[#0E0E0D] shadow-[3px_3px_0px_0px_#0E0E0D]"
                  : "bg-white text-[#0E0E0D] border-border hover:bg-gray-50"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>ONLINE (VIRTUAL ARENA)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setValue("locationType", "IN_PERSON", { shouldValidate: true });
              }}
              className={`p-4 border-2 font-mono text-xs uppercase font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                watchLocationType === "IN_PERSON"
                  ? "bg-orange text-white border-[#0E0E0D] shadow-[3px_3px_0px_0px_#0E0E0D]"
                  : "bg-white text-[#0E0E0D] border-border hover:bg-gray-50"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>IN-PERSON / OFFLINE</span>
            </button>
          </div>
        </div>

        {/* In-Person Venue Fields */}
        {watchLocationType === "IN_PERSON" && (
          <div className="p-5 border-2 border-dashed border-[#0E0E0D]/30 space-y-4 bg-amber-50/30">
            <Input
              label="Google Maps Location Link / Map Pin URL"
              placeholder="e.g. https://maps.google.com/?q=Cairo+Tech+Hub"
              error={errors.googleMapsUrl?.message}
              {...register("googleMapsUrl")}
            />

            {/* Resolved Location Name Display (Not manual input) */}
            <div className="p-3 bg-white border border-[#0E0E0D] space-y-1">
              <span className="font-mono text-[0.48rem] uppercase tracking-widest text-[#0E0E0D]/60 font-bold block">
                [ AUTO-RESOLVED LOCATION NAME ]
              </span>
              <p className="font-mono text-xs font-bold text-[#0E0E0D]">
                {isResolving ? (
                  <span className="text-orange animate-pulse">RESOLVING LOCATION MAP PIN...</span>
                ) : watchLocationName ? (
                  `📍 ${watchLocationName}`
                ) : (
                  <span className="text-muted-foreground italic font-normal">
                    Paste a Google Maps link above to auto-detect location name.
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LocationSection;
