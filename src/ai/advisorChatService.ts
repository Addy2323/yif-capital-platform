/**
 * Open-ended Q&A with the YIF advisor (DSE / Tanzania context).
 * Uses the same OpenRouter env vars as advisorService.ts.
 */

import { prisma } from "@/lib/prisma"

const DEFAULT_OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const DEFAULT_OPENROUTER_MODEL = "anthropic/claude-3.5-sonnet"
/** Used if primary model returns 400/404 (deprecated slug, etc.) */
const BUILTIN_FALLBACK_MODEL = "openai/gpt-4o-mini"
/** Trim snapshot so the request is unlikely to exceed model context / gateway limits */
const MAX_SNAPSHOT_CHARS = 12_000

function normalizeOpenRouterChatUrl(raw: string | undefined): string {
  let u = (raw || "").trim()
  if (!u) return DEFAULT_OPENROUTER_URL
  if (u.includes("/chat/completions")) return u
  u = u.replace(/\/$/, "")
  if (u.endsWith("/v1")) return `${u}/chat/completions`
  return DEFAULT_OPENROUTER_URL
}

function parseOpenRouterErrorBody(body: string): string {
  try {
    const j = JSON.parse(body) as { error?: { message?: string } }
    const m = j?.error?.message
    return typeof m === "string" ? m : ""
  } catch {
    return body.replace(/\s+/g, " ").trim().slice(0, 280)
  }
}

function buildOpenRouterFailureReply(
  status: number,
  providerMessage: string
): string {
  const msg = providerMessage.replace(/\s+/g, " ").trim()
  const short = msg.slice(0, 220)

  let hint = ""
  if (status === 401) {
    hint =
      "Your server rejected the request (HTTP 401): check OPENROUTER_API_KEY is set correctly and not expired."
  } else if (status === 402) {
    hint =
      "OpenRouter returned payment required (HTTP 402): add credits or billing on your OpenRouter account."
  } else if (status === 429) {
    hint = "Rate limited (HTTP 429): wait a minute and try again."
  } else if (status === 404 || (status === 400 && /model|not found/i.test(msg))) {
    hint =
      "The configured model may be invalid or renamed. Set OPENROUTER_MODEL to a current slug (e.g. openai/gpt-4o-mini) or set OPENROUTER_MODEL_FALLBACK."
  } else if (status >= 500) {
    hint = "OpenRouter or upstream had a server error; retry shortly."
  } else if (short) {
    hint = `Provider said: ${short}`
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

  const chatUrl = normalizeOpenRouterChatUrl(apiUrl)
  if (chatUrl !== apiUrl.trim()) {
    console.warn(
      "[advisorChatService] Normalized OPENROUTER_API_URL to",
      chatUrl
    )
  }

  const fallbackModel = process.env.OPENROUTER_MODEL_FALLBACK?.trim()
  const modelChain = [
    model,
    ...(fallbackModel ? [fallbackModel] : []),
    BUILTIN_FALLBACK_MODEL,
  ].filter((m, i, a) => m && a.indexOf(m) === i)

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

    let lastStatus = 0
    let lastProviderMessage = ""

    for (const tryModel of modelChain) {
      const res = await fetch(chatUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: tryModel,
          max_tokens: 2048,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userBlock },
          ],
        }),
        signal: AbortSignal.timeout(90_000),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => "")
        lastStatus = res.status
        lastProviderMessage = parseOpenRouterErrorBody(errText)
        console.error(
          "[advisorChatService] OpenRouter",
          tryModel,
          res.status,
          errText.slice(0, 800)
        )
        const authOrPayment =
          res.status === 401 || res.status === 402 || res.status === 429
        const retryWithNextModel =
          !authOrPayment &&
          (res.status === 400 ||
            res.status === 404 ||
            res.status === 502 ||
            res.status === 503 ||
            (res.status === 403 && /model/i.test(lastProviderMessage)))
        if (
          retryWithNextModel &&
          tryModel !== modelChain[modelChain.length - 1]
        ) {
          continue
        }
        return {
          reply: buildOpenRouterFailureReply(
            lastStatus,
            lastProviderMessage
          ),
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
        if (tryModel !== modelChain[modelChain.length - 1]) continue
        return {
          reply:
            "The model returned an empty reply. Please rephrase your question or try again.",
          source: "fallback",
          apiError: true,
        }
      }

      return { reply: text, source: "openrouter" }
    }

    return {
      reply: buildOpenRouterFailureReply(lastStatus, lastProviderMessage),
      source: "fallback",
      apiError: true,
    }
  } catch (e) {
    console.error("[advisorChatService]", e)
    const isAbort =
      e instanceof Error &&
      (e.name === "AbortError" || e.name === "TimeoutError")
    return {
      reply: isAbort
        ? "The AI request timed out (90s). Try a shorter question or retry. Meanwhile, use the Stocks page for live DSE data."
        : "Something went wrong while contacting the advisor. If the server cannot reach openrouter.ai, check firewall/DNS. Otherwise verify OPENROUTER_API_KEY and OPENROUTER_API_URL.",
      source: "fallback",
      apiError: true,
    }
  }
}
