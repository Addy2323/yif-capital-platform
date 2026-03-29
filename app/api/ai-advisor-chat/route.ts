import { NextRequest, NextResponse } from "next/server"
import { getAdvisorChatReply } from "@/src/ai/advisorChatService"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const MAX_LEN = 2500

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const message =
      typeof body.message === "string" ? body.message.trim() : ""
    const userRiskRaw = typeof body.userRisk === "string" ? body.userRisk : "medium"
    const userRisk = ["low", "medium", "high"].includes(userRiskRaw.toLowerCase())
      ? userRiskRaw.toLowerCase()
      : "medium"
    const holdingsSummary =
      typeof body.holdingsSummary === "string"
        ? body.holdingsSummary.slice(0, 800)
        : undefined

    if (!message || message.length < 2) {
      return NextResponse.json(
        { success: false, error: "Enter a question (at least 2 characters)." },
        { status: 400 }
      )
    }
    if (message.length > MAX_LEN) {
      return NextResponse.json(
        {
          success: false,
          error: `Question is too long (max ${MAX_LEN} characters).`,
        },
        { status: 400 }
      )
    }

    const result = await getAdvisorChatReply(message, {
      userRisk,
      holdingsSummary,
    })

    return NextResponse.json({
      success: true,
      data: {
        reply: result.reply,
        source: result.source,
        apiError: result.apiError,
      },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Request failed"
    console.error("[ai-advisor-chat]", error)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
