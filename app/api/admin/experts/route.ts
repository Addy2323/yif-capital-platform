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

// GET all expert profiles with user info
export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") // PENDING, APPROVED, REJECTED, SUSPENDED

    const where = status ? { approvalStatus: status as any } : {}

    const experts = await prisma.expertProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phoneNumber: true, createdAt: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(experts)
  } catch (error) {
    console.error("Fetch experts error:", error)
    return NextResponse.json({ error: "Failed to fetch experts" }, { status: 500 })
  }
}

// POST - Create expert profile for a user (admin assigns expert role + creates profile)
export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { userId, bio, headline, experienceYears, specializations, hourlyRate, location, isAvailableOnline, isAvailablePhysical } = body

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    // Update user role to EXPERT
    await prisma.user.update({
      where: { id: userId },
      data: { role: "EXPERT" },
    })

    // Create expert profile
    const profile = await prisma.expertProfile.upsert({
      where: { userId },
      create: {
        userId,
        bio: bio || "",
        headline: headline || "",
        experienceYears: experienceYears || 0,
        specializations: specializations || [],
        hourlyRate: hourlyRate || 0,
        location: location || "",
        isAvailableOnline: isAvailableOnline ?? true,
        isAvailablePhysical: isAvailablePhysical ?? false,
        approvalStatus: "APPROVED",
      },
      update: {
        bio: bio || "",
        headline: headline || "",
        experienceYears: experienceYears || 0,
        specializations: specializations || [],
        hourlyRate: hourlyRate || 0,
        location: location || "",
        isAvailableOnline: isAvailableOnline ?? true,
        isAvailablePhysical: isAvailablePhysical ?? false,
        approvalStatus: "APPROVED",
      },
      include: {
        user: { select: { id: true, name: true, email: true, phoneNumber: true, createdAt: true } },
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Create expert error:", error)
    return NextResponse.json({ error: "Failed to create expert" }, { status: 500 })
  }
}
