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
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    const [bookingStats, courseStats, confirmedBookingStats, recentBookings, courseEnrollments] =
      await Promise.all([
        // Completed Bookings
        prisma.expertBooking.aggregate({
          where: { expertId, status: { in: ["CONFIRMED", "COMPLETED"] } },
          _sum: { price: true },
        }),
        // Course Payments
        prisma.lmsPayment.aggregate({
          where: { 
            course: { expertId },
            status: "success",
            paymentType: "course"
          },
          _sum: { amount: true },
        }),
        // Monthly Bookings
        prisma.expertBooking.aggregate({
          where: { 
            expertId, 
            status: { in: ["CONFIRMED", "COMPLETED"] }, 
            scheduledDate: { gte: startOfThisMonth } 
          },
          _sum: { price: true },
        }),
        // List for Monthly Breakdown
        prisma.expertBooking.findMany({
          where: { 
            expertId, 
            status: { in: ["CONFIRMED", "COMPLETED"] }, 
            scheduledDate: { gte: sixMonthsAgo } 
          },
          select: { price: true, scheduledDate: true, id: true, sessionType: true, category: true },
          orderBy: { scheduledDate: "asc" },
        }),
        // List Course Payments for Monthly Breakdown
        prisma.lmsPayment.findMany({
           where: {
               course: { expertId },
               status: "success",
               paymentType: "course",
               completedAt: { gte: sixMonthsAgo }
           },
           select: { amount: true, completedAt: true, id: true, description: true },
           orderBy: { completedAt: "asc" }
        })
      ])

    // Sum everything
    const totalGross = (bookingStats._sum.price ?? 0) + (courseStats._sum.amount ?? 0);
    const thisMonthGross = (confirmedBookingStats._sum.price ?? 0); 

    // Add course payments this month to thisMonthGross
    const courseStatsThisMonth = await prisma.lmsPayment.aggregate({
        where: {
            course: { expertId },
            status: "success",
            paymentType: "course",
            completedAt: { gte: startOfThisMonth }
        },
        _sum: { amount: true }
    });
    const totalThisMonthGross = thisMonthGross + (courseStatsThisMonth._sum.amount ?? 0);

    // Build monthly breakdown
    const monthlyMap = new Map<string, { earnings: number; sessions: number }>()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleString("en-US", { month: "short", year: "numeric" })
      monthlyMap.set(key, { earnings: 0, sessions: 0 })
    }

    // Add bookings to breakdown
    for (const booking of recentBookings) {
      const key = booking.scheduledDate.toLocaleString("en-US", { month: "short", year: "numeric" })
      if (monthlyMap.has(key)) {
        const entry = monthlyMap.get(key)!
        entry.earnings += booking.price
        entry.sessions += 1
      }
    }
    // Add courses to breakdown
    for (const payment of courseEnrollments) {
        if (!payment.completedAt) continue;
        const key = payment.completedAt.toLocaleString("en-US", { month: "short", year: "numeric" })
        if (monthlyMap.has(key)) {
            const entry = monthlyMap.get(key)!
            entry.earnings += payment.amount
        }
    }

    const monthlyBreakdown = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      earnings: data.earnings,
      sessions: data.sessions,
    }))

    // Pending earnings = Total Gross minus Payout Requests?
    const requestedSum = await prisma.payoutRequest.aggregate({
        where: { expertId },
        _sum: { amount: true }
    });
    const pendingToRequest = Math.max(0, totalGross - (requestedSum._sum.amount ?? 0));

    return NextResponse.json({
      totalEarnings: totalGross,
      thisMonth: totalThisMonthGross,
      lastMonth: 0, 
      monthlyBreakdown,
      recentPayouts: [], 
      pendingEarnings: pendingToRequest,
    })
  } catch (error) {
    console.error("GET /api/expert/earnings error:", error)
    return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 })
  }
}
