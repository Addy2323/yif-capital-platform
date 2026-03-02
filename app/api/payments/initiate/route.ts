import { NextRequest, NextResponse } from "next/server";
import { SnippeService } from "@/lib/services/snippe-service";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * API route to initiate a mobile money payment via Snippe
 */
export async function POST(req: NextRequest) {
    try {
        const { phone, amount, plan, method } = await req.json();

        // Get userId from cookies (secure)
        const cookieStore = await cookies();
        const userId = cookieStore.get("user_id")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!phone || !amount || !plan) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Get User Details
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 2. Initiate Snippe Payment with user details
        const result = await SnippeService.initiatePayment({
            userId,
            phone,
            amount: parseFloat(amount),
            plan: plan.toUpperCase(),
            description: `YIF Capital ${plan} Subscription`,
            customerEmail: user.email,
            customerName: user.name || "Customer User"
        });

        // 3. Create a pending payment record in our DB
        await prisma.payment.create({
            data: {
                userId,
                amount: parseFloat(amount),
                currency: "TZS",
                provider: "snippe",
                providerReference: result.reference,
                status: "pending",
                plan: plan.toUpperCase(),
            }
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("Payment Initiation API Error:", error);
        return NextResponse.json({
            error: "Could not initiate payment",
            message: error instanceof Error ? error.message : "Contact support"
        }, { status: 500 });
    }
}
