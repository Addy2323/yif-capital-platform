import { NextRequest, NextResponse } from "next/server";
import { SnippeService } from "@/lib/services/snippe-service";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * POST /api/payments/initiate/booking
 * Initiates a mobile money payment for an expert booking via Snippe
 */
export async function POST(req: NextRequest) {
    try {
        const { bookingId, phone, amount } = await req.json();

        // 1. Auth check
        const cookieStore = await cookies();
        const userId = cookieStore.get("user_id")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!bookingId || !phone || !amount) {
            return NextResponse.json({ error: "Missing required fields: bookingId, phone, amount" }, { status: 400 });
        }

        // 2. Verify booking and user
        const [booking, user] = await Promise.all([
            prisma.expertBooking.findUnique({
                where: { id: bookingId },
                include: {
                    expert: {
                        include: { user: { select: { name: true } } }
                    }
                }
            }),
            prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, email: true, name: true }
            })
        ]);

        if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        if (booking.userId !== userId) return NextResponse.json({ error: "Unauthorized access to booking" }, { status: 403 });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // 3. Initiate Snippe Payment
        const result = await SnippeService.initiatePayment({
            userId,
            phone,
            amount: parseFloat(amount),
            plan: "BOOKING",
            description: `Expert Session: ${booking.expert.user.name}`,
            customerEmail: user.email,
            customerName: user.name || "Student",
            metadata: { bookingId: booking.id }
        });

        // 4. Create pending LmsPayment record and link to booking
        const payment = await prisma.lmsPayment.create({
            data: {
                userId,
                amount: parseFloat(amount),
                currency: "TZS",
                provider: "snippe",
                providerReference: result.reference,
                status: "pending",
                paymentType: "booking",
                description: `Expert Session with ${booking.expert.user.name}`
            }
        });

        // Update booking with paymentId
        await prisma.expertBooking.update({
            where: { id: bookingId },
            data: { paymentId: payment.id }
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("[INITIATE_BOOKING_PAYMENT] Error:", error);
        return NextResponse.json({
            error: "Failed to initiate payment",
            message: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
