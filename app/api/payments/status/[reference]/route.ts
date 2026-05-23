import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/payments/status/[reference]
 * Polls the payment status by provider reference.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ reference: string }> }
) {
    const { reference } = await params;

    try {
        const payment = await prisma.lmsPayment.findFirst({
            where: { providerReference: reference },
            select: {
                id: true,
                status: true,
                courseId: true,
                paymentType: true,
                completedAt: true,
            },
        });

        if (!payment) {
            return NextResponse.json({ status: "not_found" }, { status: 404 });
        }

        return NextResponse.json({
            status: payment.status,
            courseId: payment.courseId,
            paymentType: payment.paymentType,
            completedAt: payment.completedAt,
        });
    } catch (error) {
        console.error("[PAYMENT_STATUS] Error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
