"use client";

import { useState, useRef } from "react";
import { Search, ArrowRight } from "lucide-react";

const ORANGE = "#E8621A";
const RED = "#C11A1A";

interface Role {
  title: string;
  exp: string;
  min: number;
  max: number;
  median: number;
  submissions: number;
}

interface Company {
  id: number;
  name: string;
  sector: string;
  rating: number;
  reviews: number;
  roles: Role[];
}

const COMPANIES: Company[] = [
  { id: 1, name: "Vodafone Egypt", sector: "Telecom", rating: 3.4, reviews: 1240, roles: [
    { title: "Backend Engineer", exp: "2 yrs", min: 18000, max: 28000, median: 23000, submissions: 47 },
    { title: "Frontend Developer", exp: "2 yrs", min: 15000, max: 24000, median: 19500, submissions: 31 },
    { title: "DevOps Engineer", exp: "3 yrs", min: 22000, max: 32000, median: 27000, submissions: 18 },
    { title: "Data Analyst", exp: "1 yr", min: 12000, max: 18000, median: 15000, submissions: 24 },
  ]},
  { id: 2, name: "Raya Contact", sector: "BPO / Tech", rating: 2.8, reviews: 892, roles: [
    { title: "Backend Engineer", exp: "3 yrs", min: 22000, max: 30000, median: 26000, submissions: 38 },
    { title: "DevOps Engineer", exp: "2 yrs", min: 20000, max: 27000, median: 23500, submissions: 15 },
    { title: "QA Engineer", exp: "1 yr", min: 12000, max: 17000, median: 14500, submissions: 22 },
  ]},
  { id: 3, name: "Instabug", sector: "Product / SaaS", rating: 4.2, reviews: 310, roles: [
    { title: "Frontend Developer", exp: "2 yrs", min: 20000, max: 28000, median: 24000, submissions: 19 },
    { title: "Backend Engineer", exp: "3 yrs", min: 28000, max: 38000, median: 33000, submissions: 26 },
    { title: "Mobile Developer", exp: "2 yrs", min: 22000, max: 30000, median: 26000, submissions: 11 },
  ]},
  { id: 4, name: "Amazon Egypt", sector: "Big Tech", rating: 4.0, reviews: 215, roles: [
    { title: "SWE L4", exp: "4 yrs", min: 45000, max: 65000, median: 55000, submissions: 14 },
    { title: "SDE I", exp: "0-1 yr", min: 30000, max: 40000, median: 35000, submissions: 9 },
    { title: "Data Scientist", exp: "3 yrs", min: 38000, max: 55000, median: 46000, submissions: 7 },
  ]},
  { id: 5, name: "Paymob", sector: "Fintech", rating: 3.6, reviews: 441, roles: [
    { title: "Mobile Developer", exp: "2 yrs", min: 22000, max: 30000, median: 26000, submissions: 28 },
    { title: "Backend Engineer", exp: "1 yr", min: 18000, max: 24000, median: 21000, submissions: 34 },
    { title: "Frontend Developer", exp: "2 yrs", min: 17000, max: 23000, median: 20000, submissions: 19 },
  ]},
  { id: 6, name: "PwC Egypt", sector: "Consulting", rating: 3.1, reviews: 678, roles: [
    { title: "BI Developer", exp: "3 yrs", min: 18000, max: 24000, median: 21000, submissions: 33 },
    { title: "Tech Analyst", exp: "1 yr", min: 12000, max: 16000, median: 14000, submissions: 41 },
    { title: "Data Engineer", exp: "2 yrs", min: 16000, max: 22000, median: 19000, submissions: 17 },
  ]},
  { id: 7, name: "Fawry", sector: "Fintech", rating: 3.3, reviews: 523, roles: [
    { title: "Backend Engineer", exp: "2 yrs", min: 18000, max: 26000, median: 22000, submissions: 41 },
    { title: "QA Engineer", exp: "2 yrs", min: 13000, max: 18000, median: 15500, submissions: 26 },
    { title: "Mobile Developer", exp: "3 yrs", min: 22000, max: 30000, median: 26000, submissions: 14 },
  ]},
  { id: 8, name: "Swvl", sector: "Transport Tech", rating: 3.8, reviews: 189, roles: [
    { title: "Backend Engineer", exp: "3 yrs", min: 30000, max: 42000, median: 36000, submissions: 12 },
    { title: "Frontend Developer", exp: "2 yrs", min: 24000, max: 32000, median: 28000, submissions: 8 },
  ]},
  { id: 9, name: "Orange Egypt", sector: "Telecom", rating: 3.2, reviews: 891, roles: [
    { title: "Backend Engineer", exp: "2 yrs", min: 16000, max: 24000, median: 20000, submissions: 39 },
    { title: "Network Engineer", exp: "3 yrs", min: 18000, max: 26000, median: 22000, submissions: 28 },
  ]},
  { id: 10, name: "Breadfast", sector: "E-commerce", rating: 3.9, reviews: 234, roles: [
    { title: "Backend Engineer", exp: "2 yrs", min: 20000, max: 28000, median: 24000, submissions: 21 },
    { title: "Frontend Developer", exp: "1 yr", min: 16000, max: 22000, median: 19000, submissions: 13 },
  ]},
];

