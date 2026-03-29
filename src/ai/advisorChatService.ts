/**
 * Open-ended Q&A with the YIF advisor (DSE / Tanzania context).
 * Uses Gemini and/or OpenAI (see llmGenerate.ts, AI_PROVIDER_ORDER).
 */

import { prisma } from "@/lib/prisma"
import { generateLlmContent, getAnyLlmApiKey } from "./llmGenerate"

/** Trim snapshot so the request is unlikely to exceed model context limits */
const MAX_SNAPSHOT_CHARS = 12_000

function buildLlmFailureReply(status: number, providerMessage: string): string {
  const msg = providerMessage.replace(/\s+/g, " ").trim()
  const short = msg.slice(0, 220)

  let hint = ""
  if (status === 400 || status === 401 || status === 403) {
    hint =
      "The AI provider rejected the request: check GEMINI_API_KEY and/or OPENAI_API_KEY, billing/API access, and key restrictions."
  } else if (status === 429) {
    hint =
      "Rate limited (HTTP 429). Wait 1–2 minutes or use a higher tier. You can set GEMINI_429_RETRIES=4 or OPENAI_429_RETRIES=3."
  } else if (status === 404) {
    hint =
      "No working Gemini model was found (HTTP 404). Set GEMINI_MODEL to a current id; see https://ai.google.dev/gemini-api/docs/models — or rely on OPENAI_API_KEY with AI_PROVIDER_ORDER=openai_first."
  } else if (status >= 500 || status === 503) {
    hint = "The AI provider had a server error; retry shortly."
  } else if (status === 0) {
    hint = short ? `Network error: ${short}` : "Network error reaching the AI API."
  } else if (short) {
    hint = `API said: ${short}`
  }

  return [
    "The AI advisor could not complete this request.",
    hint,
    "Meanwhile, use the Stocks page for live DSE data and read official company filings before making decisions.",
  ]
    .filter(Boolean)
    .join(" ")
}

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
  let out = `${header}\n${lines.join("\n")}`
  if (out.length > MAX_SNAPSHOT_CHARS) {
    out =
      out.slice(0, MAX_SNAPSHOT_CHARS) +
      "\n[…market snapshot truncated to stay within model limits…]"
  }
  return out
}

export type AdvisorChatResult = {
  reply: string
  source: "gemini" | "openai" | "fallback"
  apiError?: boolean
}

export async function getAdvisorChatReply(
  userMessage: string,
  options: { userRisk?: string; holdingsSummary?: string }
): Promise<AdvisorChatResult> {
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

  if (!getAnyLlmApiKey()) {
    return {
      reply:
        "The AI advisor needs GEMINI_API_KEY or OPENAI_API_KEY on the server. Until then, here are general tips: diversify across sectors on the DSE, invest only what you can hold long term, read each issuer’s annual reports, and consider consulting a licensed financial advisor in Tanzania. Browse live listings on the Stocks page.",
      source: "fallback",
    }
  }

  try {
    const result = await generateLlmContent({
      userText: userBlock,
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 2048,
      signal: AbortSignal.timeout(90_000),
    })

    if (!result.ok) {
      console.error(
        "[advisorChatService] LLM",
        result.status,
        result.message.slice(0, 800)
      )
      return {
        reply: buildLlmFailureReply(result.status, result.message),
        source: "fallback",
        apiError: true,
      }
    }

    return { reply: result.text, source: result.provider }
  } catch (e) {
    console.error("[advisorChatService]", e)
    const isAbort =
      e instanceof Error &&
      (e.name === "AbortError" || e.name === "TimeoutError")
    if (isAbort) {
      return {
        reply:
          "The AI request timed out (90s). Try a shorter question or retry. Meanwhile, use the Stocks page for live DSE data.",
        source: "fallback",
        apiError: true,
      }
    }
    const lastMessage = e instanceof Error ? e.message : String(e)
    return {
      reply: buildLlmFailureReply(0, lastMessage),
      source: "fallback",
      apiError: true,
    }
  }
}
