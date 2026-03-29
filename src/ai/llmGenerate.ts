/**
 * Unified LLM text generation: Gemini and/or OpenAI with configurable order.
 * Env: AI_PROVIDER_ORDER = gemini_first (default) | openai_first
 */

import {
  geminiGenerateContent,
  getGeminiApiKey,
  resolveGeminiModelChain,
} from "./geminiGenerate"
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
  provider: "gemini" | "openai"
}

export type LlmGenerateFailure = {
  ok: false
  status: number
  message: string
}

export type LlmGenerateResult = LlmGenerateSuccess | LlmGenerateFailure

/** True if at least one of GEMINI_API_KEY / OPENAI_API_KEY is set. */
export function getAnyLlmApiKey(): boolean {
  return Boolean(getGeminiApiKey() || getOpenAiApiKey())
}

export function resolveProviderOrder(): Array<"gemini" | "openai"> {
  const o = process.env.AI_PROVIDER_ORDER?.trim().toLowerCase()
  if (o === "openai_first" || o === "openai") {
    return ["openai", "gemini"]
  }
  return ["gemini", "openai"]
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
    status === 502 ||
    status === 503
  )
}

/**
 * Tries each model in the primary provider chain, then the secondary provider
 * (if keys exist), until one returns non-empty text.
 */
export async function generateLlmContent(
  opts: LlmGenerateOptions
): Promise<LlmGenerateResult> {
  let lastStatus = 0
  let lastMessage = ""

  for (const provider of resolveProviderOrder()) {
    if (provider === "gemini") {
      const apiKey = getGeminiApiKey()
      if (!apiKey) continue
      const chain = resolveGeminiModelChain()
      for (let i = 0; i < chain.length; i++) {
        const model = chain[i]
        const hasMore = i < chain.length - 1
        const result = await geminiGenerateContent({
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
            return { ok: true, text: t, provider: "gemini" }
          }
          if (hasMore) continue
          break
        }
        lastStatus = result.status
        lastMessage = result.message
        if (shouldRetryModel(result.status, hasMore)) continue
        break
      }
    } else {
      const apiKey = getOpenAiApiKey()
      if (!apiKey) continue
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
    }
  }

  return {
    ok: false,
    status: lastStatus,
    message: lastMessage || "No LLM API keys configured or all providers failed.",
  }
}
