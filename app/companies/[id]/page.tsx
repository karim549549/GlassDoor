import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCompanyById } from "@/lib/companies/service";
import { Nav } from "@/components/home/Nav";
import { CompanyDetailView } from "@/components/companies/CompanyDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const companyId = parseInt(id, 10);
  const company = getCompanyById(companyId);

  if (!company) {
    return {
      title: "Company Not Found | Sherh",
    };
  }

  return {
    title: `${company.name} Salaries & Reviews | Sherh Egypt`,
    description: `Browse salary ranges, average pay rates, and community reviews for tech roles at ${company.name} in Egypt. Data transparency without HR filters.`,
  };
}

export default async function CompanyPage({ params }: PageProps) {
  const { id } = await params;
  const companyId = parseInt(id, 10);
  const company = getCompanyById(companyId);

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
        <Nav />
        <main className="flex-1">
          <CompanyDetailView company={company} />
        </main>
      </div>
    </div>
  );
}
