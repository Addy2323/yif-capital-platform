import { NextResponse } from "next/server"
import { tanzanianFunds, Fund } from "@/lib/market-data"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        // Fetch latest data for each fund from DB
        const latestSummaries = await prisma.fundDailySummary.findMany({
            distinct: ['fundId'],
            orderBy: {
                date: 'desc'
            }
        })

        // Merge DB data with metadata
        const mergedFunds = tanzanianFunds.map(fund => {
            const summary = latestSummaries.find((s: any) => s.fundId === fund.id)
            if (summary) {
                return {
                    ...fund,
                    nav: summary.nav,
                    aum: summary.aum,
                    volatility: summary.volatility,
                    dailyReturn: summary.dailyReturn,
                    date: summary.date.toISOString().split('T')[0]
                }
            }
            return fund
        })

        return NextResponse.json({
            success: true,
            data: mergedFunds,
            count: mergedFunds.length,
            lastUpdated: new Date().toISOString(),
        })
    } catch (error: any) {
        console.error("API Error fetching funds:", error)
        return NextResponse.json({
            success: true, // Fallback to mock data on error
            data: tanzanianFunds,
            count: tanzanianFunds.length,
            lastUpdated: new Date().toISOString(),
            error: error.message
        })
    }
}
