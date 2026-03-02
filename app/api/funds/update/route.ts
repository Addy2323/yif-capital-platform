import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { source, data } = body

        if (!source || !data || !Array.isArray(data)) {
            return NextResponse.json({ success: false, error: "Invalid data format" }, { status: 400 })
        }


        // Simple mapping for demonstration
        const fundMap: Record<string, string> = {
            "zansec": "zansec-bond",
            "utt-amis": "utt-amis",
            "whi": "whi-income",
            "vertex": "vertex-bond",
            "sanlam-pesa": "sanlam-pesa",
            "itrust": "itrust"
        }

        const nameMap: Record<string, string> = {
            "zansec-bond": "Zan Securities Fixed Income Fund",
            "utt-amis": "UTT AMIS Fund",
            "whi-income": "Watumishi Housing Investment Fund",
            "vertex-bond": "Vertex Bond Fund",
            "itrust": "iTrust Finance Fund Family",
            "sanlam-pesa": "SanlamAllianz Pesa Fund"
        }

        const fundId = fundMap[source]

        // Upsert data into FundDailySummary sequentially to avoid connection flooding
        const results = []
        for (const record of data) {
            const date = new Date(record.date)
            // Skip invalid dates
            if (isNaN(date.getTime())) {
                results.push(null)
                continue
            }

            const schemeName = record.fund_name || nameMap[fundId] || null

            try {
                const result = await prisma.fundDailySummary.upsert({
                    where: {
                        fundId_date_schemeName: {
                            fundId,
                            date,
                            schemeName
                        }
                    },
                    update: {
                        nav: record.nav_per_unit ?? 0,
                        aum: record.total_nav ?? 0,
                        volatility: record.volatility || 0,
                        dailyReturn: record.daily_return || 0,
                        salePrice: record.sale_price || 0,
                        repurchasePrice: record.repurchase_price || 0
                    },
                    create: {
                        fundId,
                        date,
                        schemeName,
                        nav: record.nav_per_unit ?? 0,
                        aum: record.total_nav ?? 0,
                        volatility: record.volatility || 0,
                        dailyReturn: record.daily_return || 0,
                        salePrice: record.sale_price || 0,
                        repurchasePrice: record.repurchase_price || 0
                    }
                })
                results.push(result)
            } catch (err: any) {
                console.error(`[API] Failed to upsert record for ${date.toISOString()}:`, err)
                results.push(null)
            }
        }

        return NextResponse.json({
            success: true,
            message: `Updated ${results.filter(Boolean).length} records for ${fundId}`
        })

    } catch (error: any) {
        console.error("[API Error] Failed to update fund data:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
