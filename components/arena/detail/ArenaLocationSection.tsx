"use client";

import React from "react";
import { MapPin, Navigation, ExternalLink, Globe, Building2 } from "lucide-react";

interface ArenaLocationSectionProps {
  locationType: "ONLINE" | "IN_PERSON" | "HYBRID";
  venueName?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  googleMapsUrl?: string | null;
  googleMapsEmbedUrl?: string | null;
  onlineJoinUrl?: string | null;
}

export function ArenaLocationSection({
  locationType,
  venueName = "Cairo Tech Innovation Hub",
  address = "124 El-Tahrir Square, Downtown",
  city = "Cairo",
  country = "Egypt",
  googleMapsUrl = "https://maps.google.com/?q=Cairo+Tech+Hub",
  googleMapsEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3453.513470438189!2d31.233333!3d30.044444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145840c436329a1b%3A0xb35a0f670f215034!2sTahrir%20Square!5e0!3m2!1sen!2seg!4v1680000000000!5m2!1sen!2seg",
  onlineJoinUrl = "https://discord.gg/glassdoor-arena",
}: ArenaLocationSectionProps) {
  const isInPerson = locationType === "IN_PERSON" || locationType === "HYBRID";

  return (
    <div className="bg-white border-2 border-[#0E0E0D] shadow-[4px_4px_0px_0px_#0E0E0D] p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-[#0E0E0D]/10 pb-3">
        <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-orange font-bold">
          {isInPerson ? <MapPin className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
          <span>ARENA VENUE & LOCATION ({locationType.replace("_", " ")})</span>
        </div>

        <span
          className={`font-mono text-[0.52rem] font-bold uppercase px-2 py-0.5 border ${
            isInPerson
              ? "bg-[#0E0E0D] text-white border-[#0E0E0D]"
              : "bg-emerald-100 text-emerald-900 border-emerald-400"
          }`}
        >
          {locationType === "IN_PERSON"
            ? "IN-PERSON VENUE"
            : locationType === "HYBRID"
            ? "HYBRID (IN-PERSON + ONLINE)"
            : "ONLINE VIRTUAL EVENT"}
        </span>
      </div>

      {isInPerson ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left: Location Specs & Address Info (5/12) */}
          <div className="md:col-span-5 space-y-4">
            <div className="space-y-1">
              <span className="font-mono text-[0.5rem] uppercase tracking-widest text-[#0E0E0D]/50 font-bold block">
                VENUE NAME:
              </span>
              <h4 className="font-mono text-sm font-bold uppercase text-[#0E0E0D] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-orange" />
                {venueName}
              </h4>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[0.5rem] uppercase tracking-widest text-[#0E0E0D]/50 font-bold block">
                ADDRESS & CITY:
              </span>
              <p className="font-mono text-xs text-[#0E0E0D]/80 uppercase leading-relaxed">
                {address}, {city}, {country}
              </p>
            </div>

            <div className="pt-2">
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 py-2 px-4 bg-[#0E0E0D] hover:bg-[#1f1f1d] text-[#F1EFE9] font-mono text-[0.6rem] uppercase tracking-widest font-bold border border-[#0E0E0D] shadow-[2px_2px_0px_0px_#FF5722] transition-all"
                >
                  <Navigation className="w-3.5 h-3.5 text-orange" />
                  <span>OPEN IN GOOGLE MAPS</span>
                  <ExternalLink className="w-3 h-3 text-white/50" />
                </a>
              )}
            </div>
          </div>

          {/* Right: Embedded Interactive Google Map (7/12) */}
          <div className="md:col-span-7">
            <div className="relative w-full aspect-[16/10] bg-[#0E0E0D] border-2 border-[#0E0E0D] shadow-[4px_4px_0px_0px_#0E0E0D] overflow-hidden">
              {googleMapsEmbedUrl ? (
                <iframe
                  title="Google Maps Location"
                  src={googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full filter grayscale contrast-125 opacity-90 hover:grayscale-0 transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-6 text-center font-mono text-xs text-[#F1EFE9]/60 uppercase tracking-widest">
                  [MAP EMBED PREVIEW]
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Online Virtual Event Access Box */
        <div className="p-5 bg-[#0E0E0D]/5 border-2 border-[#0E0E0D] space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#0E0E0D]">
                VIRTUAL EVENT STAGE & DISCORD
              </h4>
              <p className="font-mono text-[0.55rem] text-[#0E0E0D]/60 uppercase tracking-wide mt-0.5">
                Join the official livestream stage and team breakout voice rooms online.
              </p>
            </div>
          </div>

          {onlineJoinUrl && (
            <a
              href={onlineJoinUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[0.6rem] uppercase tracking-widest font-bold border border-[#0E0E0D] shadow-[2px_2px_0px_0px_#0E0E0D]"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>JOIN VIRTUAL DISCORD STAGE</span>
              <ExternalLink className="w-3 h-3 text-white/70" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default ArenaLocationSection;
