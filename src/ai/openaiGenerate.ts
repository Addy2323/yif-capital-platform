import "server-only"

/**
 * OpenAI Chat Completions API (REST). Set OPENAI_API_KEY in server env only.
 * Never expose keys in browsers or mobile clients — route calls through this backend.
 * @see https://platform.openai.com/docs/api-reference/chat/create
 */

/** Widely available on standard OpenAI API keys (api.openai.com Chat Completions). */
export const DEFAULT_OPENAI_MODEL = "gpt-3.5-turbo"

/**
 * Tried after OPENAI_MODEL / OPENAI_MODEL_FALLBACK. Avoid deprecated ids (e.g. some `gpt-4-turbo` aliases 404).
 * Order: most broadly available first.
 */
export const OPENAI_BUILTIN_FALLBACKS: readonly string[] = [
  "gpt-3.5-turbo",
  "gpt-4o-mini",
  "gpt-4o",
]

export function resolveOpenAiModelChain(): string[] {
  const rawPrimary = process.env.OPENAI_MODEL?.trim()
  const primary =
    rawPrimary && rawPrimary.length > 0 ? rawPrimary : DEFAULT_OPENAI_MODEL
  const envFallback = process.env.OPENAI_MODEL_FALLBACK?.trim()
  const chain = [
    primary,
    ...(envFallback ? [envFallback] : []),
    ...OPENAI_BUILTIN_FALLBACKS,
  ]
  return chain.filter((m, i, a) => m.length > 0 && a.indexOf(m) === i)
}

export function getOpenAiApiKey(): string | undefined {
  const k = process.env.OPENAI_API_KEY?.trim()
  return k || undefined
}

const API_URL = "https://api.openai.com/v1/chat/completions"

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function max429Attempts(): number {
  const raw = process.env.OPENAI_429_RETRIES?.trim()
  const n = raw ? parseInt(raw, 10) : 2
  if (!Number.isFinite(n)) return 2
  return Math.min(5, Math.max(1, n))
}

export type OpenAiGenerateOptions = {
  apiKey: string
  model: string
  userText: string
  systemInstruction?: string
  maxOutputTokens?: number
  signal?: AbortSignal
}

export type OpenAiGenerateResult =
  | { ok: true; text: string }
  | { ok: false; status: number; message: string }

function parseOpenAiErrorBody(body: string): string {
  try {
    const j = JSON.parse(body) as { error?: { message?: string } }
    const m = j?.error?.message
    return typeof m === "string" ? m : ""
  } catch {
    return body.replace(/\s+/g, " ").trim().slice(0, 280)
  }
}

function extractAssistantText(data: unknown): string {
  if (!data || typeof data !== "object") return ""
  const d = data as {
    choices?: Array<{ message?: { content?: string | null } }>
  }
  const c = d.choices?.[0]?.message?.content
  return typeof c === "string" ? c : ""
}

export async function openaiChatGenerateContent(
  opts: OpenAiGenerateOptions
): Promise<OpenAiGenerateResult> {
  const model = opts.model.trim()
  const messages: Array<{ role: "system" | "user"; content: string }> = []
  const sys = opts.systemInstruction?.trim()
  if (sys) messages.push({ role: "system", content: sys })
  messages.push({ role: "user", content: opts.userText })

  const body: Record<string, unknown> = {
    model,
    messages,
    max_tokens: opts.maxOutputTokens ?? 2048,
  }

  const payload = JSON.stringify(body)
  const attempts = max429Attempts()
  let res: Response | undefined
  let raw = ""

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${opts.apiKey}`,
        },
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

    const parsed = parseOpenAiErrorBody(raw)
    return {
      ok: false,
      status: res.status,
      message: parsed || raw.replace(/\s+/g, " ").trim().slice(0, 280),
    }
  }

  if (!res) {
    return { ok: false, status: 0, message: "No response from OpenAI" }
  }

  let data: unknown
  try {
    data = JSON.parse(raw) as unknown
  } catch {
    return { ok: false, status: res.status, message: "Invalid JSON from OpenAI" }
  }

  const text = extractAssistantText(data).trim()
  if (!text) {
    const d = data as { error?: { message?: string } }
    const err = d?.error?.message
    if (typeof err === "string" && err) {
      return { ok: false, status: res.status, message: err.slice(0, 280) }
    }
    return {
      ok: false,
      status: 200,
      message: "Empty reply from OpenAI",
    }
  }

  return { ok: true, text }
}
