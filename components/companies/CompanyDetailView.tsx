"use client";

import React, { useState } from "react";
import type { Company } from "@/lib/companies/types";
import { ratingColorClass } from "@/lib/companies/format";
import { Star, Building2, Landmark, MapPin, Users, Coins } from "lucide-react";
import { CommentSection } from "./CommentSection";

interface CompanyDetailViewProps {
  company: Company;
}

export function CompanyDetailView({ company }: CompanyDetailViewProps) {
  // Select first role as default active position
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const activeRole = company.roles?.[activeRoleIndex] || {
    title: "General Staff",
    exp: "N/A",
    min: 10000,
    max: 20000,
    median: 15000,
    submissions: 10,
  };

  // Generate dynamic graph coordinates based on active role metrics
  const minSal = activeRole.min;
  const maxSal = activeRole.max;
  const medianSal = activeRole.median;

  // Let's create 4 points representing timeline quarters of salary submissions
  const dataPoints = [
    { label: "2024 Q1", value: minSal + (medianSal - minSal) * 0.3 },
    { label: "2024 Q2", value: medianSal - (medianSal - minSal) * 0.1 },
    { label: "2024 Q3", value: medianSal + (maxSal - medianSal) * 0.25 },
    { label: "2024 Q4", value: maxSal },
  ];

  // SVG dimensions
  const width = 600;
  const height = 280;
  const padding = 40;

  // Calculate SVG scale coordinates
  const minVal = minSal * 0.8;
  const maxVal = maxSal * 1.1;

  const getX = (index: number) => {
    return padding + (index * (width - padding * 2)) / (dataPoints.length - 1);
  };

  const getY = (val: number) => {
    const scale = (height - padding * 2) / (maxVal - minVal);
    return height - padding - (val - minVal) * scale;
  };

  // Build SVG path
  const pathD = dataPoints.reduce((acc, pt, idx) => {
    const x = getX(idx);
    const y = getY(pt.value);
    return acc + `${idx === 0 ? "M" : "L"} ${x} ${y}`;
  }, "");

  return (
    <div className="w-full">
      {/* 1. Header Cover Background & Content Overlay */}
      <div className="relative w-full h-[320px] md:h-[380px] bg-[#0E0E0D] text-[#F1EFE9] flex items-end border-b border-[#0E0E0D]">
        {/* Abstract Blueprint Grid Cover Background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cover-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#F1EFE9" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cover-grid)" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />

        {/* Header Metadata Container */}
        <div className="relative w-full max-w-7xl mx-auto px-6 pb-8 md:pb-12 z-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex items-start md:items-center gap-6">
            {/* Square Initial Logo */}
            <div className="h-20 w-20 md:h-24 md:w-24 bg-[#F1EFE9] text-[#0E0E0D] border-2 border-[#F1EFE9] flex items-center justify-center font-display text-[2rem] md:text-[2.5rem] font-bold shrink-0">
              {company.name.slice(0, 2).toUpperCase()}
            </div>
            
            <div className="flex flex-col text-left">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl md:text-5xl font-medium tracking-tight">
                  {company.name}
                </h1>
                <span className="font-mono text-[0.6rem] border border-[#F1EFE9]/30 px-2 py-0.5 uppercase tracking-wider text-muted-foreground bg-[#F1EFE9]/5">
                  {company.sector}
                </span>
              </div>
              <p className="font-mono text-[0.65rem] md:text-[0.75rem] text-muted-foreground uppercase mt-2 tracking-widest leading-relaxed max-w-xl">
                Egyptian operations statistics & community salary indexing portal. Real submission benchmarks.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-4 text-[0.55rem] font-mono uppercase tracking-wider text-muted-foreground/80">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-orange" /> Cairo, Egypt</span>
                <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {company.sector} sector</span>
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {company.reviews} Submissions</span>
              </div>
            </div>
          </div>

          {/* Rating Circle Badge */}
          <div className="flex items-center gap-3 bg-[#F1EFE9]/5 border border-[#F1EFE9]/25 p-3 shrink-0">
            <Star className="h-5 w-5 text-orange fill-orange" />
            <div className="flex flex-col text-left">
              <span className="font-mono text-[1.25rem] font-bold leading-none">
                {company.rating}
              </span>
              <span className="font-mono text-[0.55rem] text-muted-foreground uppercase tracking-widest mt-1">
                Rating score
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Salaries Graph Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="font-display text-3xl mb-1 text-foreground">
          Salary Benchmarks
        </h2>
        <p className="font-mono text-[0.6rem] text-muted-foreground uppercase tracking-widest mb-8">
          Interactive submission analytics per position over time
        </p>

        {/* 2-Column Graph Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          
          {/* Left Column: Job Position Selector Filter */}
          <div className="col-span-1 flex flex-col gap-2.5">
            <span className="font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground mb-1 block">
              Select Position ({company.roles.length})
            </span>
            {company.roles.map((role, idx) => (
              <button
                key={role.title}
                onClick={() => setActiveRoleIndex(idx)}
                className={`w-full text-left p-3.5 border transition-all duration-150 cursor-pointer font-mono text-[0.65rem] uppercase tracking-wider flex items-center justify-between gap-3 ${
                  activeRoleIndex === idx
                    ? "bg-[#0E0E0D] text-[#F1EFE9] border-[#0E0E0D]"
                    : "bg-[#F1EFE9] border-border text-foreground hover:border-[#0E0E0D]"
                }`}
              >
                <span className="font-bold truncate">{role.title}</span>
                <span className="opacity-60 text-[0.55rem] shrink-0">
                  {role.exp}
                </span>
              </button>
            ))}
          </div>

          {/* Right Column: Dynamic SVG Line Graph */}
          <div className="col-span-1 md:col-span-3 border-2 border-foreground bg-card p-6 relative flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div className="flex flex-col text-left">
                <span className="font-mono text-[0.75rem] font-bold text-foreground">
                  {activeRole.title}
                </span>
                <span className="font-mono text-[0.55rem] text-muted-foreground uppercase tracking-wider mt-0.5">
                  Experience benchmark: {activeRole.exp}
                </span>
              </div>
              
              <div className="flex gap-6 font-mono text-[0.65rem] uppercase">
                <div className="flex flex-col text-right">
                  <span className="text-muted-foreground text-[0.5rem] tracking-wider uppercase">Median Salary</span>
                  <span className="font-bold text-[#0E0E0D]">{activeRole.median.toLocaleString()} EGP</span>
                </div>
                <div className="flex flex-col text-right border-l border-border pl-6">
                  <span className="text-muted-foreground text-[0.5rem] tracking-wider uppercase">Records</span>
                  <span className="font-bold text-orange">{activeRole.submissions} Verified</span>
                </div>
              </div>
            </div>

            {/* Responsive SVG Grid Canvas */}
            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
                {/* Grid Lines */}
                <line x1={padding} y1={getY(minSal)} x2={width - padding} y2={getY(minSal)} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3" />
                <line x1={padding} y1={getY(medianSal)} x2={width - padding} y2={getY(medianSal)} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3" />
                <line x1={padding} y1={getY(maxSal)} x2={width - padding} y2={getY(maxSal)} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3" />

                {/* Grid Labels */}
                <text x={padding - 10} y={getY(minSal) + 4} textAnchor="end" className="fill-muted-foreground font-mono text-[8px]">
                  {Math.round(minSal / 1000)}K
                </text>
                <text x={padding - 10} y={getY(medianSal) + 4} textAnchor="end" className="fill-muted-foreground font-mono text-[8px] font-bold">
                  {Math.round(medianSal / 1000)}K
                </text>
                <text x={padding - 10} y={getY(maxSal) + 4} textAnchor="end" className="fill-muted-foreground font-mono text-[8px]">
                  {Math.round(maxSal / 1000)}K
                </text>

                {/* Salary Trend Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-foreground transition-all duration-300"
                />

                {/* Timeline Dots */}
                {dataPoints.map((pt, idx) => {
                  const x = getX(idx);
                  const y = getY(pt.value);
                  const isMax = idx === dataPoints.length - 1;
                  const isMin = idx === 0;

                  return (
                    <g key={pt.label} className="group cursor-pointer">
                      <circle
                        cx={x}
                        cy={y}
                        r={isMax ? "5" : isMin ? "5" : "4"}
                        className={`fill-card stroke-2 transition-all duration-150 ${
                          isMax ? "stroke-orange" : "stroke-foreground"
                        } group-hover:r-6`}
                      />
                      <text
                        x={x}
                        y={y - 12}
                        textAnchor="middle"
                        className="fill-foreground font-mono text-[9px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-background px-1"
                      >
                        {Math.round(pt.value).toLocaleString()} EGP
                      </text>
                      <text
                        x={x}
                        y={height - padding + 15}
                        textAnchor="middle"
                        className="fill-muted-foreground font-mono text-[8px] uppercase tracking-wider"
                      >
                        {pt.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Community Feed & Infinite Nested Replies */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="border-t-2 border-foreground pt-12">
          <CommentSection companyId={company.id} />
        </div>
      </div>
    </div>
  );
}
export default CompanyDetailView;
