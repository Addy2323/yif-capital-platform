import "server-only"

/**
 * OpenAI-only LLM text generation (Chat Completions). Server-side only.
 * Set OPENAI_API_KEY — never use NEXT_PUBLIC_* for secrets.
 */

import {
  getOpenAiApiKey,
  openaiChatGenerateContent,
  resolveOpenAiModelChain,
} from "./openaiGenerate"

export type LlmGenerateOptions = {
  userText: string
  systemInstruction?: string
  maxOutputTokens?: number
  signal?: AbortSignal
}

export type LlmGenerateSuccess = {
  ok: true
  text: string
  provider: "openai"
}

export type LlmGenerateFailure = {
  ok: false
  status: number
  message: string
}

export type LlmGenerateResult = LlmGenerateSuccess | LlmGenerateFailure

/** True if OPENAI_API_KEY is set. */
export function getAnyLlmApiKey(): boolean {
  return Boolean(getOpenAiApiKey())
}

function shouldRetryModel(
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

/**
 * Tries each model in OPENAI_MODEL chain until one returns non-empty text.
 */
export async function generateLlmContent(
  opts: LlmGenerateOptions
): Promise<LlmGenerateResult> {
  const apiKey = getOpenAiApiKey()
  if (!apiKey) {
    return {
      ok: false,
      status: 0,
      message: "OPENAI_API_KEY is not set.",
    }
  }

  let lastStatus = 0
  let lastMessage = ""
  const chain = resolveOpenAiModelChain()

  for (let i = 0; i < chain.length; i++) {
    const model = chain[i]
    const hasMore = i < chain.length - 1
    const result = await openaiChatGenerateContent({
      apiKey,
      model,
      userText: opts.userText,
      systemInstruction: opts.systemInstruction,
      maxOutputTokens: opts.maxOutputTokens,
      signal: opts.signal,
    })
    if (result.ok) {
      const t = result.text.trim()
      if (t) {
        return { ok: true, text: t, provider: "openai" }
      }
      if (hasMore) continue
      break
    }
    lastStatus = result.status
    lastMessage = result.message
    if (shouldRetryModel(result.status, hasMore)) continue
    break
  }

  return {
    ok: false,
    status: lastStatus,
    message:
      lastMessage ||
      "OpenAI request failed for every model in the chain. Check OPENAI_API_KEY and OPENAI_MODEL.",
  }
}
