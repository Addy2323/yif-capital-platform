import { NextRequest, NextResponse } from "next/server";
import { SnippeService } from "@/lib/services/snippe-service";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * API route to initiate a session-specific payment via Snippe
 * This is different from subscription payments - it uses the session's fixed price
 */
export async function POST(req: NextRequest) {
    try {
        const { sessionId, phone } = await req.json();

        // Get userId from cookies
        const cookieStore = await cookies();
        const userId = cookieStore.get("user_id")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!sessionId || !phone) {
            return NextResponse.json({ error: "Missing required fields: sessionId and phone" }, { status: 400 });
        }

        // 1. Get Session Details (with fixed price)
        const session = await prisma.liveSession.findUnique({
            where: { id: sessionId }
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        if (session.isFree) {
            return NextResponse.json({ error: "This session is free, no payment required" }, { status: 400 });
        }

        // 2. Check if user already paid for this session
        const existingPayment = await prisma.payment.findFirst({
            where: {
                userId,
                sessionId,
                status: "success"
            }
        });

        if (existingPayment) {
            return NextResponse.json({ error: "You have already paid for this session" }, { status: 400 });
        }

        // 3. Get User Details
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 4. Use the SESSION's fixed price (not editable by client)
        const amount = session.price;
        const currency = session.currency;

        // 5. Initiate Snippe Payment
        const result = await SnippeService.initiatePayment({
            userId,
            phone,
            amount,
            plan: "SESSION", // Mark as session payment, not subscription
            description: `Payment for: ${session.title}`,
            customerEmail: user.email,
            customerName: user.name || "Customer User"
        });

        // 6. Create a pending payment record linked to the session
        await prisma.payment.create({
            data: {
                userId,
                amount,
                currency,
                provider: "snippe",
                providerReference: result.reference,
                status: "pending",
                plan: "SESSION",
                sessionId: session.id // Link to specific session
            }
        });

        return NextResponse.json({
            success: true,
            reference: result.reference,
            message: "Payment initiated. Please check your phone for the prompt.",
            sessionTitle: session.title,
            amount,
            currency
        });

    } catch (error) {
        console.error("Session Payment API Error:", error);
        return NextResponse.json({
            error: "Could not initiate payment",
            message: error instanceof Error ? error.message : "Contact support"
        }, { status: 500 });
    }
}
