/**
 * Google Gemini (Generative Language API) — generateContent via REST.
 * @see https://ai.google.dev/api/rest/v1beta/models/generateContent
 */

/** Prefer current stable IDs; unversioned slugs often return 404 on the REST API. */
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"

/**
 * Tried after primary (and optional GEMINI_MODEL_FALLBACK), in order.
 * @see https://ai.google.dev/gemini-api/docs/models
 */
export const GEMINI_BUILTIN_FALLBACKS: readonly string[] = [
  "gemini-2.0-flash-001",
  "gemini-1.5-flash-002",
  "gemini-1.5-flash",
]

export function resolveGeminiModelChain(): string[] {
  const primary =
    process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL
  const envFallback = process.env.GEMINI_MODEL_FALLBACK?.trim()
  const chain = [
    primary,
    ...(envFallback ? [envFallback] : []),
    ...GEMINI_BUILTIN_FALLBACKS,
  ]
  return chain.filter((m, i, a) => m.length > 0 && a.indexOf(m) === i)
}

const API_ROOT =
  "https://generativelanguage.googleapis.com/v1beta/models"

export function getGeminiApiKey(): string | undefined {
  const k =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
  return k || undefined
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Retries after HTTP 429 (Gemini quota / burst limits). Override with GEMINI_429_RETRIES (1–6). */
function max429Attempts(): number {
  const raw = process.env.GEMINI_429_RETRIES?.trim()
  const n = raw ? parseInt(raw, 10) : 3
  if (!Number.isFinite(n)) return 3
  return Math.min(6, Math.max(1, n))
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

function parseGeminiErrorBody(body: string): string {
  try {
    const j = JSON.parse(body) as { error?: { message?: string } }
    const m = j?.error?.message
    return typeof m === "string" ? m : ""
  } catch {
    return body.replace(/\s+/g, " ").trim().slice(0, 280)
  }
}

function extractText(data: unknown): string {
  if (!data || typeof data !== "object") return ""
  const d = data as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
      finishReason?: string
    }>
  }
  const parts = d.candidates?.[0]?.content?.parts
  if (!parts?.length) return ""
  return parts.map((p) => (typeof p.text === "string" ? p.text : "")).join("")
}

export async function geminiGenerateContent(
  opts: GeminiGenerateOptions
): Promise<GeminiGenerateResult> {
  const model = opts.model.trim()
  const url = `${API_ROOT}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(opts.apiKey)}`

  const body: Record<string, unknown> = {
    contents: [
      {
        role: "user",
        parts: [{ text: opts.userText }],
      },
    ],
    generationConfig: {
      maxOutputTokens: opts.maxOutputTokens ?? 2048,
    },
  }

  const sys = opts.systemInstruction?.trim()
  if (sys) {
    body.systemInstruction = { parts: [{ text: sys }] }
  }

  const payload = JSON.stringify(body)
  const attempts = max429Attempts()
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

    const parsed = parseGeminiErrorBody(raw)
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
    const d = data as { candidates?: Array<{ finishReason?: string }> }
    const reason = d?.candidates?.[0]?.finishReason ?? "NO_TEXT"
    return {
      ok: false,
      status: 200,
      message: `Empty reply (finish: ${reason})`,
    }
  }

  return { ok: true, text }
}
