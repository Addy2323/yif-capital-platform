import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { summary } = body

        if (!summary) {
            return NextResponse.json({ success: false, error: "Missing summary data" }, { status: 400 })
        }

        const data = {
            indexValue: summary.indexValue,
            change: summary.change,
            changePercent: summary.changePercent,
            // Additional DSE indices from dse.co.tz
            tsiValue: summary.tsiValue ?? undefined,
            tsiChange: summary.tsiChange ?? undefined,
            bfiValue: summary.bfiValue ?? undefined,
            bfiChange: summary.bfiChange ?? undefined,
            iaValue: summary.iaValue ?? undefined,
            iaChange: summary.iaChange ?? undefined,
            perf1M: summary.perf1M,
            perf3M: summary.perf3M,
            perfYTD: summary.perfYTD,
            perf1Y: summary.perf1Y,
            perf2Y: summary.perf2Y,
            valueTraded: summary.valueTraded,
            volume: summary.volume,
            transactions: summary.transactions,
            marketCap: summary.marketCap,
            turnOver: summary.turnOver,
            deals: summary.deals,
            date: summary.date,
        }

        const upserted = await prisma.dseMarketSummary.upsert({
            where: { id: "1" },
            update: data,
            create: {
                id: "1",
                ...data
            }
        })

        return NextResponse.json({ success: true, data: upserted })

    } catch (error: any) {
        console.error("Failed to update DSE Market Summary:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function GET() {
    try {
        const { getDSEIndices, getDSEMarketStatus, getDSEMovers } = await import("@/lib/services/mansaApi")
        
        const summary = await prisma.dseMarketSummary.findUnique({
            where: { id: "1" }
        }) || {
            indexValue: 2145.67,
            change: 18.45,
            changePercent: 0.87,
            tsiValue: null,
            tsiChange: null,
            bfiValue: null,
            bfiChange: null,
            iaValue: null,
            iaChange: null,
            marketCap: null,
            volume: null,
            deals: null,
            turnOver: null,
            date: null,
        }

        // Fetch live indices to overwrite DSEI
        const indicesRes = await getDSEIndices()
        let indexValue = summary.indexValue
        let change = summary.change
        let changePercent = summary.changePercent

        if (indicesRes && indicesRes.success && indicesRes.data) {
            const dsei = indicesRes.data.find((idx: any) => idx.code === "DSEI")
            if (dsei) {
                indexValue = dsei.value
                change = dsei.change_points || dsei.change || 0
                changePercent = dsei.change_pct || dsei.changePercent || 0
            }
        }

        // Fetch status and movers
        const statusRes = await getDSEMarketStatus()
        const marketStatus = statusRes && statusRes.success ? statusRes.data : null

        const moversRes = await getDSEMovers()
        const movers = moversRes && moversRes.success ? moversRes.data : null

        return NextResponse.json({
            success: true,
            data: {
                ...summary,
                indexValue,
                change,
                changePercent,
                marketStatus,
                movers,
            }
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

