"use client";

import React from "react";
import { MapPin, Navigation, ExternalLink, Globe, Building2, Compass } from "lucide-react";

interface ArenaLocationSectionProps {
  locationType: "ONLINE" | "IN_PERSON" | "HYBRID";
  venueName?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  googleMapsUrl?: string | null;
  onlineJoinUrl?: string | null;
}

export function ArenaLocationSection({
  locationType,
  venueName = "Cairo Tech Innovation Hub",
  address = "124 El-Tahrir Square, Downtown",
  city = "Cairo",
  country = "Egypt",
  googleMapsUrl = "https://maps.google.com/?q=Cairo+Tech+Hub",
  onlineJoinUrl = "https://discord.gg/glassdoor-arena",
}: ArenaLocationSectionProps) {
  const isInPerson = locationType === "IN_PERSON" || locationType === "HYBRID";

  return (
    <div className="bg-white border-2 border-[#0E0E0D] shadow-[4px_4px_0px_0px_#0E0E0D] p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-[#0E0E0D]/10 pb-3">
        <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-orange font-bold">
          {isInPerson ? <MapPin className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
          <span>VENUE & LOCATION DETAILS</span>
        </div>

        <span
          className={`font-mono text-[0.52rem] font-bold uppercase px-2 py-0.5 border ${
            isInPerson
              ? "bg-[#0E0E0D] text-white border-[#0E0E0D]"
              : "bg-emerald-100 text-emerald-900 border-emerald-400"
          }`}
        >
          {locationType.replace("_", " ")}
        </span>
      </div>

      {isInPerson ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#0E0E0D]/5 border-2 border-[#0E0E0D] space-y-1">
              <span className="font-mono text-[0.5rem] uppercase tracking-widest text-[#0E0E0D]/50 font-bold block">
                VENUE NAME:
              </span>
              <h4 className="font-mono text-sm font-bold uppercase text-[#0E0E0D] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-orange" />
                {venueName}
              </h4>
            </div>

            <div className="p-4 bg-[#0E0E0D]/5 border-2 border-[#0E0E0D] space-y-1">
              <span className="font-mono text-[0.5rem] uppercase tracking-widest text-[#0E0E0D]/50 font-bold block">
                ADDRESS & CITY:
              </span>
              <p className="font-mono text-xs font-bold text-[#0E0E0D] uppercase leading-relaxed flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-orange" />
                {address}, {city}, {country}
              </p>
            </div>
          </div>

          {googleMapsUrl && (
            <div className="pt-2 flex justify-start">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 py-2.5 px-5 bg-[#0E0E0D] hover:bg-[#1f1f1d] text-[#F1EFE9] font-mono text-[0.62rem] uppercase tracking-widest font-bold border-2 border-[#0E0E0D] shadow-[3px_3px_0px_0px_#FF5722] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
              >
                <Navigation className="w-4 h-4 text-orange" />
                <span>OPEN IN GOOGLE MAPS</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/50" />
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="p-5 bg-[#0E0E0D]/5 border-2 border-[#0E0E0D] space-y-3">
          <div className="space-y-1">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#0E0E0D]">
              ONLINE VIRTUAL EVENT STAGE
            </h4>
            <p className="font-mono text-[0.55rem] text-[#0E0E0D]/60 uppercase tracking-wide">
              Join the online stage and Discord breakout rooms for event updates and team collaboration.
            </p>
          </div>

          {onlineJoinUrl && (
            <a
              href={onlineJoinUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[0.62rem] uppercase tracking-widest font-bold border-2 border-[#0E0E0D] shadow-[3px_3px_0px_0px_#0E0E0D]"
            >
              <Globe className="w-4 h-4" />
              <span>OPEN VIRTUAL STAGE / DISCORD</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/70" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default ArenaLocationSection;
