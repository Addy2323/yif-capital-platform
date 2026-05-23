import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

/**
 * GET /api/lms/enrollments — Fetch user's enrolled courses with progress
 */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const enrollments = await prisma.lmsCourseEnrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: { select: { id: true } }
              }
            },
            expert: {
              include: {
                user: {
                  select: { id: true, name: true, avatar: true },
                },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    })

    // Robustness: if totalLessons is 0, calculate and update it
    const fixedEnrollments = await Promise.all(enrollments.map(async (e) => {
      if (e.totalLessons === 0) {
        const total = e.course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
        if (total > 0) {
          return await prisma.lmsCourseEnrollment.update({
            where: { id: e.id },
            data: { totalLessons: total },
            include: {
              course: {
                include: {
                  expert: {
                    include: {
                      user: { select: { id: true, name: true, avatar: true } }
                    }
                  }
                }
              }
            }
          });
        }
      }
      return e;
    }))

    return NextResponse.json(fixedEnrollments)
  } catch (error) {
    console.error("GET /api/lms/enrollments error:", error)
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 })
  }
}
