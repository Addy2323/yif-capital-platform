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

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    const [
      completedBookings,
      thisMonthBookings,
      lastMonthBookings,
      enrollments,
      activeEnrollments,
      completedSessionsCount,
      coursesCount,
      publishedCoursesCount,
      upcomingBookings,
      todayBookings,
      recentActivity,
      notifications,
      coursePayments,
      expertCourses,
    ] = await Promise.all([
      prisma.expertBooking.findMany({
        where: { expertId, status: "CONFIRMED" }, // User requested confirmed bookings
        select: { price: true },
      }),
      prisma.expertBooking.findMany({
        where: { expertId, status: "CONFIRMED", scheduledDate: { gte: startOfThisMonth } },
        select: { price: true },
      }),
      prisma.expertBooking.findMany({
        where: { expertId, status: "CONFIRMED", scheduledDate: { gte: startOfLastMonth, lte: endOfLastMonth } },
        select: { price: true },
      }),
      prisma.lmsCourseEnrollment.findMany({
        where: { course: { expertId } },
        select: { userId: true, isCompleted: true, courseId: true },
      }),
      prisma.lmsCourseEnrollment.count({ where: { course: { expertId }, isCompleted: false } }),
      prisma.expertBooking.count({ where: { expertId, status: "CONFIRMED" } }),
      prisma.lmsCourse.count({ where: { expertId } }),
      prisma.lmsCourse.count({ where: { expertId, status: "PUBLISHED" } }),
      prisma.expertBooking.findMany({
        where: {
          expertId,
          scheduledDate: { gte: now },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        include: { user: { select: { id: true, name: true, email: true, avatar: true, phoneNumber: true } } },
        orderBy: { scheduledDate: "asc" },
        take: 5,
      }),
      prisma.expertBooking.findMany({
        where: {
          expertId,
          scheduledDate: { gte: todayStart, lte: todayEnd },
        },
        include: { user: { select: { id: true, name: true, email: true, avatar: true, phoneNumber: true } } },
        orderBy: { startTime: "asc" },
      }),
      prisma.lmsCourseEnrollment.findMany({
        where: { course: { expertId } },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          course: { select: { id: true, title: true, slug: true } },
        },
        orderBy: { enrolledAt: "desc" },
        take: 10,
      }),
      prisma.notification.findMany({
        where: { userId, isRead: false },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.lmsPayment.findMany({
        where: { 
          paymentType: "course", 
          status: "success", 
          course: { expertId } 
        },
        select: { amount: true, courseId: true, completedAt: true }
      }),
      prisma.lmsCourse.findMany({
        where: { expertId },
        select: { id: true, title: true, price: true }
      })
    ])

    const bookingEarnings = completedBookings.reduce((sum, b) => sum + b.price, 0)
    const courseEarnings = coursePayments.reduce((sum, p) => sum + p.amount, 0)
    const totalEarnings = bookingEarnings + courseEarnings

    const thisMonthCourseEarnings = coursePayments
      .filter(p => p.completedAt && p.completedAt >= startOfThisMonth)
      .reduce((sum, p) => sum + p.amount, 0)
    const lastMonthCourseEarnings = coursePayments
      .filter(p => p.completedAt && p.completedAt >= startOfLastMonth && p.completedAt <= endOfLastMonth)
      .reduce((sum, p) => sum + p.amount, 0)

    const earningsThisMonth = thisMonthBookings.reduce((sum, b) => sum + b.price, 0) + thisMonthCourseEarnings
    const earningsLastMonth = lastMonthBookings.reduce((sum, b) => sum + b.price, 0) + lastMonthCourseEarnings

    let earningsChange = "+0%"
    if (earningsLastMonth > 0) {
      const pct = ((earningsThisMonth - earningsLastMonth) / earningsLastMonth) * 100
      earningsChange = `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`
    } else if (earningsThisMonth > 0) {
      earningsChange = "+100%"
    }

    const uniqueStudentIds = new Set(enrollments.map((e) => e.userId))

    const courseAnalytics = expertCourses.map(course => {
      const courseEnrollments = enrollments.filter(e => e.courseId === course.id)
      const courseRevenue = coursePayments
        .filter(p => p.courseId === course.id)
        .reduce((sum, p) => sum + p.amount, 0)
      
      return {
        id: course.id,
        title: course.title,
        students: courseEnrollments.length,
        revenue: courseRevenue
      }
    })

    return NextResponse.json({
      stats: {
        totalEarnings,
        earningsThisMonth,
        earningsChange,
        totalStudents: uniqueStudentIds.size,
        activeStudents: activeEnrollments,
        completedSessions: completedSessionsCount,
        totalCourses: coursesCount,
        publishedCourses: publishedCoursesCount,
        rating: expertProfile.rating,
      },
      courseAnalytics,
      upcomingBookings,
      todayBookings,
      recentActivity,
      notifications,
    })
  } catch (error) {
    console.error("GET /api/expert/dashboard error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
