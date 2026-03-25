"use client"

import { useCallback, useState } from "react"

export type BulkSmsSendPayload = {
  groups: string[]
  message: string
  scheduleAt?: string | null
}

export type BulkSmsSendResponse = {
  ok: boolean
  recipientCount: number
  groups: string[]
  deliveredCount: number
  failedCount: number
  estimatedCostTzs: number
  scheduled: boolean
}

/**
 * Client hook for bulk SMS — calls secure Next.js API only (no Beem keys in the browser).
 */
export function useBulkSMS() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<BulkSmsSendResponse | null>(null)

  const send = useCallback(async (payload: BulkSmsSendPayload) => {
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const res = await fetch("/api/admin/bulk-sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groups: payload.groups,
          message: payload.message,
          scheduleAt: payload.scheduleAt ?? null,
        }),
      })
      const data = (await res.json()) as BulkSmsSendResponse & { error?: string }
      if (!res.ok) {
        const msg = data.error || "Failed to send SMS"
        setError(msg)
        return { error: msg } as const
      }
      setResponse(data as BulkSmsSendResponse)
      setError(null)
      return data as BulkSmsSendResponse
    } catch {
      setError("Network error")
      return { error: "Network error" } as const
    } finally {
      setLoading(false)
    }
  }, [])

  return { send, loading, error, response }
}
