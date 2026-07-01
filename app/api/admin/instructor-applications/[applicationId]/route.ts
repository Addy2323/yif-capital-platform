import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

async function isAdmin(req: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value
  if (!userId) return false
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  return user?.role === "ADMIN"
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ applicationId: string }> }
) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { applicationId } = await context.params
    const { status, adminNote } = await req.json()

    if (!status) {
      return NextResponse.json({ error: "status is required" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const adminUserId = cookieStore.get("user_id")?.value

    const application = await prisma.instructorApplication.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const updated = await prisma.instructorApplication.update({
      where: { id: applicationId },
      data: {
        status,
        adminNote: adminNote !== undefined ? adminNote : application.adminNote,
        reviewedBy: adminUserId || null,
        reviewedAt: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    // If status is APPROVED, promote the user to EXPERT and create/update their ExpertProfile
    if (status === "APPROVED") {
      // 1. Promote User role
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: "EXPERT" },
      })

      // 2. Create or update ExpertProfile
      const spec = application.courseCategory
      await prisma.expertProfile.upsert({
        where: { userId: application.userId },
        create: {
          userId: application.userId,
          bio: application.motivation || "",
          headline: `${application.occupation} & Instructor`,
          experienceYears: application.experienceYears,
          specializations: [spec as any],
          hourlyRate: 50000, // Default rate
          location: "Dar es Salaam", // Default location
          cvUrl: application.cvUrl,
          certificationsUrl: application.certificatesUrl,
          approvalStatus: "APPROVED",
        },
        update: {
          bio: application.motivation || "",
          headline: `${application.occupation} & Instructor`,
          experienceYears: application.experienceYears,
          specializations: [spec as any],
          cvUrl: application.cvUrl,
          certificationsUrl: application.certificatesUrl,
          approvalStatus: "APPROVED",
        },
      })
    } else if (status === "REJECTED") {
      // Keep or revert user role to FREE
      // Check if user is currently EXPERT (just in case they were demoted)
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: "FREE" },
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update application error:", error)
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }
}
