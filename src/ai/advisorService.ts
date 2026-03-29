/**
 * YIF Capital — AI advisor via OpenAI (Chat Completions). Set OPENAI_API_KEY on the server.
 */

import type { StockMetrics } from "./regression"
import {
  getOpenAiApiKey,
  openaiChatGenerateContent,
  resolveOpenAiModelChain,
} from "./openaiGenerate"
import { getAnyLlmApiKey } from "./llmGenerate"

export type ParsedAiBlock = {
  trend: string
  risk: string
  advice: string
  confidence: string
  reason: string
}

export function parseYielAiResponse(raw: string): ParsedAiBlock | null {
  if (typeof raw !== "string" || !raw.trim()) return null

  const start = raw.indexOf("---YIELDAI_RESPONSE---")
  const end = raw.indexOf("---END---")
  if (start === -1 || end === -1 || end <= start) return null

  const block = raw.slice(start + "---YIELDAI_RESPONSE---".length, end).trim()
  const out: ParsedAiBlock = {
    trend: "",
    risk: "",
    advice: "",
    confidence: "",
    reason: "",
  }

  const lines = block.split(/\r?\n/)
  for (const line of lines) {
    const m = /^(Trend|Risk|Advice|Confidence|Reason)\s*:\s*(.*)$/i.exec(line.trim())
    if (m) {
      const key = m[1].toLowerCase()
      const val = m[2].trim()
      if (key === "trend") out.trend = val
      else if (key === "risk") out.risk = val
      else if (key === "advice") out.advice = val
      else if (key === "confidence") out.confidence = val
      else if (key === "reason") out.reason = val
    }
  }

  if (!out.advice) return null
  return out
}

export type NormalizedAdvice = {
  trend: string
  risk: string
  advice: string
  confidence: string
  confidenceScore: number
  reason: string
}

