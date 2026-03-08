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
            perf1M: summary.perf1M,
            perf3M: summary.perf3M,
            perfYTD: summary.perfYTD,
            perf1Y: summary.perf1Y,
            perf2Y: summary.perf2Y,
            valueTraded: summary.valueTraded,
            volume: summary.volume,
            transactions: summary.transactions,
            marketCap: summary.marketCap,
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
        const summary = await prisma.dseMarketSummary.findUnique({
            where: { id: "1" }
        })
        return NextResponse.json({ success: true, data: summary })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
