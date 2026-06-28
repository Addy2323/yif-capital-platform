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
        let stockRes = null
        try {
            stockRes = await getDSEStock(upperSymbol)
        } catch (e) {
            console.error(`[STOCK DETAIL API] getDSEStock call failed for ${upperSymbol}:`, e)
        }

        let stock = null
        let fund = null
        let isFallback = false

        if (stockRes && stockRes.success && stockRes.data) {
            stock = stockRes.data
            // Fetch fundamentals from Mansa API
            const fundRes = await getDSEFundamentals(upperSymbol)
            fund = fundRes && fundRes.success ? fundRes.data : null
        } else {
            console.warn(`[STOCK DETAIL API] Mansa API failed or returned null for ${upperSymbol}. Falling back to mock data.`)
            const { dseStocks } = await import("@/lib/market-data")
            const mock = dseStocks.find(s => s.symbol.toUpperCase() === upperSymbol)
            if (!mock) {
                return NextResponse.json(
                    { success: false, error: `Stock '${upperSymbol}' not found` },
                    { status: 404 }
                )
            }
            stock = {
                ticker: mock.symbol,
                name: mock.name,
                price: mock.price,
                change: mock.change,
                change_pct: mock.changePercent,
                volume: mock.volume,
                scraped_at: new Date().toISOString()
            }
            fund = {
                market_cap: mock.marketCap,
                sector: mock.sector,
                industry: mock.industry
            }
            isFallback = true
        }

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
                source: isFallback ? "mock_fallback" : "mansa_api",
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

