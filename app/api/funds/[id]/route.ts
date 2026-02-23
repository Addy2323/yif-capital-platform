import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        // Map common IDs to database fundIds
        const fundMap: Record<string, string> = {
            "zansec": "zansec-bond",
            "utt-amis": "utt-umoja",
            "whi": "whi-income",
            "vertex": "vertex-bond",
            "sanlam-pesa": "sanlam-pesa"
        }

        const fundId = fundMap[id] || id

        // Fetch from Prisma instead of local JSON for better reliability
        const summaries = await prisma.fundDailySummary.findMany({
            where: { fundId },
            orderBy: { date: 'desc' },
            take: 1000 // Limit to avoid performance issues
        })

        if (!summaries || summaries.length === 0) {
            return NextResponse.json(
                { success: false, error: "No performance data found for this fund" },
                { status: 404 }
            )
        }

        // Map database records back to the structure the frontend expects
        const mappedData = summaries.map(s => ({
            date: s.date.toISOString().split('T')[0],
            fund_name: s.schemeName,
            nav_per_unit: Number(s.nav),
            total_nav: Number(s.aum),
            units: s.nav > 0 ? Number(s.aum) / Number(s.nav) : 0,
            volatility: Number(s.volatility),
            daily_return: Number(s.dailyReturn),
            sale_price: s.salePrice ? Number(s.salePrice) : 0,
            repurchase_price: s.repurchasePrice ? Number(s.repurchasePrice) : 0,
            source: id,
            status: "extracted"
        }))

        return NextResponse.json({
            success: true,
            data: mappedData
        })
    } catch (error: any) {
        console.error(`Error fetching fund data for ${id}:`, error)
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        )
    }
}
