import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;

    // Get userId from cookies (secure)
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { amount, method, phone } = await req.json();

        if (!amount || !method) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 1. Verify session exists and is not free
        const session = await prisma.liveSession.findUnique({
            where: { id: sessionId }
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        if (session.isFree) {
            return NextResponse.json({ error: "This session is free" }, { status: 400 });
        }

        // 2. Create payment record
        // In a real app, we would initiate with Snippe here
        // For now, we'll create a successful payment record to allow access
        const payment = await prisma.payment.create({
            data: {
                userId,
                sessionId,
                amount: parseFloat(amount),
                currency: session.currency,
                provider: method,
                providerReference: "SESS-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
                status: "success", // Automatically success for simulation
                plan: "SESSION_ACCESS",
                completedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            paymentId: payment.id,
            message: "Payment successful"
        });

    } catch (error) {
        console.error("Session Payment API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
