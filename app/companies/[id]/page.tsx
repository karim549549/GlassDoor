import { cache } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCompanyByIdOrSlug } from "@/lib/companies/service";
import { toCompanyDto } from "@/lib/companies/dto";
import { CompanyDetailView } from "@/components/companies/CompanyDetailView";

export const revalidate = 300;

interface PageProps {
  /** The route segment is a company slug; a uuid also resolves. */
  params: Promise<{ id: string }>;
}

const loadCompany = cache(getCompanyByIdOrSlug);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const company = await loadCompany(id);

  if (!company) {
    return {
      title: "Company Not Found",
    };
  }

  return {
    title: `${company.name} — Tech Company Profile | Devs Arena`,
    description: `Explore tech stack, active coding arenas, and engineering hiring challenges at ${company.name} on Devs Arena.`,
  };
}

export default async function CompanyPage({ params }: PageProps) {
  const { id } = await params;
  const company = await loadCompany(id);

  if (!company) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden">
      {/* Editorial Blueprint Grid Background */}
      <div className="absolute inset-0 opacity-[0.085] pointer-events-none z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="company-page-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#company-page-grid)" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-1">
          <CompanyDetailView company={toCompanyDto(company)} />
        </main>
      </div>
    </div>
  );
}
