import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

/**
 * GET /api/lms/certificates — Fetch user's earned certificates
 */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            expert: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    })

    // Map DB objects to the expected format in UI
    const mapped = certificates.map((c) => ({
      id: c.id,
      code: c.certificateCode,
      courseTitle: c.course.title,
      courseCategory: c.course.category,
      expertName: c.course.expert?.user?.name || "YIF Capital Academy Expert",
      studentName: cookieStore.get("user_name")?.value || "Student",
      issuedAt: c.issuedAt.toISOString().split("T")[0],
      grade: "Distinction", // Default grade/score if not detailed in db
      score: 100,
      totalLessons: 10,
      completedLessons: 10,
      duration: "3 hours",
      qrVerificationUrl: c.qrCodeData || `https://verify.yifcapital.co.tz/cert/${c.certificateCode}`
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("GET /api/lms/certificates error:", error)
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 })
  }
}
