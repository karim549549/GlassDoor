// TEMP: reads from a static in-memory array (see ./data.ts) - no database-backed
// companies feature exists yet.
import { COMPANIES } from "./data";
import type { Company } from "./types";

export function getDefaultCompanies(): Company[] {
  return COMPANIES.slice(0, 7);
}

export function searchCompanies(query: string): Company[] {
  const q = query.toLowerCase();
  return COMPANIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q)
  );
}

export function getCompanyById(id: number): Company | undefined {
  return COMPANIES.find((c) => c.id === id);
}
