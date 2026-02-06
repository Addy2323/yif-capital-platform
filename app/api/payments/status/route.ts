import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET: Check the status of a specific payment by its reference
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const reference = searchParams.get("reference");

        if (!reference) {
            return NextResponse.json({ error: "Reference is required" }, { status: 400 });
        }

        const payment = await prisma.payment.findFirst({
            where: { providerReference: reference },
            select: {
                status: true,
                plan: true,
                amount: true,
                completedAt: true
            }
        });

        if (!payment) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        return NextResponse.json({
            status: payment.status,
            plan: payment.plan,
            amount: payment.amount,
            completedAt: payment.completedAt
        });

    } catch (error) {
        console.error("Payment Status API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
