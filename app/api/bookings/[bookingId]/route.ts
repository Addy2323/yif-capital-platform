import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { bookingId } = await params

    const booking = await prisma.expertBooking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, phoneNumber: true } },
        expert: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
      },
    })

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

    const expertProfile = await prisma.expertProfile.findUnique({ where: { userId }, select: { id: true } })
    const isOwner = booking.userId === userId || (expertProfile && booking.expertId === expertProfile.id)
    if (!isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    return NextResponse.json(booking)
  } catch (error) {
    console.error("GET /api/bookings/[bookingId] error:", error)
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { bookingId } = await params

    const expertProfile = await prisma.expertProfile.findUnique({ where: { userId }, select: { id: true } })
    if (!expertProfile) return NextResponse.json({ error: "Expert profile not found" }, { status: 403 })

    const booking = await prisma.expertBooking.findUnique({ where: { id: bookingId } })
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    if (booking.expertId !== expertProfile.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await req.json()
    const { status, cancelReason, meetingUrl } = body

    let resolvedMeetingUrl = meetingUrl ?? booking.meetingUrl
    if (status === "CONFIRMED" && !resolvedMeetingUrl) {
      if (booking.sessionType === "ONLINE" || booking.sessionType === "VIP_PRIVATE") {
        resolvedMeetingUrl = `/sessions/${bookingId}`
      }
    }

    const updated = await prisma.expertBooking.update({
      where: { id: bookingId },
      data: {
        ...(status !== undefined && { status }),
        ...(cancelReason !== undefined && { cancelReason }),
        meetingUrl: resolvedMeetingUrl,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, phoneNumber: true } },
        expert: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
      },
    })

    if (status && status !== booking.status) {
      const notificationMessages: Record<string, { title: string; message: string }> = {
        CONFIRMED: {
          title: "Booking Confirmed",
          message: `Your consultation session on ${new Date(booking.scheduledDate).toLocaleDateString()} has been confirmed by the expert.`,
        },
        CANCELLED: {
          title: "Booking Cancelled",
          message: `Your consultation session on ${new Date(booking.scheduledDate).toLocaleDateString()} has been cancelled. ${cancelReason ? `Reason: ${cancelReason}` : ""}`,
        },
        COMPLETED: {
          title: "Session Completed",
          message: `Your consultation session on ${new Date(booking.scheduledDate).toLocaleDateString()} has been marked as completed. Thank you!`,
        },
      }

      const notif = notificationMessages[status]
      if (notif) {
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            type: "BOOKING",
            title: notif.title,
            message: notif.message,
            actionUrl: `/lms/bookings`,
          },
        })
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/bookings/[bookingId] error:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}
