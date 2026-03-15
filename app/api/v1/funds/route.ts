import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { Fund, ApiResponse } from "@/lib/types/funds"

// GET /api/v1/funds - List all active funds
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fundType = searchParams.get("fund_type")
    const sortBy = searchParams.get("sort_by") || "name"
    const limit = parseInt(searchParams.get("limit") || "50")

    // Build where clause
    const where: any = { isActive: true }
    if (fundType) {
      where.fundType = fundType.toUpperCase()
    }

    // Build orderBy
    let orderBy: any = { fundName: "asc" }
    if (sortBy === "aum") {
      orderBy = { dailySummaries: { _count: "desc" } }
    }

    // Fetch funds from database
    const funds = await prisma.fund.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        dailySummaries: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    })

    // Get latest summaries (desc)
    const latestSummaries = await prisma.fundDailySummary.findMany({
      where: { fundId: { in: funds.map(f => f.fundId) } },
      distinct: ["fundId"],
      orderBy: { date: "desc" },
    })

    // Get summaries from ~1 year ago (single batched query to avoid exhausting DB connections)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const fundIds = latestSummaries.map((s) => s.fundId)
    const yearAgoRows = await prisma.fundDailySummary.findMany({
      where: {
        fundId: { in: fundIds },
        date: { lte: oneYearAgo }
      },
      orderBy: [{ fundId: "asc" }, { schemeName: "asc" }, { date: "desc" }],
    })
    // Keep latest per (fundId, schemeName)
    const yearAgoByKey = new Map<string, (typeof yearAgoRows)[0]>()
    for (const row of yearAgoRows) {
      const key = `${row.fundId}:${row.schemeName ?? ""}`
      if (!yearAgoByKey.has(key)) yearAgoByKey.set(key, row)
    }
    const yearAgoSummaries = latestSummaries
      .map((latest) => yearAgoByKey.get(`${latest.fundId}:${latest.schemeName ?? ""}`))
      .filter((s): s is NonNullable<typeof s> => s != null)

    // Fallback: earliest available record per fund/scheme (single batched query)
    const fundIdsWithYearAgo = new Set(yearAgoSummaries.map((s) => s.fundId))
    const fundsMissingYearAgo = latestSummaries.filter((s) => !fundIdsWithYearAgo.has(s.fundId))
    const latestDateByKey = new Map<string, Date>()
    for (const s of fundsMissingYearAgo) {
      latestDateByKey.set(`${s.fundId}:${s.schemeName ?? ""}`, s.date)
    }
    let earliestSummaries: typeof yearAgoRows = []
    if (fundsMissingYearAgo.length > 0) {
      const missingIds = [...new Set(fundsMissingYearAgo.map((s) => s.fundId))]
      const earlierRows = await prisma.fundDailySummary.findMany({
        where: { fundId: { in: missingIds } },
        orderBy: [{ fundId: "asc" }, { schemeName: "asc" }, { date: "asc" }],
      })
      const seen = new Set<string>()
      for (const row of earlierRows) {
        const key = `${row.fundId}:${row.schemeName ?? ""}`
        if (seen.has(key)) continue
        const latestDate = latestDateByKey.get(key)
        if (latestDate && row.date < latestDate) {
          seen.add(key)
          earliestSummaries.push(row)
        }
      }
    }

    // Map to response format
    const mappedFunds: Fund[] = funds.map((fund) => {
      const summary = latestSummaries.find((s) => s.fundId === fund.fundId)
      const yearAgoSummary = yearAgoSummaries.find((s) => s.fundId === fund.fundId && s.schemeName === summary?.schemeName)
      // Fallback to earliest available record for funds with <1 year of data
      const baselineSummary = yearAgoSummary
        || earliestSummaries.find((s) => s.fundId === fund.fundId && s.schemeName === summary?.schemeName)

      const return1y = summary && baselineSummary && baselineSummary.nav > 0
        ? ((summary.nav - baselineSummary.nav) / baselineSummary.nav) * 100
        : null

      return {
        fund_id: fund.fundId,
        fund_slug: fund.fundSlug,
        fund_name: fund.fundName,
        fund_type: fund.fundType.toLowerCase() as any,
        manager_name: fund.managerName,
        manager_id: fund.managerId || undefined,
        description: fund.description,
        logo_url: fund.logoUrl || undefined,
        inception_date: fund.inceptionDate.toISOString().split("T")[0],
        base_currency: fund.baseCurrency,
        benchmark_id: fund.benchmarkId || undefined,
        benchmark_name: fund.benchmarkName || undefined,
        is_active: fund.isActive,
        current_nav: summary?.nav || null,
        nav_change_1d: null, // We'll skip 1d change for now to keep it simple, or we could fetch 2 records in latestSummaries
        return_1y: return1y,
        aum: summary?.aum || null,
        volatility: summary?.volatility || null,
        date: summary?.date.toISOString().split("T")[0] || undefined,
      }
    })

    const response: ApiResponse<Fund[]> = {
      success: true,
      data: mappedFunds,
      metadata: {
        fund_id: "",
        timeframe: "1Y",
        last_updated_at: new Date().toISOString(),
        data_source: "cached",
        currency: "TZS",
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Error fetching funds:", error)
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error.message || "Failed to fetch funds",
        metadata: {
          fund_id: "",
          timeframe: "1Y",
          last_updated_at: new Date().toISOString(),
          data_source: "cached",
          currency: "TZS",
        },
      },
      { status: 500 }
    )
  }
}
