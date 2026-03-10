import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { dseStocks } from "@/lib/market-data"

// GET /api/v1/stocks — Get latest DSE stock data
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const sector = searchParams.get("sector")
        const sortBy = searchParams.get("sort_by") || "marketCap"
        const order = searchParams.get("order") || "desc"

        // Try to get latest scraped data from DB
        // Get the most recent scrape date
        const latestRecord = await prisma.dseStock.findFirst({
            orderBy: { scrapedAt: "desc" },
            select: { scrapedAt: true },
        })

        if (latestRecord) {
            // Fetch all stocks from the latest scrape date
            const where: any = { scrapedAt: latestRecord.scrapedAt }
            if (sector) where.sector = sector

            // Build orderBy
            const validSortFields = ["price", "changePct", "marketCap", "volume", "name", "symbol"]
            const sortField = validSortFields.includes(sortBy) ? sortBy : "marketCap"

            const stocks = await prisma.dseStock.findMany({
                where,
                orderBy: { [sortField]: order === "asc" ? "asc" : "desc" },
            })

            // Get unique sectors for filter
            const sectors = await prisma.dseStock.findMany({
                where: { scrapedAt: latestRecord.scrapedAt },
                select: { sector: true },
                distinct: ["sector"],
            })

            return NextResponse.json(
                {
                success: true,
                data: stocks.map((s) => ({
                    symbol: s.symbol,
                    name: s.name,
                    price: s.price,
                    change: s.change,
                    changePct: s.changePct,
                    marketCap: s.marketCap,
                    volume: s.volume,
                    revenue: s.revenue,
                    peRatio: (s as any).peRatio,
                    dividendYield: (s as any).dividendYield,
                    payoutRatio: (s as any).payoutRatio,
                    netIncome: (s as any).netIncome,
                    eps: (s as any).eps,
                    ytdChange: (s as any).ytdChange,
                    change1w: (s as any).change1w,
                    change1m: (s as any).change1m,
                    change6m: (s as any).change6m,
                    change1y: (s as any).change1y,
                    change3y: (s as any).change3y,
                    change5y: (s as any).change5y,
                    psRatio: (s as any).psRatio,
                    pbRatio: (s as any).pbRatio,
                    roe: (s as any).roe,
                    roa: (s as any).roa,
                    debtToEquity: (s as any).debtToEquity,
                    dps: (s as any).dps,
                    dividendGrowth: (s as any).dividendGrowth,
                    payoutFrequency: (s as any).payoutFrequency,
                    operatingIncome: (s as any).operatingIncome,
                    fcf: (s as any).fcf,
                    fcfPerShare: (s as any).fcfPerShare,
                    sharesOut: (s as any).sharesOut,
                    averageVolume: (s as any).averageVolume,
                    beta: (s as any).beta,
                    rsi: (s as any).rsi,
                    sector: s.sector,
                    industry: s.industry,
                })),
                metadata: {
                    total: stocks.length,
                    last_updated: latestRecord.scrapedAt.toISOString(),
                    sectors: sectors.map((s) => s.sector).filter(Boolean),
                    source: "database",
                },
            },
                {
                    headers: {
                        "Cache-Control": "no-store, max-age=0",
                    },
                }
            )
        }

        // Fallback to mock data if no DB records
        let filteredStocks = [...dseStocks]
        if (sector) {
            filteredStocks = filteredStocks.filter(
                (s) => s.sector.toLowerCase() === sector.toLowerCase()
            )
        }

        // Sort
        filteredStocks.sort((a, b) => {
            const aVal = (a as any)[sortBy] || 0
            const bVal = (b as any)[sortBy] || 0
            return order === "asc" ? aVal - bVal : bVal - aVal
        })

        return NextResponse.json({
            success: true,
            data: filteredStocks.map((s) => ({
                symbol: s.symbol,
                name: s.name,
                price: s.price,
                change: s.change,
                changePct: s.changePercent,
                marketCap: s.marketCap,
                volume: s.volume,
                revenue: null,
                sector: s.sector,
                industry: s.industry,
            })),
            metadata: {
                total: filteredStocks.length,
                last_updated: new Date().toISOString(),
                sectors: [...new Set(dseStocks.map((s) => s.sector))],
                source: "mock",
            },
        })
    } catch (error: any) {
        console.error("[STOCKS API] Error fetching stocks:", error)
        return NextResponse.json(
            { success: false, data: null, error: error.message },
            { status: 500 }
        )
    }
}
