import { NextRequest, NextResponse } from "next/server"
import { getDSEStocks, getDSEFundamentals } from "@/lib/services/mansaApi"

// GET /api/v1/stocks — Get latest DSE stock data from Mansa API
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const sector = searchParams.get("sector")
        const sortBy = searchParams.get("sort_by") || "marketCap"
        const order = searchParams.get("order") || "desc"

        // Fetch DSE stocks list
        const mansaStocksRes = await getDSEStocks()
        if (!mansaStocksRes || !mansaStocksRes.success || !mansaStocksRes.data) {
            throw new Error("Failed to fetch stocks from Mansa API")
        }
        const mansaStocks = mansaStocksRes.data

        // Fetch fundamentals in parallel
        const fundamentalsPromises = mansaStocks.map((s: any) =>
            getDSEFundamentals(s.ticker)
                .then(res => res && res.success ? res.data : null)
                .catch(() => null)
        )
        const fundamentalsResults = await Promise.all(fundamentalsPromises)

        // Create fundamentals lookup map
        const fundamentalsMap: Record<string, any> = {}
        fundamentalsResults.forEach((fund) => {
            if (fund && fund.ticker) {
                fundamentalsMap[fund.ticker.toUpperCase()] = fund
            }
        })

        // Map Mansa model into the StockData interface expected by client
        const mappedStocks = mansaStocks.map((s: any) => {
            const fund = fundamentalsMap[s.ticker.toUpperCase()] || {}
            return {
                symbol: s.ticker,
                name: s.name,
                price: s.price,
                change: s.change,
                changePct: s.change_pct,
                marketCap: fund.market_cap || null,
                volume: s.volume || fund.latest_volume || null,
                revenue: null,
                peRatio: fund.pe_ratio || null,
                dividendYield: fund.dividend_yield_ttm || null,
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
                dps: fund.ttm_dividend_per_share || null,
                dividendGrowth: null,
                payoutFrequency: null,
                operatingIncome: null,
                fcf: null,
                fcfPerShare: null,
                sharesOut: fund.shares_outstanding || null,
                averageVolume: null,
                beta: null,
                rsi: null,
                sector: fund.sector || "Other",
                industry: null,
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
                    last_updated: mansaStocksRes.meta?.updated_at || new Date().toISOString(),
                    sectors: sectors,
                    source: "mansa_api",
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

