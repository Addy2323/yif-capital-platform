import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// ---------------------------------------------------------------------------
// Mapping tables — source name → DB fundId, metadata for auto-creation
// ---------------------------------------------------------------------------
const FUND_MAP: Record<string, string> = {
    "zansec": "zansec-bond",
    "utt-amis": "utt-amis",
    "whi": "whi-income",
    "vertex": "vertex-bond",
    "sanlam-pesa": "sanlam-pesa",
    "itrust": "itrust",
    "orbit": "orbit",
    "tsl": "tsl",
    "apef": "apef",
}

const FUND_DEFAULTS: Record<string, {
    fundSlug: string
    fundName: string
    fundType: string
    managerName: string
    description: string
    inceptionDate: string
}> = {
    "utt-amis": {
        fundSlug: "utt-amis",
        fundName: "UTT AMIS Fund",
        fundType: "BALANCED",
        managerName: "UTT AMIS",
        description: "Comprehensive balanced fund offering diversified investment across multiple asset classes.",
        inceptionDate: "2010-01-01",
    },
    "zansec-bond": {
        fundSlug: "zansec",
        fundName: "Zan Securities Fixed Income Fund",
        fundType: "FIXED_INCOME",
        managerName: "Zan Securities",
        description: "Fixed income and bond fund focused on secure, steady returns.",
        inceptionDate: "2015-06-01",
    },
    "whi-income": {
        fundSlug: "whi",
        fundName: "Watumishi Housing Investment Fund",
        fundType: "INCOME",
        managerName: "Watumishi Housing Investments",
        description: "Income fund focused on real estate and housing sector investments.",
        inceptionDate: "2012-03-15",
    },
    "vertex-bond": {
        fundSlug: "vertex",
        fundName: "Vertex Bond Fund",
        fundType: "BOND",
        managerName: "Vertex International Securities",
        description: "Secure, steady fixed-income investment approved by CMSA.",
        inceptionDate: "2018-01-01",
    },
    "itrust": {
        fundSlug: "itrust",
        fundName: "iTrust Finance Fund Family",
        fundType: "MONEY_MARKET",
        managerName: "iTrust Finance",
        description: "6 expertly designed funds: iCash, iGrowth, iSave, iIncome, Imaan & iDollar.",
        inceptionDate: "2019-01-01",
    },
    "sanlam-pesa": {
        fundSlug: "sanlam-pesa",
        fundName: "SanlamAllianz Pesa Fund",
        fundType: "MONEY_MARKET",
        managerName: "Sanlam Allianz Investments",
        description: "Earn compounded interest. Invest from as low as TZS 10,000.",
        inceptionDate: "2017-07-01",
    },
    "orbit": {
        fundSlug: "orbit",
        fundName: "Orbit Securities Funds",
        fundType: "MONEY_MARKET",
        managerName: "Orbit Securities Limited",
        description: "Inuka Money Market Fund and Inuka Dozen Index Fund.",
        inceptionDate: "2020-01-01",
    },
    "tsl": {
        fundSlug: "tsl",
        fundName: "TSL Fund Management",
        fundType: "BALANCED",
        managerName: "Tanzania Securities Limited",
        description: "Imara Fund and Kesho Tulivu Fund. Data scraped when published.",
        inceptionDate: "2020-01-01",
    },
    "apef": {
        fundSlug: "apef",
        fundName: "Ziada Fund",
        fundType: "BALANCED",
        managerName: "African Pension Fund",
        description: "Ziada Fund. Data scraped when published.",
        inceptionDate: "2020-01-01",
    },
}

// ---------------------------------------------------------------------------
// Ensure parent Fund record exists (auto-create if missing)
// ---------------------------------------------------------------------------
async function ensureFundExists(fundId: string) {
    const existing = await prisma.fund.findUnique({ where: { fundId } })
    if (existing) return

    const defaults = FUND_DEFAULTS[fundId]
    if (!defaults) {
        console.warn(`[API] No default metadata for fundId=${fundId}, creating minimal record`)
    }

    await prisma.fund.create({
        data: {
            fundId,
            fundSlug: defaults?.fundSlug ?? fundId,
            fundName: defaults?.fundName ?? fundId,
            fundType: (defaults?.fundType as any) ?? "BALANCED",
            managerName: defaults?.managerName ?? "Unknown",
            description: defaults?.description ?? "",
            inceptionDate: new Date(defaults?.inceptionDate ?? "2020-01-01"),
            baseCurrency: "TZS",
            isActive: true,
        },
    })
    console.log(`[API] Auto-created Fund record for fundId=${fundId}`)
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { source, data } = body

        if (!source || !data || !Array.isArray(data)) {
            return NextResponse.json(
                { success: false, error: "Invalid data format — need {source, data[]}" },
                { status: 400 },
            )
        }

        const fundId = FUND_MAP[source] ?? source
        console.log(`[API] Receiving ${data.length} records for source=${source} → fundId=${fundId}`)

        // Ensure the parent Fund registry record exists before inserting summaries
        await ensureFundExists(fundId)

        // Upsert records sequentially to avoid connection flooding
        let successCount = 0
        let skipCount = 0
        let errorCount = 0

        for (const record of data) {
            const date = new Date(record.date)
            if (isNaN(date.getTime())) {
                skipCount++
                continue
            }

            const schemeName = record.fund_name || FUND_DEFAULTS[fundId]?.fundName || null

            try {
                await prisma.fundDailySummary.upsert({
                    where: {
                        fundId_date_schemeName: { fundId, date, schemeName },
                    },
                    update: {
                        nav: record.nav_per_unit ?? 0,
                        aum: record.total_nav ?? 0,
                        volatility: record.volatility || 0,
                        dailyReturn: record.daily_return || 0,
                        salePrice: record.sale_price || 0,
                        repurchasePrice: record.repurchase_price || 0,
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
                        repurchasePrice: record.repurchase_price || 0,
                    },
                })
                successCount++
            } catch (err: any) {
                errorCount++
                console.error(
                    `[API] Failed to upsert [${fundId}] date=${record.date} scheme=${schemeName}:`,
                    err.message,
                )
            }
        }

        // Remove any future-dated rows for this fund (fixes bad scraper dates e.g. iTrust 2026)
        const startOfTomorrow = new Date()
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)
        startOfTomorrow.setHours(0, 0, 0, 0)
        const deleted = await prisma.fundDailySummary.deleteMany({
            where: { fundId, date: { gte: startOfTomorrow } },
        })
        if (deleted.count > 0) {
            console.log(`[API] Removed ${deleted.count} future-dated rows for ${fundId}`)
        }

        console.log(
            `[API] Done: ${successCount} upserted, ${skipCount} skipped, ${errorCount} errors for ${fundId}`,
        )

        return NextResponse.json({
            success: true,
            fundId,
            upserted: successCount,
            skipped: skipCount,
            errors: errorCount,
            message: `Updated ${successCount} records for ${fundId}`,
        })
    } catch (error: any) {
        console.error("[API Error] Failed to update fund data:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
