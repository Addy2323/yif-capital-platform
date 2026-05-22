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

    const enrollments = await prisma.lmsCourseEnrollment.findMany({
      where: { course: { expertId: expertProfile.id } },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { enrolledAt: "desc" },
    })

    const studentMap = new Map<
      string,
      {
        userId: string
        name: string
        email: string
        avatar: string | null
        enrolledCourses: string[]
        progressValues: number[]
        isCompleted: boolean
        enrolledAt: string
      }
    >()

    for (const enrollment of enrollments) {
      const uid = enrollment.userId
      if (!studentMap.has(uid)) {
        studentMap.set(uid, {
          userId: uid,
          name: enrollment.user.name,
          email: enrollment.user.email,
          avatar: enrollment.user.avatar,
          enrolledCourses: [],
          progressValues: [],
          isCompleted: true,
          enrolledAt: enrollment.enrolledAt.toISOString(),
        })
      }
      const student = studentMap.get(uid)!
      student.enrolledCourses.push(enrollment.course.title)
      student.progressValues.push(enrollment.progress)
      if (!enrollment.isCompleted) student.isCompleted = false
    }

    const students = Array.from(studentMap.values()).map((s) => ({
      userId: s.userId,
      name: s.name,
      email: s.email,
      avatar: s.avatar,
      enrolledCourses: s.enrolledCourses,
      totalProgress:
        s.progressValues.length > 0
          ? Math.round(s.progressValues.reduce((a, b) => a + b, 0) / s.progressValues.length)
          : 0,
      isCompleted: s.isCompleted,
      enrolledAt: s.enrolledAt,
    }))

    return NextResponse.json(students)
  } catch (error) {
    console.error("GET /api/expert/students error:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}
