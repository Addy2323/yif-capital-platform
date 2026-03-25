/**
 * Users with createdAt **strictly before** this instant are considered "pre-existing"
 * and may be prompted to add a phone number (if missing).
 * Set `PHONE_COLLECTION_CUTOFF_DATE` to the exact moment the phone-on-registration
 * rollout went live (ISO 8601). Defaults match the initial production rollout window.
 */
export function getPhoneCollectionCutoff(): Date {
  const raw = process.env.PHONE_COLLECTION_CUTOFF_DATE
  if (raw) {
    const d = new Date(raw)
    if (!Number.isNaN(d.getTime())) return d
  }
  return new Date("2026-03-25T00:00:00.000Z")
}

export function isPreExistingUser(createdAt: Date): boolean {
  return createdAt.getTime() < getPhoneCollectionCutoff().getTime()
}

export type PhonePromptUserFields = {
  role: string
  phoneNumber: string | null
  createdAt: Date
  lastPhonePromptDate: Date | null
}

/**
 * Single source of truth for whether the post-login phone dialog should show.
 * Call from session + login APIs so the client does not depend on matching
 * NEXT_PUBLIC_* dates with the server.
 */
export function computeShouldShowPhonePrompt(u: PhonePromptUserFields): boolean {
  const r = u.role.toLowerCase()
  if (r === "admin") return false
  if (u.phoneNumber?.trim()) return false
  if (!isPreExistingUser(u.createdAt)) return false

  const todayStr = new Date().toISOString().slice(0, 10)
  const lastStr = u.lastPhonePromptDate
    ? u.lastPhonePromptDate.toISOString().slice(0, 10)
    : null
  if (lastStr === todayStr) return false

  return true
}
