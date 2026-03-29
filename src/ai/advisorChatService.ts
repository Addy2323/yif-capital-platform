/**
 * Open-ended Q&A with the YIF advisor (DSE / Tanzania context).
 * Uses the same OpenRouter env vars as advisorService.ts.
 */

import { prisma } from "@/lib/prisma"

const DEFAULT_OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const DEFAULT_OPENROUTER_MODEL = "anthropic/claude-3.5-sonnet"

const SYSTEM_PROMPT = `You are the YIF Capital assistant for investors interested in the Dar es Salaam Stock Exchange (DSE), Tanzania. All prices are in TZS unless stated otherwise.

Rules:
- Provide general, educational information only. You are not giving personal financial, tax, or legal advice.
- When discussing specific stocks, prefer tickers from the "Market snapshot" section if one is provided.
- If the user asks for "top stocks", "best picks", or similar, give a balanced view: mention risks, diversification, liquidity, and that they must do their own research and may consult a licensed advisor. Never guarantee returns.
- Be concise. Use short paragraphs or bullet lists. Plain text only (no HTML).
- If data for a company is missing from the snapshot, say recent figures may not be loaded and suggest checking official disclosures and the YIF stocks page.
- You may answer in English or Swahili if the user writes in Swahili.`

export async function buildMarketSnapshotText(maxRows = 40): Promise<string> {
  const latest = await prisma.dseStock.findFirst({
    orderBy: { scrapedAt: "desc" },
    select: { scrapedAt: true },
  })
  if (!latest) {
    return "No DSE scrape rows in the database yet. The user should rely on official DSE sources until data syncs."
  }

  const stocks = await prisma.dseStock.findMany({
    where: { scrapedAt: latest.scrapedAt },
    orderBy: { marketCap: "desc" },
    take: maxRows,
    select: {
      symbol: true,
      name: true,
      price: true,
      changePct: true,
      sector: true,
      marketCap: true,
      volume: true,
    },
  })

  const header = `Latest scrape: ${latest.scrapedAt.toISOString().slice(0, 10)} (${stocks.length} rows, sorted by market cap)`
  const lines = stocks.map((s) => {
    const cap =
      s.marketCap != null && Number.isFinite(s.marketCap)
        ? `${(s.marketCap / 1e9).toFixed(2)}B TZS`
        : "n/a"
    const vol =
      s.volume != null && Number.isFinite(s.volume)
        ? s.volume.toLocaleString()
        : "n/a"
    return `${s.symbol} | ${(s.name || "").slice(0, 48)} | ${s.sector || ""} | ${Math.round(Number(s.price))} TZS | Δ ${Number(s.changePct ?? 0).toFixed(2)}% | cap ~${cap} | vol ${vol}`
  })
  return `${header}\n${lines.join("\n")}`
}

export type AdvisorChatResult = {
  reply: string
  source: "openrouter" | "fallback"
  apiError?: boolean
}

export async function getAdvisorChatReply(
  userMessage: string,
  options: { userRisk?: string; holdingsSummary?: string }
): Promise<AdvisorChatResult> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim()
  const apiUrl =
    process.env.OPENROUTER_API_URL?.trim() || DEFAULT_OPENROUTER_URL
  const model =
    process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL

  let snapshot = ""
  try {
    snapshot = await buildMarketSnapshotText()
  } catch (e) {
    console.error("[advisorChatService] snapshot", e)
    snapshot = "Market snapshot unavailable."
  }

  const risk = options.userRisk || "medium"
  const holdings = options.holdingsSummary?.trim() || "None provided."

  const userBlock = `User risk preference: ${risk}
Portfolio / holdings note (may be empty): ${holdings}

Market snapshot:
${snapshot}

User question:
${userMessage.trim()}`

  if (!apiKey) {
    return {
      reply:
        "The AI advisor needs OPENROUTER_API_KEY on the server. Until then, here are general tips: diversify across sectors on the DSE, invest only what you can hold long term, read each issuer’s annual reports, and consider consulting a licensed financial advisor in Tanzania. Browse live listings on the Stocks page.",
      source: "fallback",
    }
  }

  try {
    const referer =
      process.env.OPENROUTER_HTTP_REFERER?.trim() ||
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      "https://yif.capital"

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": referer,
      "X-Title": "YIF Capital - Advisor Q&A",
    }

    const res = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userBlock },
        ],
      }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => "")
      console.error("[advisorChatService] OpenRouter", res.status, errText)
      return {
        reply:
          "Could not reach the AI service right now. Please try again in a moment. Meanwhile, use the Stocks page for live DSE data and read official company filings before making decisions.",
        source: "fallback",
        apiError: true,
      }
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>
    }
    const raw = data?.choices?.[0]?.message?.content
    const text = typeof raw === "string" ? raw.trim() : ""
    if (!text) {
      return {
        reply:
          "The model returned an empty reply. Please rephrase your question or try again.",
        source: "fallback",
        apiError: true,
      }
    }

    return { reply: text, source: "openrouter" }
  } catch (e) {
    console.error("[advisorChatService]", e)
    return {
      reply:
        "Something went wrong while contacting the advisor. Check your connection and try again.",
      source: "fallback",
      apiError: true,
    }
  }
}
