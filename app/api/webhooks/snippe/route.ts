import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EnrollmentService } from "@/lib/services/enrollment-service";
import { SnippeService } from "@/lib/services/snippe-service";

/**
 * Webhook handler for Snippe Payment Gateway
 * Handles both:
 * 1. Subscription payments (upgrades user role to PRO)
 * 2. Session payments (grants access to specific session only)
 */
export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        console.log("Snippe Webhook Received:", rawBody);

        const body = JSON.parse(rawBody);
        const signature = req.headers.get("x-snippe-signature") || "";

        // 1. Verify Signature
        if (!SnippeService.verifySignature(rawBody, signature)) {
            console.warn("Invalid Snippe signature detected.");
            // In production: return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        // Handle both flat structure and nested data structure
        const data = body.data || body;
        const status = data.status || body.status;
        const reference = data.reference || body.reference || body.transaction_id;
        const metadata = data.metadata || body.metadata || {};
        const webhookAmount = data.amount?.value || data.amount || body.amount;
        const currency = data.amount?.currency || data.currency || body.currency || "TZS";
        const event = body.event;

        console.log("Parsed webhook data:", { status, reference, metadata, webhookAmount, event });

        // 2. Find existing payment by reference
        const existingPayment = await prisma.payment.findFirst({
            where: { providerReference: reference }
        });

        if (existingPayment && existingPayment.status === "success") {
            console.log("Payment already processed:", reference);
            return NextResponse.json({ message: "Already processed" }, { status: 200 });
        }

        // 3. Process successful payment
        if (status === "completed" || status === "success" || event === "payment.completed") {
            const userId = metadata?.userId;
            const plan = metadata?.plan || "SESSION";

            if (!userId) {
                console.error("No userId in metadata for transaction:", reference);
                return NextResponse.json({ error: "No userId in metadata" }, { status: 400 });
            }

            // Get the expected amount from our database
            let expectedAmount = 0;
            let sessionId: string | null = null;

            if (existingPayment) {
                expectedAmount = existingPayment.amount;
                sessionId = existingPayment.sessionId;
            }

            // Validate payment amount matches expected
            const paidAmount = parseFloat(webhookAmount) || 0;
            if (expectedAmount > 0 && paidAmount < expectedAmount) {
                console.error(`Payment amount mismatch: expected ${expectedAmount}, got ${paidAmount}`);
                // Update payment as failed due to insufficient amount
                if (existingPayment) {
                    await prisma.payment.update({
                        where: { id: existingPayment.id },
                        data: { status: "failed" }
                    });
                }
                return NextResponse.json({ error: "Insufficient payment amount" }, { status: 400 });
            }

            // Update or create payment record
            const payment = await prisma.payment.upsert({
                where: { providerReference: reference },
                update: {
                    status: "success",
                    completedAt: new Date(),
                },
                create: {
                    userId,
                    amount: paidAmount,
                    currency,
                    provider: "snippe",
                    providerReference: reference,
                    status: "success",
                    plan: plan.toUpperCase(),
                    sessionId,
                    completedAt: new Date(),
                },
            });

            // 4. Handle based on payment type
            if (plan.toUpperCase() === "SESSION" && sessionId) {
                // SESSION PAYMENT: Just mark payment as successful
                // User gets access to this specific session only
                console.log(`Session payment successful for user ${userId}, session ${sessionId}`);

            } else {
                // SUBSCRIPTION PAYMENT: Upgrade user role
                const courseId = metadata?.courseId || "academy-access";

                await EnrollmentService.createEnrollment(userId, courseId, payment.id);

                // Fetch user to check current role
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { role: true }
                });

                // Only update role if user is NOT an admin
                if (user && user.role !== 'ADMIN') {
                    await prisma.user.update({
                        where: { id: userId },
                        data: { role: (plan.toUpperCase() === 'INSTITUTIONAL' ? 'INSTITUTIONAL' : 'PRO') as any },
                    });
                }

                console.log(`Subscription payment successful for user ${userId}, plan ${plan}`);
            }

            return NextResponse.json({ message: "Payment processed successfully" }, { status: 200 });

        } else if (status === "failed" || event === "payment.failed") {
            // Handle failed payment
            if (existingPayment) {
                await prisma.payment.update({
                    where: { id: existingPayment.id },
                    data: { status: "failed" }
                });
            }
            console.log(`Payment failed for reference ${reference}`);
            return NextResponse.json({ message: "Payment failed recorded" }, { status: 200 });

        } else {
            console.log(`Payment event received: ${status || event} for reference ${reference}`);
            return NextResponse.json({ message: "Status received" }, { status: 200 });
        }
    } catch (error) {
        console.error("Snippe Webhook Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
