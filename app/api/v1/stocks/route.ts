import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDSEStocks, getDSEFundamentals } from "@/lib/services/mansaApi"

const parseFloatSafe = (val: any) => {
    if (val === null || val === undefined) return null
    if (typeof val === "number") return val
    const clean = String(val).replace(/,/g, "")
    const parsed = parseFloat(clean)
    return isNaN(parsed) ? null : parsed
}

// GET /api/v1/stocks — Get latest DSE stock data from Mansa API with DB fallback
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const sector = searchParams.get("sector")
        const sortBy = searchParams.get("sort_by") || "marketCap"
        const order = searchParams.get("order") || "desc"

        // Fetch DSE stocks list
        let mansaStocksRes = null
        try {
            mansaStocksRes = await getDSEStocks()
        } catch (e) {
            console.error("[STOCKS API] getDSEStocks call failed:", e)
        }

        // Load latest scraped data from DB to use as fallback/enrichment
        const dbStocks = await prisma.dseStock.findMany({
            orderBy: { scrapedAt: "desc" }
        })
        const dbStockMap: Record<string, any> = {}
        dbStocks.forEach((s) => {
            const sym = s.symbol.toUpperCase()
            if (!dbStockMap[sym]) {
                dbStockMap[sym] = s
            }
        })

        let mansaStocks = []
        let isFallback = false
        let lastUpdated = new Date().toISOString()

        if (mansaStocksRes && mansaStocksRes.success && mansaStocksRes.data && mansaStocksRes.data.length > 0) {
            mansaStocks = mansaStocksRes.data
            lastUpdated = mansaStocksRes.meta?.updated_at || lastUpdated
        } else {
            console.warn("[STOCKS API] Mansa API returned no stocks or failed. Falling back to DB stock list.")
            // Use DB stocks list as fallback
            mansaStocks = Object.values(dbStockMap).map((s: any) => ({
                ticker: s.symbol,
                name: s.name,
                price: s.price,
                change: s.change,
                change_pct: s.changePct,
                volume: s.volume,
                scraped_at: s.scrapedAt.toISOString()
            }))
            isFallback = true
        }

        // Fetch fundamentals in parallel (skip if in fallback mode)
        const fundamentalsPromises = mansaStocks.map((s: any) => {
            if (isFallback) return Promise.resolve(null)
            return getDSEFundamentals(s.ticker)
                .then(res => res && res.success ? res.data : null)
                .catch(() => null)
        })
        const fundamentalsResults = await Promise.all(fundamentalsPromises)

        // Create fundamentals lookup map
        const fundamentalsMap: Record<string, any> = {}
        fundamentalsResults.forEach((fund) => {
            if (fund && fund.ticker) {
                fundamentalsMap[fund.ticker.toUpperCase()] = fund
            }
        })

        // Map Mansa model into the StockData interface, enriching with DB data
        const mappedStocks = mansaStocks.map((s: any) => {
            const tickerUpper = s.ticker.toUpperCase()
            const fund = fundamentalsMap[tickerUpper] || {}
            const dbStock = dbStockMap[tickerUpper] || {}

            return {
                symbol: s.ticker,
                name: s.name || dbStock.name || "",
                price: s.price ?? dbStock.price ?? null,
                change: s.change ?? dbStock.change ?? null,
                changePct: s.change_pct ?? dbStock.changePct ?? null,
                marketCap: fund.market_cap || parseFloatSafe(dbStock.marketCap) || null,
                volume: s.volume || fund.latest_volume || dbStock.volume || null,
                revenue: dbStock.revenue ?? null,
                peRatio: fund.pe_ratio || dbStock.peRatio || null,
                dividendYield: fund.dividend_yield_ttm || dbStock.dividendYield || null,
                payoutRatio: dbStock.payoutRatio ?? null,
                netIncome: dbStock.netIncome ?? null,
                eps: dbStock.eps ?? null,
                ytdChange: dbStock.ytdChange ?? null,
                change1w: dbStock.change1w ?? null,
                change1m: dbStock.change1m ?? null,
                change6m: dbStock.change6m ?? null,
                change1y: dbStock.change1y ?? null,
                change3y: dbStock.change3y ?? null,
                change5y: dbStock.change5y ?? null,
                psRatio: dbStock.psRatio ?? null,
                pbRatio: dbStock.pbRatio ?? null,
                roe: dbStock.roe ?? null,
                roa: dbStock.roa ?? null,
                debtToEquity: dbStock.debtToEquity ?? null,
                dps: fund.ttm_dividend_per_share || dbStock.dps || null,
                dividendGrowth: dbStock.dividendGrowth ?? null,
                payoutFrequency: dbStock.payoutFrequency ?? null,
                operatingIncome: dbStock.operatingIncome ?? null,
                fcf: dbStock.fcf ?? null,
                fcfPerShare: dbStock.fcfPerShare ?? null,
                sharesOut: fund.shares_outstanding || dbStock.sharesOut || null,
                averageVolume: dbStock.averageVolume ?? null,
                beta: dbStock.beta ?? null,
                rsi: dbStock.rsi ?? null,
                sector: fund.sector || dbStock.sector || "Other",
                industry: dbStock.industry ?? null,
            }
        })

        // Filter by sector in-memory
        let filteredStocks = mappedStocks
        if (sector && sector.toLowerCase() !== "all") {
            filteredStocks = filteredStocks.filter(
                (s: any) => s.sector?.toLowerCase() === sector.toLowerCase()
            )
        }

        // Sort in-memory
        const validSortFields = ["price", "changePct", "marketCap", "volume", "name", "symbol"]
        const sortField = validSortFields.includes(sortBy) ? sortBy : "marketCap"

        filteredStocks.sort((a: any, b: any) => {
            const aVal = a[sortField]
            const bVal = b[sortField]

            if (aVal === null && bVal === null) return 0
            if (aVal === null) return order === "asc" ? 1 : -1
            if (bVal === null) return order === "asc" ? -1 : 1

            if (typeof aVal === "string" && typeof bVal === "string") {
                return order === "asc"
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal)
            }

            return order === "asc"
                ? (aVal as number) - (bVal as number)
                : (bVal as number) - (aVal as number)
        })

        // Extract distinct sectors
        const sectors = Array.from(
            new Set(mappedStocks.map((s: any) => s.sector).filter(Boolean))
        )

        return NextResponse.json(
            {
                success: true,
                data: filteredStocks,
                metadata: {
                    total: filteredStocks.length,
                    last_updated: lastUpdated,
                    sectors: sectors,
                    source: isFallback ? "db_fallback" : "mansa_api",
                },
            },
            {
                headers: {
                    "Cache-Control": "no-store, max-age=0",
                },
            }
        )
    } catch (error: any) {
        console.error("[STOCKS API] Error fetching stocks:", error)
        return NextResponse.json(
            { 
                success: false, 
                data: null, 
                error: "Internal Server Error",
                details: error.message 
            },
            { status: 500 }
        )
    }
}

