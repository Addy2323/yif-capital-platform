import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDSEStock, getDSEFundamentals } from "@/lib/services/mansaApi"

const parseFloatSafe = (val: any) => {
    if (val === null || val === undefined) return null
    if (typeof val === "number") return val
    const clean = String(val).replace(/,/g, "")
    const parsed = parseFloat(clean)
    return isNaN(parsed) ? null : parsed
}

// GET /api/v1/stocks/[symbol] — Fetch a single stock by symbol from Mansa API with DB fallback
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ symbol: string }> }
) {
    try {
        const { symbol } = await params
        const upperSymbol = symbol.toUpperCase()

        // Load latest scraped data from DB to use as fallback/enrichment
        const dbStock = await prisma.dseStock.findFirst({
            where: { symbol: upperSymbol },
            orderBy: { scrapedAt: "desc" }
        })

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
            console.warn(`[STOCK DETAIL API] Mansa API failed or returned null for ${upperSymbol}. Falling back to DB data.`)
            if (!dbStock) {
                return NextResponse.json(
                    { success: false, error: `Stock '${upperSymbol}' not found` },
                    { status: 404 }
                )
            }
            stock = {
                ticker: dbStock.symbol,
                name: dbStock.name,
                price: dbStock.price,
                change: dbStock.change,
                change_pct: dbStock.changePct,
                volume: dbStock.volume,
                scraped_at: dbStock.scrapedAt.toISOString()
            }
            isFallback = true
        }

        return NextResponse.json({
            success: true,
            data: {
                symbol: stock.ticker,
                name: stock.name || dbStock?.name || "",
                price: stock.price ?? dbStock?.price ?? null,
                change: stock.change ?? dbStock?.change ?? null,
                changePct: stock.change_pct ?? dbStock?.changePct ?? null,
                marketCap: fund?.market_cap || parseFloatSafe(dbStock?.marketCap) || null,
                volume: stock.volume || fund?.latest_volume || dbStock?.volume || null,
                revenue: dbStock?.revenue ?? null,
                peRatio: fund?.pe_ratio || dbStock?.peRatio || null,
                dividendYield: fund?.dividend_yield_ttm || dbStock?.dividendYield || null,
                payoutRatio: dbStock?.payoutRatio ?? null,
                netIncome: dbStock?.netIncome ?? null,
                eps: dbStock?.eps ?? null,
                ytdChange: dbStock?.ytdChange ?? null,
                change1w: dbStock?.change1w ?? null,
                change1m: dbStock?.change1m ?? null,
                change6m: dbStock?.change6m ?? null,
                change1y: dbStock?.change1y ?? null,
                change3y: dbStock?.change3y ?? null,
                change5y: dbStock?.change5y ?? null,
                psRatio: dbStock?.psRatio ?? null,
                pbRatio: dbStock?.pbRatio ?? null,
                roe: dbStock?.roe ?? null,
                roa: dbStock?.roa ?? null,
                debtToEquity: dbStock?.debtToEquity ?? null,
                dps: fund?.ttm_dividend_per_share || dbStock?.dps || null,
                dividendGrowth: dbStock?.dividendGrowth ?? null,
                payoutFrequency: dbStock?.payoutFrequency ?? null,
                operatingIncome: dbStock?.operatingIncome ?? null,
                fcf: dbStock?.fcf ?? null,
                fcfPerShare: dbStock?.fcfPerShare ?? null,
                sharesOut: fund?.shares_outstanding || dbStock?.sharesOut || null,
                averageVolume: dbStock?.averageVolume ?? null,
                beta: dbStock?.beta ?? null,
                rsi: dbStock?.rsi ?? null,
                description: dbStock?.description ?? null,
                sector: fund?.sector || dbStock?.sector || "Other",
                industry: dbStock?.industry ?? null,
                scrapedAt: stock.scraped_at || dbStock?.scrapedAt?.toISOString() || new Date().toISOString(),
                source: isFallback ? "db_fallback" : "mansa_api",
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

