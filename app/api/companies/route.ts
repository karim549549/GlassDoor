import { NextResponse, type NextRequest } from "next/server";
import { companyListQuerySchema } from "@/lib/companies/schema";
import { listCompanies } from "@/lib/companies/service";
import { toCompanyDto } from "@/lib/companies/dto";
import { withApiErrorHandling } from "@/lib/server/api-route";

export async function GET(request: NextRequest) {
  return withApiErrorHandling(
    "Company list API error",
    async () => {
      const { searchParams } = new URL(request.url);
      const parsed = companyListQuerySchema.safeParse(Object.fromEntries(searchParams));
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid query parameters.", details: parsed.error.format() },
          { status: 400 }
        );
      }

      const { companies, total } = await listCompanies(parsed.data);

      return NextResponse.json({
        companies: companies.map(toCompanyDto),
        total,
      });
    },
    "Failed to fetch companies."
  );
}