export function normalizeAdvice(parsed: ParsedAiBlock | null): NormalizedAdvice | null {
  if (!parsed) return null
  const adviceRaw = String(parsed.advice || "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
  const valid = ["BUY", "HOLD", "SELL"] as const
  const adviceNorm =
    valid.find((a) => adviceRaw.includes(a)) ?? "HOLD"

  let trend = String(parsed.trend || "STABLE").toUpperCase()
  if (!["UP", "DOWN", "STABLE"].some((t) => trend.includes(t))) trend = "STABLE"
  if (trend.includes("UP")) trend = "UP"
  else if (trend.includes("DOWN")) trend = "DOWN"
  else trend = "STABLE"

  let risk = String(parsed.risk || "MEDIUM").toUpperCase()
  if (!["LOW", "MEDIUM", "HIGH"].some((r) => risk.includes(r))) risk = "MEDIUM"
  if (risk.includes("LOW")) risk = "LOW"
  else if (risk.includes("HIGH")) risk = "HIGH"
  else risk = "MEDIUM"

  const confStr = String(parsed.confidence || "50%").replace(/\s/g, "")
  const confMatch = confStr.match(/(\d{1,3})%/)
  const confNum = confMatch
    ? Math.min(100, Math.max(0, parseInt(confMatch[1], 10)))
    : 50

  const reason = String(parsed.reason || "").slice(0, 400)

  return {
    trend,
    risk,
    advice: adviceNorm,
    confidence: `${confNum}%`,
    confidenceScore: confNum,
    reason: reason || "Analysis based on regression metrics and context.",
  }
}

export type AdvisorContext = {
  sector?: string
  userRisk?: string
  marketTrend?: string
  inflation?: number
  interestRate?: number
}

export function getFallbackAdvice(
  stock: string,
  metrics: StockMetrics,
  context: AdvisorContext
) {
  const slope = Number(metrics?.slope ?? 0)
  const mom = Number(metrics?.momentum ?? 0)
  const vol = Number(metrics?.volatility ?? 0)
  const r2 = Number(metrics?.r2 ?? 0)

  let advice: "BUY" | "HOLD" | "SELL" = "HOLD"
  if (slope > 0 && mom > 2 && r2 > 0.2) advice = "BUY"
  else if (slope < 0 && mom < -2) advice = "SELL"

  const userRisk = String(context?.userRisk || "medium").toLowerCase()
  if (userRisk === "low" && vol > 0.05) advice = "HOLD"
  if (userRisk === "high" && slope > 0 && advice === "HOLD") advice = "BUY"

  const trend = slope > 0.5 ? "UP" : slope < -0.5 ? "DOWN" : "STABLE"
  const risk = vol > 0.04 ? "HIGH" : vol > 0.02 ? "MEDIUM" : "LOW"

  const conf = Math.round(Math.min(95, 40 + r2 * 50))

  return {
    trend,
    risk,
    advice,
    confidence: `${conf}%`,
    confidenceScore: conf,
    reason:
      `Regression slope is ${slope.toFixed(4)} with R² ${r2.toFixed(2)}. ` +
      `Momentum ${mom.toFixed(2)}% and volatility ${(vol * 100).toFixed(2)}% (fallback model).`,
    source: "fallback" as const,
  }
}

export function buildPrompt(
  stock: string,
  metrics: StockMetrics,
  context: AdvisorContext
) {
  const sector = context?.sector ?? "Unknown"
  const userRisk = context?.userRisk ?? "medium"
  const marketTrend = context?.marketTrend ?? "STABLE"
  const inflation = context?.inflation ?? "n/a"
  const interestRate = context?.interestRate ?? "n/a"

  return `You are a Tanzanian financial advisor for YIF Capital clients investing on the Dar es Salaam Stock Exchange (DSE). Currency: TZS. Be concise and prudent; this is educational insight, not personal financial advice.

Stock: ${stock}
Sector: ${sector}
User risk tolerance: ${userRisk}
Broad market trend: ${marketTrend}
Inflation context (%): ${inflation}
Interest rate context (%): ${interestRate}

Regression & statistics:
- Linear slope (price vs time index): ${metrics?.slope ?? "n/a"}
- R² (fit): ${metrics?.r2 ?? "n/a"}
- 7-day predicted price (TZS): ${metrics?.prediction7d ?? "n/a"}
- 30-day predicted price (TZS): ${metrics?.prediction30d ?? "n/a"}
- Return volatility (stdev of daily returns): ${metrics?.volatility ?? "n/a"}
- Momentum (% first to last): ${metrics?.momentum ?? "n/a"}
- Support (min): ${metrics?.support ?? "n/a"}
- Resistance (max): ${metrics?.resistance ?? "n/a"}

Respond ONLY in this exact format (no markdown, no extra text):

---YIELDAI_RESPONSE---
Trend: <UP/DOWN/STABLE>
Risk: <LOW/MEDIUM/HIGH>
Advice: <BUY/HOLD/SELL>
Confidence: <0-100%>
Reason: <max 2 sentences>
---END---`
}

export type AiAdviceResult = NormalizedAdvice & {
  source: "openai" | "fallback"
  apiError?: boolean
  parseFailed?: boolean
}

function shouldRetryAdvisorModel(
  status: number,
  hasMoreModels: boolean
): boolean {
  if (!hasMoreModels) return false
  return (
    status === 429 ||
    status === 404 ||
    status === 400 ||
    status === 500 ||
    status === 502 ||
    status === 503
  )
}

export async function getAIAdvice(
  stock: string,
  metrics: StockMetrics,
  context: AdvisorContext
): Promise<AiAdviceResult> {
  if (!getAnyLlmApiKey()) {
    return getFallbackAdvice(stock, metrics, context)
  }

  const apiKey = getOpenAiApiKey()
  if (!apiKey) {
    return getFallbackAdvice(stock, metrics, context)
  }

  const prompt = buildPrompt(stock, metrics, context)
  let hadOkResponseButBadParse = false

  const modelChain = resolveOpenAiModelChain()
  for (let mi = 0; mi < modelChain.length; mi++) {
    const model = modelChain[mi]
    const hasMore = mi < modelChain.length - 1
    try {
      const result = await openaiChatGenerateContent({
        apiKey,
        model,
        userText: prompt,
        maxOutputTokens: 1024,
      })

      if (!result.ok) {
        if (shouldRetryAdvisorModel(result.status, hasMore)) {
          console.error(
            "[advisorService] OpenAI model retry",
            model,
            result.status,
            result.message
          )
          continue
        }
        console.error(
          "[advisorService] OpenAI error",
          result.status,
          result.message
        )
        break
      }

      const parsed = parseYielAiResponse(result.text)
      const normalized = normalizeAdvice(parsed)

      if (normalized) {
        return { ...normalized, source: "openai" }
      }

      hadOkResponseButBadParse = true
      if (hasMore) continue

      break
    } catch (e) {
      console.error("[advisorService] OpenAI", e)
      if (hasMore) continue
      break
    }
  }

  return {
    ...getFallbackAdvice(stock, metrics, context),
    source: "fallback",
    ...(hadOkResponseButBadParse
      ? { parseFailed: true }
      : { apiError: true }),
  }
}
