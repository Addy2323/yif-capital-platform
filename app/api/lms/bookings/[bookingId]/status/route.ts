import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * GET /api/lms/bookings/[bookingId]/status
 * Polls the booking status for payment confirmation.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ bookingId: string }> }
) {
    const { bookingId } = await params;

    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("user_id")?.value;
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const booking = await prisma.expertBooking.findUnique({
            where: { id: bookingId },
            select: {
                id: true,
                status: true,
                paymentId: true,
                userId: true,
                payment: {
                    select: {
                        status: true,
                        providerReference: true,
                    },
                },
            },
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        if (booking.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        return NextResponse.json({
            bookingStatus: booking.status,
            paymentStatus: booking.payment?.status ?? "pending",
        });
    } catch (error) {
        console.error("[BOOKING_STATUS] Error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
