import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/stocks/update — Receive scraped DSE stock data
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { stocks } = body

        if (!stocks || !Array.isArray(stocks)) {
            return NextResponse.json(
                { success: false, error: "Invalid data format — need {stocks: []}" },
                { status: 400 }
            )
        }

        console.log(`[STOCKS API] Receiving ${stocks.length} stock records`)

        // Use UTC date so "sync date" is consistent regardless of server timezone (fixes LIVE SYNC showing wrong day)
        const now = new Date()
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))

        let successCount = 0
        let errorCount = 0

        for (const stock of stocks) {
            try {
                await prisma.dseStock.upsert({
                    where: {
                        symbol_scrapedAt: {
                            symbol: stock.symbol,
                            scrapedAt: today,
                        },
                    },
                    update: {
                        name: stock.name,
                        price: stock.price || 0,
                        change: stock.change || 0,
                        changePct: stock.change_pct || 0,
                        marketCap: stock.market_cap || null,
                        volume: stock.volume ? Math.floor(stock.volume) : null,
                        revenue: stock.revenue || null,
                        peRatio: stock.pe_ratio,
                        dividendYield: stock.dividend_yield,
                        payoutRatio: stock.payout_ratio,
                        netIncome: stock.net_income,
                        eps: stock.eps,
                        ytdChange: stock.ytd_change,
                        change1w: stock.change_1w,
                        change1m: stock.change_1m,
                        change6m: stock.change_6m,
                        change1y: stock.change_1y,
                        change3y: stock.change_3y,
                        change5y: stock.change_5y,
                        psRatio: stock.ps_ratio,
                        pbRatio: stock.pb_ratio,
                        roe: stock.roe,
                        roa: stock.roa,
                        debtToEquity: stock.debt_to_equity,
                        dps: stock.dps,
                        dividendGrowth: stock.dividend_growth,
                        payoutFrequency: stock.payout_frequency,
                        operatingIncome: stock.operating_income,
                        fcf: stock.fcf,
                        fcfPerShare: stock.fcf_per_share,
                        sharesOut: stock.shares_out,
                        averageVolume: stock.average_volume,
                        beta: stock.beta,
                        rsi: stock.rsi,
                        sector: stock.sector,
                        industry: stock.industry,
                    },
                    create: {
                        symbol: stock.symbol,
                        name: stock.name,
                        price: stock.price || 0,
                        change: stock.change || 0,
                        changePct: stock.change_pct || 0,
                        marketCap: stock.market_cap || null,
                        volume: stock.volume ? Math.floor(stock.volume) : null,
                        revenue: stock.revenue || null,
                        peRatio: stock.pe_ratio,
                        dividendYield: stock.dividend_yield,
                        payoutRatio: stock.payout_ratio,
                        netIncome: stock.net_income,
                        eps: stock.eps,
                        ytdChange: stock.ytd_change,
                        change1w: stock.change_1w,
                        change1m: stock.change_1m,
                        change6m: stock.change_6m,
                        change1y: stock.change_1y,
                        change3y: stock.change_3y,
                        change5y: stock.change_5y,
                        psRatio: stock.ps_ratio,
                        pbRatio: stock.pb_ratio,
                        roe: stock.roe,
                        roa: stock.roa,
                        debtToEquity: stock.debt_to_equity,
                        dps: stock.dps,
                        dividendGrowth: stock.dividend_growth,
                        payoutFrequency: stock.payout_frequency,
                        operatingIncome: stock.operating_income,
                        fcf: stock.fcf,
                        fcfPerShare: stock.fcf_per_share,
                        sharesOut: stock.shares_out,
                        averageVolume: stock.average_volume,
                        beta: stock.beta,
                        rsi: stock.rsi,
                        sector: stock.sector,
                        industry: stock.industry,
                        scrapedAt: today,
                    },
                })
                successCount++
            } catch (err: any) {
                errorCount++
                console.error(`[STOCKS API] Failed to upsert ${stock.symbol}:`, err.message)
            }
        }

        console.log(`[STOCKS API] Done: ${successCount} upserted, ${errorCount} errors`)

        return NextResponse.json({
            success: true,
            upserted: successCount,
            errors: errorCount,
            message: `Updated ${successCount} stocks`,
        })
    } catch (error: any) {
        console.error("[STOCKS API] Error:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
