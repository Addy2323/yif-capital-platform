import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resolveFundId } from "@/lib/fund-utils"
import type { NavRecord, ApiResponse } from "@/lib/types/funds"

// GET /api/v1/funds/[fund_id]/nav - Get historical NAV data for a specific fund
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ fund_id: string }> }
) {
    try {
        const { fund_id: raw_fund_id } = await params
        const fund_id = resolveFundId(raw_fund_id)
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get("limit") || "100")

        // Find fund
        const fund = await prisma.fund.findFirst({
            where: {
                OR: [{ fundId: fund_id }, { fundSlug: fund_id }],
            },
        })

        if (!fund) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    error: "Fund not found",
                    metadata: {
                        fund_id,
                        timeframe: "1Y",
                        last_updated_at: new Date().toISOString(),
                        data_source: "cached",
                        currency: "TZS",
                    },
                },
                { status: 404 }
            )
        }

        // Get historical summary data (most recent first)
        // We aggregate by date and scheme to provide a detailed history
        const summaries = await prisma.fundDailySummary.findMany({
            where: { fundId: fund.fundId },
            orderBy: { date: "desc" },
            take: limit * 5, // Take more to account for multiple schemes per day
        })

        // Some providers/scrapers may occasionally insert header/junk rows with 0 NAV/AUM.
        // Those can dominate the "latest" selection in the UI, so filter them out.
        const validSummaries = summaries.filter((s) => {
            const nav = typeof s.nav === "number" ? s.nav : Number(s.nav)
            const aum = typeof s.aum === "number" ? s.aum : Number(s.aum)
            return nav > 0 && aum > 0
        })

        // Map to NavRecord format
        // Note: The UI expects fields date, nav_per_unit, total_nav, units
        // Since our DB stores 'nav' as price and 'aum' as total_nav, we map accordingly
        const navRecords: NavRecord[] = validSummaries.map((s) => ({
            date: s.date.toISOString().split("T")[0],
            nav_per_unit: s.nav,
            total_nav: s.aum,
            units: s.aum / (s.nav || 1), // Approximate units if not explicitly stored
            scheme_name: s.schemeName || undefined,
        }))

        // Limit to actual requested data points (distinguishing by date or including all schemes)
        // For the simple nav route, we return the records as-is
        const data = navRecords.slice(0, limit)

        const response: ApiResponse<NavRecord[]> = {
            success: true,
            data: data,
            metadata: {
                fund_id: fund.fundId,
                timeframe: "1Y",
                last_updated_at: validSummaries[0]?.date.toISOString() || new Date().toISOString(),
                data_source: "cached",
                currency: fund.baseCurrency,
            },
        }

        return NextResponse.json(response, {
            headers: { "Cache-Control": "no-store, max-age=0" },
        })
    } catch (error: any) {
        console.error(`Error fetching NAV history:`, error)
        return NextResponse.json(
            {
                success: false,
                data: null,
                error: error.message || "Failed to fetch NAV history",
                metadata: {
                    fund_id: "",
                    timeframe: "1Y",
                    last_updated_at: new Date().toISOString(),
                    data_source: "cached",
                    currency: "TZS",
                },
            },
            { status: 500 }
        )
    }
}
