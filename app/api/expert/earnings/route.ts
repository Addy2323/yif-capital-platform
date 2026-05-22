import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const expertProfile = await prisma.expertProfile.findUnique({ where: { userId } })
    if (!expertProfile) return NextResponse.json({ error: "Expert profile not found" }, { status: 404 })

    const expertId = expertProfile.id
    const now = new Date()

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    const [allCompleted, thisMonthBookings, lastMonthBookings, confirmedBookings, recentCompleted] =
      await Promise.all([
        prisma.expertBooking.aggregate({
          where: { expertId, status: "COMPLETED" },
          _sum: { price: true },
        }),
        prisma.expertBooking.aggregate({
          where: { expertId, status: "COMPLETED", scheduledDate: { gte: startOfThisMonth } },
          _sum: { price: true },
        }),
        prisma.expertBooking.aggregate({
          where: { expertId, status: "COMPLETED", scheduledDate: { gte: startOfLastMonth, lte: endOfLastMonth } },
          _sum: { price: true },
        }),
        prisma.expertBooking.aggregate({
          where: { expertId, status: "CONFIRMED" },
          _sum: { price: true },
        }),
        prisma.expertBooking.findMany({
          where: { expertId, status: "COMPLETED", scheduledDate: { gte: sixMonthsAgo } },
          select: { price: true, scheduledDate: true, id: true, sessionType: true, category: true },
          orderBy: { scheduledDate: "asc" },
        }),
      ])

    // Build monthly breakdown for last 6 months
    const monthlyMap = new Map<string, { earnings: number; sessions: number }>()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleString("en-US", { month: "short", year: "numeric" })
      monthlyMap.set(key, { earnings: 0, sessions: 0 })
    }

    for (const booking of recentCompleted) {
      const key = booking.scheduledDate.toLocaleString("en-US", { month: "short", year: "numeric" })
      if (monthlyMap.has(key)) {
        const entry = monthlyMap.get(key)!
        entry.earnings += booking.price
        entry.sessions += 1
      }
    }

    const monthlyBreakdown = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      earnings: data.earnings,
      sessions: data.sessions,
    }))

    const recentPayouts = recentCompleted
      .slice(-10)
      .reverse()
      .map((b) => ({
        id: b.id,
        amount: b.price,
        date: b.scheduledDate.toISOString(),
        status: "PAID",
        description: `${b.sessionType} session — ${b.category.replace(/_/g, " ")}`,
      }))

    return NextResponse.json({
      totalEarnings: allCompleted._sum.price ?? 0,
      thisMonth: thisMonthBookings._sum.price ?? 0,
      lastMonth: lastMonthBookings._sum.price ?? 0,
      monthlyBreakdown,
      recentPayouts,
      pendingEarnings: confirmedBookings._sum.price ?? 0,
    })
  } catch (error) {
    console.error("GET /api/expert/earnings error:", error)
    return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 })
  }
}
