"use client"

import { useMemo } from "react"
import type { User } from "@/lib/auth-context"

/** Same default as server `PHONE_COLLECTION_CUTOFF_DATE` — set NEXT_PUBLIC_PHONE_COLLECTION_CUTOFF_DATE to match server if you override. */
function getCutoffDate(): Date {
  const raw =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_PHONE_COLLECTION_CUTOFF_DATE
      ? process.env.NEXT_PUBLIC_PHONE_COLLECTION_CUTOFF_DATE
      : "2025-03-25T00:00:00.000Z"
  return new Date(raw)
}

/**
 * Whether the post-login phone prompt should appear for this user.
 * Pre-existing = account created before rollout cutoff; never for admins; never if phone set;
 * hidden if "remind me later" was used today (lastPhonePromptDate === today).
 */
export function useShouldShowPhonePrompt(user: User | null): boolean {
  return useMemo(() => {
    if (!user) return false
    if (user.role === "admin") return false
    const phone = user.phoneNumber?.trim()
    if (phone) return false

    const created = new Date(user.createdAt)
    if (created.getTime() >= getCutoffDate().getTime()) return false

    const todayStr = new Date().toISOString().slice(0, 10)
    const lastStr = user.lastPhonePromptDate?.slice(0, 10) ?? null
    if (lastStr === todayStr) return false

    return true
  }, [user])
}