function fmt(n: number) {
  return n.toLocaleString("en-EG");
}

function ratingColor(r: number) {
  if (r >= 4.0) return "#1A7A3A";
  if (r >= 3.5) return "#C47A00";
  return RED;
}

function SalaryBar({ min, max, median }: { min: number; max: number; median: number }) {
  const LO = 8000, HI = 70000;
  const p = (v: number) => Math.max(0, Math.min(100, ((v - LO) / (HI - LO)) * 100));
  return (
    <div>
      <div className="relative h-1.5 bg-secondary rounded-full">
        <div
          className="absolute h-full rounded-full"
          style={{ left: `${p(min)}%`, width: `${p(max) - p(min)}%`, backgroundColor: "var(--foreground)", opacity: 0.7 }}
        />
        <div
          className="absolute w-px h-4 -top-1.5 rounded-full"
          style={{ left: `${p(median)}%`, backgroundColor: RED }}
        />
      </div>
      <div className="flex justify-between mt-1.5" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem" }}>
        <span className="text-muted-foreground">{fmt(min)}</span>
        <span style={{ color: RED }}>median: {fmt(median)}</span>
        <span className="text-muted-foreground">{fmt(max)} EGP/mo</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdown] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [roleIdx, setRoleIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered =
    query.trim().length > 0
      ? COMPANIES.filter(
          (c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.sector.toLowerCase().includes(query.toLowerCase())
        )
      : COMPANIES.slice(0, 7);

  function selectCompany(c: Company) {
    setCompany(c);
    setRoleIdx(0);
    setQuery(c.name);
    setDropdown(false);
  }

  function clearSearch() {
    setQuery("");
    setCompany(null);
    setDropdown(true);
    inputRef.current?.focus();
  }

  const role = company?.roles[roleIdx];

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "var(--font-body)" }}>

      <nav className="sticky top-0 z-50 bg-foreground text-primary-foreground">
        <div className="px-6 h-11 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>Sherh</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: ORANGE }} className="tracking-[0.2em]">
              شرح
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem" }} className="opacity-35 border-l border-primary-foreground/20 pl-3 hidden sm:block">
              Egypt tech · salary transparency
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem" }} className="opacity-55 hover:opacity-100 transition-opacity hidden sm:block uppercase tracking-wider">
              Companies
            </a>
            <a href="#" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem" }} className="opacity-55 hover:opacity-100 transition-opacity hidden sm:block uppercase tracking-wider">
              Reviews
            </a>
            <button style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem" }} className="border border-primary-foreground/25 px-3 py-1.5 hover:bg-primary-foreground hover:text-foreground transition-colors uppercase tracking-wider">
              Submit salary
            </button>
          </div>
        </div>
      </nav>

      <div className="bg-secondary border-b border-border">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem" }} className="px-6 py-1.5 text-muted-foreground flex flex-wrap items-center gap-4 sm:gap-6">
          <span>Last updated: Today, 14:32 EET</span>
          <span className="opacity-30">·</span>
          <span>4,200+ salary records indexed</span>
          <span className="opacity-30">·</span>
          <span className="hidden sm:block">No HR filters. No PR review.</span>
        </div>
      </div>

      <section
        className="relative overflow-hidden border-b border-border bg-background"
        style={{ height: "calc(100svh - 88px)", minHeight: 680, maxHeight: 960 }}
      >
        <div
          className="absolute top-0 left-0 right-0 border-b border-border flex items-center justify-between"
          style={{ paddingLeft: "clamp(1.25rem, 3vw, 2.5rem)", paddingRight: "clamp(1.25rem, 3vw, 2.5rem)", paddingTop: "clamp(0.5rem, 1.5vh, 1.125rem)", paddingBottom: "clamp(0.4rem, 1.2vh, 0.875rem)" }}
        >
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(0.5rem, 0.8vw, 0.65rem)" }} className="uppercase tracking-widest text-muted-foreground leading-relaxed">
            Issue<br className="hidden sm:block" /> 001<br className="hidden sm:block" />Cairo
          </div>

          <h1
            className="select-none"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(4rem, 13.5vw, 11.5rem)", lineHeight: 0.88, letterSpacing: "-0.015em" }}
          >
            Sherh
          </h1>

          <div style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(0.5rem, 0.8vw, 0.65rem)" }} className="uppercase tracking-widest text-right leading-relaxed">
            <div style={{ color: ORANGE }}>شرح</div>
            <div className="text-muted-foreground mt-1">2024</div>
          </div>
        </div>

        <div
          className="absolute border border-border px-2 py-1.5 hidden sm:block"
          style={{ top: "clamp(130px, 24%, 220px)", left: "clamp(1rem, 3vw, 2.5rem)" }}
        >
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(0.45rem, 0.6vw, 0.55rem)" }} className="uppercase tracking-[0.22em] text-muted-foreground leading-relaxed">
            No. 1 salary<br />database in Egypt
          </div>
        </div>

        <div
          className="absolute text-right hidden sm:block"
          style={{ top: "clamp(116px, 21%, 200px)", right: "clamp(1rem, 3vw, 2.5rem)" }}
        >
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(2rem, 3.8vw, 3.5rem)", fontWeight: 500, lineHeight: 1 }}>
            312
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(0.45rem, 0.6vw, 0.55rem)" }} className="uppercase tracking-[0.18em] text-muted-foreground mt-1">
            Companies<br />Indexed
          </div>
        </div>

        <div
          className="absolute hidden lg:block"
          style={{ top: "38%", left: "clamp(1rem, 2.5vw, 2rem)", maxWidth: "clamp(120px, 13vw, 170px)" }}
        >
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: ORANGE, letterSpacing: "0.18em" }} className="uppercase mb-1">
            Exclusive
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(0.85rem, 1.1vw, 1.05rem)", lineHeight: 1.25, fontStyle: "italic" }}>
            Vodafone Egypt: The full salary picture
          </div>
        </div>

        <div
          className="absolute border-2 border-foreground text-center hidden md:block"
          style={{ top: "34%", right: "clamp(1rem, 2.5vw, 2rem)", padding: "clamp(0.5rem, 1vw, 0.875rem) clamp(0.75rem, 1.5vw, 1.25rem)" }}
        >
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem" }} className="uppercase tracking-[0.22em] text-muted-foreground">
            Verified by
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(1.5rem, 2.2vw, 2rem)", fontWeight: 500, lineHeight: 1.1, color: ORANGE }}>
            4,200+
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem" }} className="uppercase tracking-[0.18em] text-muted-foreground">
            Egyptian<br />engineers
          </div>
        </div>

        <div
          className="absolute hidden lg:block"
          style={{ bottom: "clamp(110px, 23%, 205px)", left: "clamp(1rem, 3vw, 2.5rem)" }}
        >
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: ORANGE, letterSpacing: "0.2em" }} className="uppercase mb-0.5">
            Featured
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "clamp(0.75rem, 0.95vw, 0.9rem)", lineHeight: 1.3, maxWidth: 155 }}>
            Backend salaries up 12% since Q1 2024
          </div>
        </div>

        <div
          className="absolute text-right hidden md:block"
          style={{ bottom: "clamp(60px, 12%, 115px)", right: "clamp(1rem, 3vw, 2.5rem)" }}
        >
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(0.45rem, 0.6vw, 0.55rem)" }} className="uppercase tracking-[0.2em] text-muted-foreground leading-[2.2]">
            <div>Anonymous submissions</div>
            <div>No account needed</div>
            <div>Free forever</div>
          </div>
        </div>

        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: "40%", width: "min(560px, 68%)", zIndex: 20 }}
        >
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem" }} className="uppercase tracking-[0.2em] text-muted-foreground mb-2 text-center">
            — search any Egyptian tech company —
          </div>

          <div className="relative">
            <div className="flex items-center border-2 border-foreground bg-card focus-within:border-accent transition-colors">
              <Search className="w-4 h-4 mx-4 text-muted-foreground flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setDropdown(true); }}
                onFocus={() => setDropdown(true)}
                onBlur={() => setTimeout(() => setDropdown(false), 150)}
                placeholder="Vodafone, PwC, Instabug, Amazon..."
                className="flex-1 py-4 pr-4 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                style={{ fontSize: "clamp(0.875rem, 1.1vw, 1rem)" }}
              />
              {query && (
                <button
                  onMouseDown={clearSearch}
                  className="px-4 text-xl text-muted-foreground hover:text-foreground transition-colors leading-none"
                >
                  ×
                </button>
              )}
            </div>

            {dropdownOpen && filtered.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 bg-card border-x-2 border-b-2 border-foreground shadow-2xl">
                {filtered.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    onMouseDown={() => selectCompany(c)}
                    className="w-full text-left px-4 py-3 hover:bg-secondary flex items-center justify-between border-b border-border last:border-0 transition-colors"
                    style={{ fontSize: "0.875rem" }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem" }}>
                        {c.sector}
                      </span>
                    </div>
                    <span className="font-medium" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: ratingColor(c.rating) }}>
                      {c.rating}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {company && !dropdownOpen && (
            <div className="mt-2 bg-card border border-border">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
                <div className="min-w-0">
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1rem, 1.4vw, 1.25rem)", lineHeight: 1.1 }} className="truncate">
                    {company.name}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem" }} className="text-muted-foreground uppercase tracking-wider mt-0.5">
                    {company.sector}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.625rem", fontWeight: 500, lineHeight: 1, color: ratingColor(company.rating) }}>
                    {company.rating}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem" }} className="text-muted-foreground">
                    {company.reviews.toLocaleString()} reviews
                  </div>
                </div>
              </div>

              <div className="px-4 pt-3 pb-3">
                <div className="flex gap-1.5 mb-2.5 flex-wrap">
                  {company.roles.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => setRoleIdx(i)}
                      className={i === roleIdx ? "px-2 py-0.5 border transition-all bg-foreground text-primary-foreground border-foreground" : "px-2 py-0.5 border transition-all border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"}
                      style={{ fontSize: "0.7rem" }}
                    >
                      {r.title}
                    </button>
                  ))}
                </div>

                {role && (
                  <div className="bg-secondary/50 px-3 py-2.5">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="font-medium" style={{ fontSize: "0.8125rem" }}>
                        {role.title}
                      </span>
                      <span className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem" }}>
                        {role.exp} - {role.submissions} submissions
                      </span>
                    </div>
                    <SalaryBar min={role.min} max={role.max} median={role.median} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className="absolute"
          style={{ bottom: "clamp(1.25rem, 5%, 3.5rem)", left: "clamp(1rem, 3vw, 2.5rem)", maxWidth: "clamp(260px, 46%, 520px)" }}
        >
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4.8vw, 4.25rem)", lineHeight: 0.95 }}>
            Stop asking <span style={{ color: ORANGE }}>Facebook.</span>
          </div>

          <div
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "clamp(0.8rem, 1.3vw, 1.1rem)", lineHeight: 1.35, marginTop: "clamp(0.35rem, 0.8vh, 0.625rem)" }}
            className="text-muted-foreground"
          >
            Real salaries. Real reviews. Every Egyptian tech company, indexed.
          </div>
        </div>
      </section>

      <div className="bg-foreground text-primary-foreground border-b border-foreground">
        <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { value: "4,200+", label: "salary submissions" },
            { value: "312", label: "companies indexed" },
            { value: "18", label: "sectors covered" },
            { value: "Daily", label: "data updates" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(1.25rem, 2vw, 1.75rem)", fontWeight: 500, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem" }} className="opacity-45 uppercase tracking-wider mt-1.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="px-6 py-12">
        <div className="bg-foreground text-primary-foreground p-7 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center max-w-5xl">
          <div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem" }} className="uppercase tracking-[0.22em] opacity-38 mb-4">
              Contribute
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.625rem, 3vw, 2.75rem)", lineHeight: 1.08 }}>
              Know what you&rsquo;re worth.<br />
              <em>Help the next person know too.</em>
            </h2>
            <p className="opacity-55 leading-relaxed mt-4" style={{ fontSize: "0.875rem" }}>
              Takes 2 minutes. Completely anonymous. The database only grows if
              engineers add to it - the same people posting &ldquo;does anyone know what
              X pays?&rdquo; on Facebook can fix this problem.
            </p>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between border border-primary-foreground/25 px-5 py-3.5 hover:bg-primary-foreground hover:text-foreground transition-colors group">
              <span className="text-sm font-medium">Submit your salary</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full flex items-center justify-between border border-primary-foreground/25 px-5 py-3 hover:bg-primary-foreground hover:text-foreground transition-colors group opacity-65 hover:opacity-100">
              <span className="text-sm">Write a company review</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-secondary">
        <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: "var(--font-display)" }} className="font-medium">
              Sherh شرح
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem" }} className="text-muted-foreground">
              Egypt tech salary transparency - 2024
            </span>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem" }} className="flex gap-6 text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Submit data</a>
            <a href="#" className="hover:text-foreground transition-colors">API</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
