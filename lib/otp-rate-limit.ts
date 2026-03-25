const WINDOW_MS = 60_000
const MAX_SENDS_PER_WINDOW = 3
const MAX_VERIFY_ATTEMPTS_PER_WINDOW = 10
const VERIFY_WINDOW_MS = 300_000

const sendBuckets = new Map<string, number[]>()
const verifyBuckets = new Map<string, number[]>()

function prune(arr: number[], now: number, windowMs: number): number[] {
  return arr.filter((t) => now - t < windowMs)
}

export function checkOtpSendRateLimit(phone: string): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now()
  let arr = prune(sendBuckets.get(phone) ?? [], now, WINDOW_MS)
  if (arr.length >= MAX_SENDS_PER_WINDOW) {
    const oldest = arr[0]!
    return { ok: false, retryAfterMs: WINDOW_MS - (now - oldest) }
  }
  arr.push(now)
  sendBuckets.set(phone, arr)
  return { ok: true }
}

/** Roll back last send slot if SMS failed after rate limit was consumed */
export function rollbackLastOtpSend(phone: string): void {
  const arr = sendBuckets.get(phone)
  if (!arr?.length) return
  arr.pop()
  if (arr.length === 0) sendBuckets.delete(phone)
  else sendBuckets.set(phone, arr)
}

export function recordVerifyAttempt(phone: string): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now()
  let arr = prune(verifyBuckets.get(phone) ?? [], now, VERIFY_WINDOW_MS)
  if (arr.length >= MAX_VERIFY_ATTEMPTS_PER_WINDOW) {
    const oldest = arr[0]!
    return { ok: false, retryAfterMs: VERIFY_WINDOW_MS - (now - oldest) }
  }
  arr.push(now)
  verifyBuckets.set(phone, arr)
  return { ok: true }
}

export function clearVerifyAttempts(phone: string): void {
  verifyBuckets.delete(phone)
}
