/** Format E.164 Tanzania mobile as +255 7XX XXX XXX */
export function formatTzPhoneDisplay(e164: string | null | undefined): string {
  if (!e164) return ""
  const d = e164.replace(/\D/g, "")
  if (d.length < 12 || !d.startsWith("255")) return e164.trim()
  const rest = d.slice(3, 12)
  if (rest.length !== 9) return e164.trim()
  return `+255 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`
}
