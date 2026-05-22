import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const expertProfile = await prisma.expertProfile.findUnique({
      where: { userId },
      include: { availability: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] } },
    })
    if (!expertProfile) return NextResponse.json({ error: "Expert profile not found" }, { status: 404 })

    const days = DAY_NAMES.map((dayName, dayOfWeek) => {
      const slots = expertProfile.availability
        .filter((a) => a.dayOfWeek === dayOfWeek && a.isActive)
        .map((a) => ({ id: a.id, startTime: a.startTime, endTime: a.endTime }))

      return {
        dayOfWeek,
        dayName,
        isActive: slots.length > 0,
        slots,
      }
    })

    return NextResponse.json({
      days,
      isAvailableOnline: expertProfile.isAvailableOnline,
      isAvailablePhysical: expertProfile.isAvailablePhysical,
      physicalAddress: expertProfile.physicalAddress ?? "",
      defaultDuration: 60,
    })
  } catch (error) {
    console.error("GET /api/expert/availability error:", error)
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const expertProfile = await prisma.expertProfile.findUnique({ where: { userId } })
    if (!expertProfile) return NextResponse.json({ error: "Expert profile not found" }, { status: 404 })

    const body = await req.json()
    const { days, isAvailableOnline, isAvailablePhysical, physicalAddress } = body

    await prisma.expertAvailability.deleteMany({ where: { expertId: expertProfile.id } })

    const newSlots: {
      expertId: string
      dayOfWeek: number
      startTime: string
      endTime: string
      isActive: boolean
    }[] = []

    if (Array.isArray(days)) {
      for (const day of days) {
        if (day.isActive && Array.isArray(day.slots)) {
          for (const slot of day.slots) {
            newSlots.push({
              expertId: expertProfile.id,
              dayOfWeek: day.dayOfWeek,
              startTime: slot.startTime,
              endTime: slot.endTime,
              isActive: true,
            })
          }
        }
      }
    }

    if (newSlots.length > 0) {
      await prisma.expertAvailability.createMany({ data: newSlots })
    }

    await prisma.expertProfile.update({
      where: { id: expertProfile.id },
      data: {
        isAvailableOnline: isAvailableOnline ?? expertProfile.isAvailableOnline,
        isAvailablePhysical: isAvailablePhysical ?? expertProfile.isAvailablePhysical,
        physicalAddress: physicalAddress ?? expertProfile.physicalAddress,
      },
    })

    return NextResponse.json({ success: true, slotsCreated: newSlots.length })
  } catch (error) {
    console.error("POST /api/expert/availability error:", error)
    return NextResponse.json({ error: "Failed to update availability" }, { status: 500 })
  }
}
