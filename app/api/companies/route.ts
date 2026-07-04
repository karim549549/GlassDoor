import { type NextRequest } from "next/server";
import { getDefaultCompanies, searchCompanies } from "@/lib/companies/service";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  return Response.json(q ? searchCompanies(q) : getDefaultCompanies());
}
