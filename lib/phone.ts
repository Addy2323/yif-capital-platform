/** E.164: + followed by 1–15 digits (ITU-T E.164 max length 15) */
const E164_REGEX = /^\+[1-9]\d{1,14}$/

/** Tanzania mobile: 9 digits after +255, usually starts with 6 or 7 */
const TZ_AFTER_255 = /^[67]\d{8}$/

export function isValidE164(phone: string): boolean {
  const trimmed = phone.trim().replace(/\s/g, "")
  return E164_REGEX.test(trimmed)
}

/** Normalize to E.164 (strip spaces only; caller should include country code). */
export function normalizeE164(phone: string): string {
  return phone.trim().replace(/\s/g, "")
}

/**
 * Build E.164 for Tanzania from the 9 digits after country code (no 255 / no leading 0).
 */
export function e164FromTzLocalDigits(localDigits: string): string | null {
  const d = localDigits.replace(/\D/g, "")
  if (d.length !== 9 || !TZ_AFTER_255.test(d)) return null
  const e164 = `+255${d}`
  return isValidE164(e164) ? e164 : null
}

/**
 * Accepts common Tanzania formats and full international E.164.
 * Examples: 0712345678, 712345678, 255712345678, +255712345678, 0712 345 678
 */
export function normalizePhoneInputToE164(
  raw: string
): { ok: true; e164: string } | { ok: false; error: string } {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { ok: false, error: "Enter your phone number" }
  }

  if (trimmed.startsWith("+")) {
    const n = normalizeE164(trimmed)
    if (isValidE164(n)) return { ok: true, e164: n }
    return { ok: false, error: "Invalid international number" }
  }

  const digits = trimmed.replace(/\D/g, "")

  // 255 + 9 digits (12 total)
  if (digits.length === 12 && digits.startsWith("255")) {
    const rest = digits.slice(3)
    if (TZ_AFTER_255.test(rest)) {
      const e164 = `+255${rest}`
      if (isValidE164(e164)) return { ok: true, e164 }
    }
  }

  // Local: 0712345678
  if (digits.length === 10 && digits.startsWith("0")) {
    const rest = digits.slice(1)
    if (TZ_AFTER_255.test(rest)) {
      const e164 = `+255${rest}`
      if (isValidE164(e164)) return { ok: true, e164 }
    }
  }

  // 712345678 (9 digits, no leading 0)
  if (digits.length === 9 && TZ_AFTER_255.test(digits)) {
    const e164 = `+255${digits}`
    if (isValidE164(e164)) return { ok: true, e164 }
  }

  return {
    ok: false,
    error:
      "Enter a valid Tanzania mobile number (e.g. 0712… or 712…), or use + and your full number",
  }
}

/**
 * For the "+255" prefix field: extract up to 9 national digits from typing or paste
 * (handles 0712…, 255712…, +255712…, etc.).
 */
export function tzLocalDigitsFromPasteOrInput(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.startsWith("+")) {
    const r = normalizePhoneInputToE164(trimmed)
    if (r.ok && r.e164.startsWith("+255")) {
      return r.e164.slice(4)
    }
  }
  const d = raw.replace(/\D/g, "")
  if (d.length >= 12 && d.startsWith("255")) {
    return d.slice(-9)
  }
  if (d.length === 10 && d.startsWith("0")) {
    return d.slice(1, 10)
  }
  return d.slice(0, 9)
}

/**
 * Mask for display, e.g. +255 7** *** 678
 */
export function maskPhoneE164(e164: string): string {
  const normalized = normalizeE164(e164)
  const m = normalized.match(/^(\+\d{1,3})(\d)(\d+)(\d{3})$/)
  if (!m) {
    const last3 = normalized.slice(-3)
    return last3.length === 3 ? `*** *** ${last3}` : "***"
  }
  return `${m[1]} ${m[2]}** *** ${m[4]}`
}
