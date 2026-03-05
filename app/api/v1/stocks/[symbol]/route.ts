import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/v1/stocks/[symbol] — Fetch a single stock by symbol
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ symbol: string }> }
) {
    try {
        const { symbol } = await params
        const upperSymbol = symbol.toUpperCase()

        // Get the latest record for this symbol
        const stock = await prisma.dseStock.findFirst({
            where: { symbol: upperSymbol },
            orderBy: { scrapedAt: "desc" },
        })

        if (!stock) {
            return NextResponse.json(
                { success: false, error: `Stock '${upperSymbol}' not found` },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                symbol: stock.symbol,
                name: stock.name,
                price: stock.price,
                change: stock.change,
                changePct: stock.changePct,
                marketCap: stock.marketCap,
                volume: stock.volume,
                revenue: stock.revenue,
                peRatio: stock.peRatio,
                dividendYield: (stock as any).dividendYield,
                payoutRatio: (stock as any).payoutRatio,
                netIncome: (stock as any).netIncome,
                eps: (stock as any).eps,
                ytdChange: (stock as any).ytdChange,
                change1w: (stock as any).change1w,
                change1m: (stock as any).change1m,
                change6m: (stock as any).change6m,
                change1y: (stock as any).change1y,
                change3y: (stock as any).change3y,
                change5y: (stock as any).change5y,
                psRatio: (stock as any).psRatio,
                pbRatio: (stock as any).pbRatio,
                roe: (stock as any).roe,
                roa: (stock as any).roa,
                debtToEquity: (stock as any).debtToEquity,
                dps: (stock as any).dps,
                dividendGrowth: (stock as any).dividendGrowth,
                payoutFrequency: (stock as any).payoutFrequency,
                operatingIncome: (stock as any).operatingIncome,
                fcf: (stock as any).fcf,
                fcfPerShare: (stock as any).fcfPerShare,
                sharesOut: (stock as any).sharesOut,
                averageVolume: (stock as any).averageVolume,
                beta: (stock as any).beta,
                rsi: (stock as any).rsi,
                description: (stock as any).description,
                sector: stock.sector,
                industry: stock.industry,
                scrapedAt: stock.scrapedAt.toISOString(),
            },
        })
    } catch (error: any) {
        console.error("[STOCK DETAIL API] Error:", error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
