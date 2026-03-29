import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/user-session"
import { roleHasPremiumFeatures, SUBSCRIBE_PLAN_URL } from "@/lib/subscription-tier"

export type PremiumApiAccess =
  | { ok: true; userId: string; role: string }
  | {
      ok: false
      reason: "not_logged_in" | "subscription_required"
      status: 401 | 403
      body: {
        success: false
        code: string
        error: string
        subscribeUrl: string
      }
    }

export async function requirePremiumForApi(): Promise<PremiumApiAccess> {
  const userId = await getSessionUserId()
  if (!userId) {
    return {
      ok: false,
      reason: "not_logged_in",
      status: 401,
      body: {
        success: false,
        code: "AUTH_REQUIRED",
        error: "Log in to use this feature.",
        subscribeUrl: `/login?redirect=${encodeURIComponent(SUBSCRIBE_PLAN_URL)}`,
      },
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) {
    return {
      ok: false,
      reason: "not_logged_in",
      status: 401,
      body: {
        success: false,
        code: "AUTH_REQUIRED",
        error: "Session expired. Please log in again.",
        subscribeUrl: `/login?redirect=${encodeURIComponent(SUBSCRIBE_PLAN_URL)}`,
      },
    }
  }

  const roleStr = String(user.role)
  if (!roleHasPremiumFeatures(roleStr)) {
    return {
      ok: false,
      reason: "subscription_required",
      status: 403,
      body: {
        success: false,
        code: "SUBSCRIPTION_REQUIRED",
        error: "Subscribe to unlock this feature.",
        subscribeUrl: SUBSCRIBE_PLAN_URL,
      },
    }
  }

  return { ok: true, userId, role: roleStr }
}
