import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const expertProfile = await prisma.expertProfile.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true, avatar: true, phoneNumber: true } } },
    })
    if (!expertProfile) return NextResponse.json({ error: "Expert profile not found" }, { status: 404 })

    return NextResponse.json(expertProfile)
  } catch (error) {
    console.error("GET /api/expert/settings error:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const expertProfile = await prisma.expertProfile.findUnique({ where: { userId } })
    if (!expertProfile) return NextResponse.json({ error: "Expert profile not found" }, { status: 404 })

    const body = await req.json()
    const { bio, headline, hourlyRate, location, languages, specializations } = body

    const updated = await prisma.expertProfile.update({
      where: { id: expertProfile.id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(headline !== undefined && { headline }),
        ...(hourlyRate !== undefined && { hourlyRate: Number(hourlyRate) }),
        ...(location !== undefined && { location }),
        ...(languages !== undefined && { languages }),
        ...(specializations !== undefined && { specializations }),
      },
      include: { user: { select: { id: true, name: true, email: true, avatar: true, phoneNumber: true } } },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/expert/settings error:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
