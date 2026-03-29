/**
 * Open-ended Q&A with the YIF advisor (DSE / Tanzania context).
 * Uses GEMINI_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY) like advisorService.ts.
 */

import { prisma } from "@/lib/prisma"
import {
  BUILTIN_GEMINI_FALLBACK_MODEL,
  DEFAULT_GEMINI_MODEL,
  geminiGenerateContent,
  getGeminiApiKey,
} from "./geminiGenerate"

/** Trim snapshot so the request is unlikely to exceed model context limits */
const MAX_SNAPSHOT_CHARS = 12_000

function buildGeminiFailureReply(status: number, providerMessage: string): string {
  const msg = providerMessage.replace(/\s+/g, " ").trim()
  const short = msg.slice(0, 220)

  let hint = ""
  if (status === 400 || status === 401 || status === 403) {
    hint =
      "The Gemini API rejected the request: check GEMINI_API_KEY is valid, billing/API access is enabled for Generative Language API, and the key is not restricted incorrectly."
  } else if (status === 429) {
    hint =
      "Google Gemini rate-limited this key (HTTP 429): free-tier quotas are tight. Wait 1–2 minutes, avoid rapid back-to-back questions, or enable billing / a higher tier in Google AI Studio. You can set GEMINI_429_RETRIES=4 for more automatic retries."
  } else if (status === 404) {
    hint =
      "The configured model may be invalid. Set GEMINI_MODEL to a current name (e.g. gemini-2.0-flash) or GEMINI_MODEL_FALLBACK."
  } else if (status >= 500 || status === 503) {
    hint = "Google’s API had a server error; retry shortly."
  } else if (status === 0) {
    hint = short ? `Network error: ${short}` : "Network error reaching Google’s API."
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
  source: "gemini" | "fallback"
  apiError?: boolean
}

export async function getAdvisorChatReply(
  userMessage: string,
  options: { userRisk?: string; holdingsSummary?: string }
): Promise<AdvisorChatResult> {
  const apiKey = getGeminiApiKey()
  const primary =
    process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL
  const fallbackEnv = process.env.GEMINI_MODEL_FALLBACK?.trim()
  const modelChain = [
    primary,
    ...(fallbackEnv ? [fallbackEnv] : []),
    BUILTIN_GEMINI_FALLBACK_MODEL,
  ].filter((m, i, a) => m && a.indexOf(m) === i)

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
        "The AI advisor needs GEMINI_API_KEY on the server. Until then, here are general tips: diversify across sectors on the DSE, invest only what you can hold long term, read each issuer’s annual reports, and consider consulting a licensed financial advisor in Tanzania. Browse live listings on the Stocks page.",
      source: "fallback",
    }
  }

  let lastStatus = 0
  let lastMessage = ""

  for (const tryModel of modelChain) {
    try {
      const result = await geminiGenerateContent({
        apiKey,
        model: tryModel,
        systemInstruction: SYSTEM_PROMPT,
        userText: userBlock,
        maxOutputTokens: 2048,
        signal: AbortSignal.timeout(90_000),
      })

      if (!result.ok) {
        lastStatus = result.status
        lastMessage = result.message
        console.error(
          "[advisorChatService] Gemini",
          tryModel,
          result.status,
          result.message.slice(0, 800)
        )

        const stopRetry = result.status === 401 || result.status === 403

        const tryNextModel =
          !stopRetry &&
          tryModel !== modelChain[modelChain.length - 1] &&
          (result.status === 429 ||
            result.status === 404 ||
            result.status === 400 ||
            result.status === 502 ||
            result.status === 503)

        if (tryNextModel) continue

        return {
          reply: buildGeminiFailureReply(lastStatus, lastMessage),
          source: "fallback",
          apiError: true,
        }
      }

      const text = result.text.trim()
      if (!text) {
        if (tryModel !== modelChain[modelChain.length - 1]) continue
        return {
          reply:
            "The model returned an empty reply. Please rephrase your question or try again.",
          source: "fallback",
          apiError: true,
        }
      }

      return { reply: text, source: "gemini" }
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
      lastMessage = e instanceof Error ? e.message : String(e)
      if (tryModel !== modelChain[modelChain.length - 1]) continue
      return {
        reply: buildGeminiFailureReply(0, lastMessage),
        source: "fallback",
        apiError: true,
      }
    }
  }

  return {
    reply: buildGeminiFailureReply(lastStatus, lastMessage),
    source: "fallback",
    apiError: true,
  }
}
