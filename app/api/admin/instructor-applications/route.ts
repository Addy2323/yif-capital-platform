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

// GET all instructor applications with user info
export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") // PENDING, UNDER_REVIEW, APPROVED, REJECTED, MORE_INFO

    const where = status ? { status: status as any } : {}

    const applications = await prisma.instructorApplication.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phoneNumber: true, avatar: true } },
        reviewer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Fetch applications error:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}
