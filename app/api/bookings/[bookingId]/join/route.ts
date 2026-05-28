import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { bbbCreateMeeting, bbbJoinUrl } from "@/lib/services/bbb-service"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { bookingId } = await params

  const booking = await prisma.expertBooking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { id: true, name: true } },
      expert: { include: { user: { select: { id: true, name: true } } } },
    },
  })

  if (!booking || booking.status !== "CONFIRMED") {
    return NextResponse.json({ error: "Booking not found or not confirmed" }, { status: 404 })
  }

  const isClient = booking.userId === userId
  const isExpert = booking.expert.userId === userId
  if (!isClient && !isExpert) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const meetingID = `yif-${bookingId.replace(/-/g, "").substring(0, 10)}`
  const sessionName = `YIF – ${booking.category.replace(/_/g, " ")}`
  const fullName = isExpert
    ? (booking.expert.user.name ?? "Expert")
    : (booking.user.name ?? "Client")

  try {
    await bbbCreateMeeting(meetingID, sessionName)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "BBB error"
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  return NextResponse.redirect(bbbJoinUrl(meetingID, fullName, isExpert))
}
