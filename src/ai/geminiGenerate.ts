import "server-only"

/**
 * Google Gemini — generateContent REST API (native, not OpenAI-compat).
 * Set GEMINI_API_KEY in server env. Never expose keys in browsers.
 * @see https://ai.google.dev/api/generate-content
 */

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"

export const DEFAULT_GEMINI_MODEL = "gemini-1.5-flash"

export const GEMINI_FALLBACK_MODELS: readonly string[] = [
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-pro",
]

export function resolveGeminiModelChain(): string[] {
  const rawPrimary = process.env.GEMINI_MODEL?.trim()
  const primary =
    rawPrimary && rawPrimary.length > 0 ? rawPrimary : DEFAULT_GEMINI_MODEL
  const chain = [primary, ...GEMINI_FALLBACK_MODELS]
  return chain.filter((m, i, a) => m.length > 0 && a.indexOf(m) === i)
}

export function getGeminiApiKey(): string | undefined {
  const k = process.env.GEMINI_API_KEY?.trim()
  return k || undefined
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function maxRetries(): number {
  const raw = process.env.GEMINI_RETRIES?.trim() ?? process.env.OPENAI_429_RETRIES?.trim()
  const n = raw ? parseInt(raw, 10) : 2
  if (!Number.isFinite(n)) return 2
  return Math.min(5, Math.max(1, n))
}

export type GeminiGenerateOptions = {
  apiKey: string
  model: string
  userText: string
  systemInstruction?: string
  maxOutputTokens?: number
  signal?: AbortSignal
}

export type GeminiGenerateResult =
  | { ok: true; text: string }
  | { ok: false; status: number; message: string }

function extractText(data: unknown): string {
  if (!data || typeof data !== "object") return ""
  const d = data as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
    }>
  }
  const parts = d.candidates?.[0]?.content?.parts
  if (!parts) return ""
  return parts
    .map((p) => (typeof p.text === "string" ? p.text : ""))
    .join("")
}

function parseErrorBody(body: string): string {
  try {
    const j = JSON.parse(body) as { error?: { message?: string } }
    const m = j?.error?.message
    return typeof m === "string" ? m : ""
  } catch {
    return body.replace(/\s+/g, " ").trim().slice(0, 280)
  }
}

export async function geminiGenerateContent(
  opts: GeminiGenerateOptions
): Promise<GeminiGenerateResult> {
  const model = opts.model.trim()
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${opts.apiKey}`

  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = []
  contents.push({ role: "user", parts: [{ text: opts.userText }] })

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: opts.maxOutputTokens ?? 2048,
    },
  }

  const sys = opts.systemInstruction?.trim()
  if (sys) {
    body.systemInstruction = {
      parts: [{ text: sys }],
    }
  }

  const payload = JSON.stringify(body)
  const attempts = maxRetries()
  let res: Response | undefined
  let raw = ""

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        signal: opts.signal,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      return { ok: false, status: 0, message: msg }
    }

    raw = await res.text().catch(() => "")
    if (res.ok) break

    if (res.status === 429 && attempt < attempts - 1) {
      const delayMs = Math.min(12_000, 1800 * 2 ** attempt)
      await sleep(delayMs)
      continue
    }

    const parsed = parseErrorBody(raw)
    return {
      ok: false,
      status: res.status,
      message: parsed || raw.replace(/\s+/g, " ").trim().slice(0, 280),
    }
  }

  if (!res) {
    return { ok: false, status: 0, message: "No response from Gemini" }
  }

  let data: unknown
  try {
    data = JSON.parse(raw) as unknown
  } catch {
    return { ok: false, status: res.status, message: "Invalid JSON from Gemini" }
  }

  const text = extractText(data).trim()
  if (!text) {
    const d = data as { error?: { message?: string } }
    const err = d?.error?.message
    if (typeof err === "string" && err) {
      return { ok: false, status: res.status, message: err.slice(0, 280) }
    }
    return { ok: false, status: 200, message: "Empty reply from Gemini" }
  }

  return { ok: true, text }
}
