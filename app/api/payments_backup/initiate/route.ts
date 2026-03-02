import { NextRequest, NextResponse } from "next/server";
// import { SnippeService } from "@/lib/services/snippe-service";
// import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    console.log("POST /api/payments/initiate received");
    try {
        const { userId, phone, amount, plan, method } = await req.json();

        if (!userId || !phone || !amount || !plan) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        /*
        // 1. Get User Details
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 2. Initiate Snippe Payment
        const result = await SnippeService.initiatePayment({
            userId,
            phone,
            amount,
            plan: plan.toUpperCase(),
            description: `YIF Capital ${plan} Subscription`,
        });

        // 3. Create a pending payment record in our DB
        await prisma.payment.create({
            data: {
                userId,
                amount,
                currency: "TZS",
                provider: "snippe",
                providerReference: result.transactionId || result.reference,
                status: "pending",
                plan: plan.toUpperCase(),
            }
        });
        */

        const result = { success: true, transactionId: "msg-" + Date.now(), reference: "ref-" + Date.now() };

        return NextResponse.json(result);

    } catch (error) {
        console.error("Payment Initiation API Error:", error);
        return NextResponse.json({
            error: "Could not initiate payment",
            message: error instanceof Error ? error.message : "Contact support"
        }, { status: 500 });
    }
}
