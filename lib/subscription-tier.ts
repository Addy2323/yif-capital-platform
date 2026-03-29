/** Pro / Institutional / Admin unlock premium AI and research. Safe to import from client components. */

export const SUBSCRIBE_PLAN_URL = "/subscribe?plan=pro"

export function roleHasPremiumFeatures(role: string): boolean {
  const r = role.toUpperCase()
  return r === "PRO" || r === "INSTITUTIONAL" || r === "ADMIN"
}

export function authUserHasPremiumFeatures(user: {
  role: string
  subscription?: { plan: string }
} | null): boolean {
  if (!user) return false
  if (user.role === "admin") return true
  const plan = user.subscription?.plan
  return plan === "pro" || plan === "institutional"
}

export function loginRedirectUrl(returnPath: string): string {
  const q = returnPath.startsWith("/") ? returnPath : `/${returnPath}`
  return `/login?redirect=${encodeURIComponent(q)}`
}
