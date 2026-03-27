import { NextRequest, NextResponse } from "next/server"
import { processStockAnalysis } from "@/src/ai/pipeline"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/** Simple in-memory cache (5–10 min TTL). Not shared across serverless instances. */
const cache = new Map<string, { expires: number; payload: unknown }>()
const TTL_MS = 7 * 60 * 1000

function cacheKey(stock: string, userRisk: string) {
  return `${stock.toUpperCase()}::${userRisk.toLowerCase()}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const stock = typeof body.stock === "string" ? body.stock.trim() : ""
    const userRiskRaw = typeof body.userRisk === "string" ? body.userRisk : "medium"
    const userRisk = ["low", "medium", "high"].includes(userRiskRaw.toLowerCase())
      ? userRiskRaw.toLowerCase()
      : "medium"

    if (!stock) {
      return NextResponse.json(
        { success: false, error: "Field `stock` is required" },
        { status: 400 }
      )
    }

    const key = cacheKey(stock, userRisk)
    const now = Date.now()
    const hit = cache.get(key)
    if (hit && hit.expires > now) {
      return NextResponse.json({
        success: true,
        cached: true,
        data: hit.payload,
      })
    }

    const inflation =
      typeof body.inflation === "number" && Number.isFinite(body.inflation)
        ? body.inflation
        : undefined
    const interestRate =
      typeof body.interestRate === "number" && Number.isFinite(body.interestRate)
        ? body.interestRate
        : undefined

    const result = await processStockAnalysis(stock, {
      userRisk,
      inflation,
      interestRate,
    })

    cache.set(key, { expires: now + TTL_MS, payload: result })

    return NextResponse.json({
      success: true,
      cached: false,
      data: result,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Analysis failed"
    console.error("[ai-advice]", error)
    return NextResponse.json(
      { success: false, error: message },
      { status: message.includes("No historical") ? 404 : 500 }
    )
  }
}
