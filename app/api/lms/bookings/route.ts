import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * GET /api/lms/bookings — Get user's bookings or expert's bookings
 */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role"); // "user" or "expert"

    let bookings;

    if (role === "expert") {
      // Expert viewing their bookings
      const expert = await prisma.expertProfile.findUnique({
        where: { userId },
      });
      if (!expert) {
        return NextResponse.json({ error: "Expert profile not found" }, { status: 404 });
      }

      bookings = await prisma.expertBooking.findMany({
        where: { expertId: expert.id },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
        orderBy: { scheduledDate: "desc" },
      });
    } else {
      // User viewing their bookings
      bookings = await prisma.expertBooking.findMany({
        where: { userId },
        include: {
          expert: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
        },
        orderBy: { scheduledDate: "desc" },
      });
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("GET /api/lms/bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

/**
 * POST /api/lms/bookings — Create a new booking
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      expertId,
      sessionType,
      category,
      topic,
      scheduledDate,
      startTime,
      endTime,
      notes,
    } = body;

    if (!expertId || !sessionType || !category || !scheduledDate || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get expert profile and pricing
    const expert = await prisma.expertProfile.findUnique({
      where: { id: expertId },
    });

    if (!expert || expert.approvalStatus !== "APPROVED") {
      return NextResponse.json({ error: "Expert not found or not approved" }, { status: 404 });
    }

    // Calculate price based on session type
    let price = expert.hourlyRate;
    if (sessionType === "VIP_PRIVATE") price = expert.hourlyRate * 2;
    if (sessionType === "GROUP") price = expert.hourlyRate * 0.5;

    // Generate meeting URL for online sessions
    let meetingUrl = null;
    if (sessionType === "ONLINE" || sessionType === "GROUP" || sessionType === "VIP_PRIVATE") {
      const roomId = `yif-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      meetingUrl = `https://meet.yifcapital.co.tz/rooms/${roomId}`;
    }

    const booking = await prisma.expertBooking.create({
      data: {
        userId,
        expertId,
        sessionType,
        category,
        topic,
        scheduledDate: new Date(scheduledDate),
        startTime,
        endTime,
        price: price || 0,
        currency: expert.currency,
        meetingUrl,
        location: sessionType === "PHYSICAL" ? expert.physicalAddress : null,
        notes,
        status: (price && price > 0) ? "PENDING" : "CONFIRMED",
      },
      include: {
        expert: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("POST /api/lms/bookings error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
