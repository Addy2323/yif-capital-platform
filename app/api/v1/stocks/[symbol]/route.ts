import { NextRequest, NextResponse } from "next/server"
import { getDSEStock, getDSEFundamentals } from "@/lib/services/mansaApi"

// GET /api/v1/stocks/[symbol] — Fetch a single stock by symbol from Mansa API
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ symbol: string }> }
) {
    try {
        const { symbol } = await params
        const upperSymbol = symbol.toUpperCase()

        // Fetch stock data from Mansa API
        const stockRes = await getDSEStock(upperSymbol)
        if (!stockRes || !stockRes.success || !stockRes.data) {
            return NextResponse.json(
                { success: false, error: `Stock '${upperSymbol}' not found` },
                { status: 404 }
            )
        }
        const stock = stockRes.data

        // Fetch stock fundamentals from Mansa API
        const fundRes = await getDSEFundamentals(upperSymbol)
        const fund = fundRes && fundRes.success ? fundRes.data : null

        return NextResponse.json({
            success: true,
            data: {
                symbol: stock.ticker,
                name: stock.name,
                price: stock.price,
                change: stock.change,
                changePct: stock.change_pct,
                marketCap: fund?.market_cap || null,
                volume: stock.volume || fund?.latest_volume || null,
                revenue: null,
                peRatio: fund?.pe_ratio || null,
                dividendYield: fund?.dividend_yield_ttm || null,
                payoutRatio: null,
                netIncome: null,
                eps: null,
                ytdChange: null,
                change1w: null,
                change1m: null,
                change6m: null,
                change1y: null,
                change3y: null,
                change5y: null,
                psRatio: null,
                pbRatio: null,
                roe: null,
                roa: null,
                debtToEquity: null,
                dps: fund?.ttm_dividend_per_share || null,
                dividendGrowth: null,
                payoutFrequency: null,
                operatingIncome: null,
                fcf: null,
                fcfPerShare: null,
                sharesOut: fund?.shares_outstanding || null,
                averageVolume: null,
                beta: null,
                rsi: null,
                description: null,
                sector: fund?.sector || "Other",
                industry: null,
                scrapedAt: stock.scraped_at || new Date().toISOString(),
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

