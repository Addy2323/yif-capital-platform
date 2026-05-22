import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

async function getCurrentUserId() {
  const cookieStore = await cookies()
  return cookieStore.get("user_id")?.value || null
}

// GET — Fetch bookings for the current user (as learner or expert)
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const role = searchParams.get("role") || "user" // "user" or "expert"
    const status = searchParams.get("status") // PENDING, CONFIRMED, COMPLETED, CANCELLED

    let bookings

    if (role === "expert") {
      // Fetch expert's profile first
      const expertProfile = await prisma.expertProfile.findUnique({
        where: { userId },
        select: { id: true }
      })

      if (!expertProfile) {
        return NextResponse.json({ error: "No expert profile found" }, { status: 404 })
      }

      const where: any = { expertId: expertProfile.id }
      if (status) where.status = status

      bookings = await prisma.expertBooking.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, phoneNumber: true, avatar: true }
          }
        },
        orderBy: { scheduledDate: "desc" }
      })
    } else {
      // Fetch as learner/investor
      const where: any = { userId }
      if (status) where.status = status

      bookings = await prisma.expertBooking.findMany({
        where,
        include: {
          expert: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true }
              }
            }
          }
        },
        orderBy: { scheduledDate: "desc" }
      })
    }

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Fetch bookings error:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

// POST — Create a new booking (learner books an expert session)
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      expertId,
      sessionType,
      category,
      topic,
      scheduledDate,
      startTime,
      endTime,
      price,
      notes,
      location,
      paymentProvider
    } = body

    // Validate required fields
    if (!expertId || !sessionType || !category || !scheduledDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields: expertId, sessionType, category, scheduledDate, startTime, endTime" },
        { status: 400 }
      )
    }

    // Verify the expert exists and is approved
    const expert = await prisma.expertProfile.findUnique({
      where: { id: expertId },
      select: { id: true, approvalStatus: true, hourlyRate: true, currency: true }
    })

    if (!expert) {
      return NextResponse.json({ error: "Expert not found" }, { status: 404 })
    }

    if (expert.approvalStatus !== "APPROVED") {
      return NextResponse.json({ error: "Expert is not currently accepting bookings" }, { status: 400 })
    }

    // Generate a meeting URL for online sessions
    const bookingId = crypto.randomUUID()
    const meetingUrl =
      sessionType === "ONLINE" || sessionType === "VIP_PRIVATE"
        ? `/sessions/${bookingId}`
        : null

    // Create the booking
    const booking = await prisma.expertBooking.create({
      data: {
        id: bookingId,
        userId,
        expertId,
        sessionType: sessionType as any,
        category: category as any,
        topic: topic || null,
        scheduledDate: new Date(scheduledDate),
        startTime,
        endTime,
        price: price || expert.hourlyRate,
        currency: expert.currency,
        meetingUrl,
        location: location || null,
        notes: notes || null,
        status: "PENDING"
      },
      include: {
        expert: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    })

    // Create notification for the expert
    const expertUser = await prisma.expertProfile.findUnique({
      where: { id: expertId },
      select: { userId: true }
    })

    if (expertUser) {
      await prisma.notification.create({
        data: {
          userId: expertUser.userId,
          type: "BOOKING",
          title: "New Booking Request",
          message: `A new ${sessionType.toLowerCase()} consultation booking has been requested for ${new Date(scheduledDate).toLocaleDateString()}.`,
          actionUrl: `/expert/bookings`
        }
      })
    }

    return NextResponse.json({
      ...booking,
      bookingReference: `YIF-BK-${bookingId.substring(0, 5).toUpperCase()}`
    })
  } catch (error) {
    console.error("Create booking error:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
