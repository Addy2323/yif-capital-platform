import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/user-session"
import { prisma } from "@/lib/prisma"
import { buildPortfolioInsight } from "@/lib/portfolio-insight-engine"
import { roleHasPremiumFeatures } from "@/lib/subscription-tier"

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json(
      { success: false, code: "AUTH_REQUIRED", show: false },
      { status: 401 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  if (!user) {
    return NextResponse.json(
      { success: false, code: "AUTH_REQUIRED", show: false },
      { status: 401 }
    )
  }

  const skipAi = !roleHasPremiumFeatures(String(user.role))
  const payload = await buildPortfolioInsight(userId, { skipAi })
  return NextResponse.json({ success: true, ...payload })
}
