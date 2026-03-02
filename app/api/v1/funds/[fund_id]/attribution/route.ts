import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { AttributionData, ApiResponse, Timeframe } from "@/lib/types/funds"

// GET /api/v1/funds/[fund_id]/attribution - Module 9: Attribution Analysis
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fund_id: string }> }
) {
  try {
    const { fund_id } = await params
    const { searchParams } = new URL(request.url)
    const timeframe = (searchParams.get("timeframe") || "1Y") as Timeframe

    const fund = await prisma.fund.findFirst({
      where: { OR: [{ fundId: fund_id }, { fundSlug: fund_id }] },
    })

    if (!fund) {
      return NextResponse.json({ success: false, data: null, error: "Fund not found", metadata: { fund_id, timeframe, last_updated_at: new Date().toISOString(), data_source: "cached", currency: "TZS" } }, { status: 404 })
    }

    const attribution = await prisma.fundAttribution.findFirst({
      where: { fundId: fund.fundId, timeframe },
      orderBy: { date: "desc" },
    })

    const attributionData: AttributionData = {
      total_return: attribution?.totalReturn ?? null,
      benchmark_return: attribution?.benchmarkReturn ?? null,
      asset_allocation_effect: attribution?.assetAllocationEffect ?? null,
      security_selection_effect: attribution?.securitySelectionEffect ?? null,
      interaction_effect: attribution?.interactionEffect ?? null,
      active_return: attribution?.activeReturn ?? null,
      waterfall: (attribution?.waterfall as any[]) ?? [],
    }

    return NextResponse.json({
      success: true,
      data: attributionData,
      metadata: {
        fund_id: fund.fundId,
        timeframe,
        last_updated_at: attribution?.date.toISOString() || new Date().toISOString(),
        data_source: "cached",
        currency: fund.baseCurrency,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, data: null, error: error.message, metadata: { fund_id: "", timeframe: "1Y", last_updated_at: new Date().toISOString(), data_source: "cached", currency: "TZS" } }, { status: 500 })
  }
}
