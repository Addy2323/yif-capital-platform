import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * Handle card payment simulation (Simplified)
 */
export async function POST(req: NextRequest) {
    try {
        const { amount, plan, cardNumber } = await req.json();

        // Get userId from cookies
        const cookieStore = await cookies();
        const userId = cookieStore.get("user_id")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Get User Details
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 2. Create success payment record directly (Simulation)
        const payment = await prisma.payment.create({
            data: {
                userId,
                amount: parseFloat(amount),
                currency: "TZS",
                provider: "card",
                providerReference: "CARD-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
                status: "success",
                plan: plan.toUpperCase(),
                completedAt: new Date()
            }
        });

        // 3. Update user role immediately for cards
        await prisma.user.update({
            where: { id: userId },
            data: {
                role: (plan.toUpperCase() === 'INSTITUTIONAL' ? 'INSTITUTIONAL' : 'PRO') as any
            }
        });

        return NextResponse.json({
            success: true,
            paymentId: payment.id,
            message: "Card payment successful"
        });

    } catch (error) {
        console.error("Card Payment API Error:", error);
        return NextResponse.json({
            error: "Payment failed",
            message: error instanceof Error ? error.message : "Internal error"
        }, { status: 500 });
    }
}
