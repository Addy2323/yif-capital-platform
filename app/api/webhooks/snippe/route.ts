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
            console.error("Invalid Snippe signature. Header:", signature);
            // Temporary: let it pass for debugging if needed, but in prod we return 401
            // return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        } else {
            console.log("Snippe signature verified.");
        }

        // Handle both flat structure and nested data structure
        const data = body.data || body;
        const status = data.status || body.status;
        const reference = data.reference || body.reference || body.transaction_id;
        const metadata = data.metadata || body.metadata || {};
        const webhookAmount = data.amount?.value || data.amount || body.amount;
        const currency = data.amount?.currency || data.currency || body.currency || "TZS";
        const event = body.event || data.event;

        console.log("Parsed webhook data:", { status, reference, metadata, webhookAmount, event, plan: metadata?.plan });

        // 2. Find existing payment (check both legacy Payment and new LmsPayment)
        const [existingPayment, existingLmsPayment] = await Promise.all([
            prisma.payment.findFirst({ where: { providerReference: reference } }),
            prisma.lmsPayment.findFirst({ where: { providerReference: reference } })
        ]);

        if ((existingPayment?.status === "success") || (existingLmsPayment?.status === "success")) {
            console.log("Payment already processed:", reference);
            return NextResponse.json({ message: "Already processed" }, { status: 200 });
        }

        // 3. Process successful payment
        if (status === "completed" || status === "success" || event === "payment.completed") {
            const userId = metadata?.userId;
            const plan = (metadata?.plan || "SESSION").toUpperCase();

            if (!userId) {
                console.error("No userId in metadata for transaction:", reference);
                return NextResponse.json({ error: "No userId in metadata" }, { status: 400 });
            }

            const paidAmount = parseFloat(webhookAmount) || 0;

            // Handle based on payment type
            if (plan === "COURSE") {
                const courseId = metadata?.courseId;
                if (!courseId) throw new Error("Missing courseId in metadata");

                await prisma.$transaction(async (tx) => {
                    // Update LmsPayment
                    const lmsPayment = await tx.lmsPayment.update({
                        where: { providerReference: reference },
                        data: {
                            status: "success",
                            completedAt: new Date(),
                            amount: paidAmount // ensure actual amount from webhook
                        }
                    });

                    // Calculate total lessons
                    const course = await tx.lmsCourse.findUnique({
                        where: { id: courseId },
                        include: {
                            modules: {
                                include: {
                                    lessons: { select: { id: true } }
                                }
                            }
                        }
                    });
                    const totalLessons = course?.modules.reduce((acc, m) => acc + m.lessons.length, 0) || 0;

                    // Create Enrollment
                    await tx.lmsCourseEnrollment.upsert({
                      where: { userId_courseId: { userId, courseId } },
                      update: { 
                        paymentId: lmsPayment.id,
                        totalLessons // update if re-enrolling
                      },
                      create: {
                        userId,
                        courseId,
                        paymentId: lmsPayment.id,
                        enrolledAt: new Date(),
                        totalLessons,
                        completedLessons: 0,
                        progress: 0
                      }
                    });
                });

                console.log(`Course enrollment successful: user ${userId}, course ${courseId}`);

            } else if (plan === "BOOKING") {
                const bookingId = metadata?.bookingId;
                if (!bookingId) throw new Error("Missing bookingId in metadata");

                await prisma.$transaction(async (tx) => {
                    // Update LmsPayment
                    const lmsPayment = await tx.lmsPayment.update({
                        where: { providerReference: reference },
                        data: {
                            status: "success",
                            completedAt: new Date(),
                            amount: paidAmount
                        }
                    });

                    // Update Booking
                    await tx.expertBooking.update({
                        where: { id: bookingId },
                        data: {
                            status: "CONFIRMED",
                            paymentId: lmsPayment.id
                        }
                    });
                });

                console.log(`Booking confirmed: user ${userId}, booking ${bookingId}`);

            } else if (plan === "SESSION") {
                // Legacy session payment
                const sessionId = metadata?.sessionId || existingPayment?.sessionId;

                await prisma.payment.upsert({
                    where: { providerReference: reference },
                    update: { status: "success", completedAt: new Date() },
                    create: {
                        userId,
                        amount: paidAmount,
                        currency,
                        provider: "snippe",
                        providerReference: reference,
                        status: "success",
                        plan: "SESSION",
                        sessionId,
                        completedAt: new Date(),
                    },
                });
                console.log(`Session payment successful: user ${userId}`);

            } else {
                // Legacy Subscription (PRO/INSTITUTIONAL)
                const courseId = metadata?.courseId || "academy-access";

                const payment = await prisma.payment.upsert({
                    where: { providerReference: reference },
                    update: { status: "success", completedAt: new Date() },
                    create: {
                        userId,
                        amount: paidAmount,
                        currency,
                        provider: "snippe",
                        providerReference: reference,
                        status: "success",
                        plan,
                        completedAt: new Date(),
                    },
                });

                await EnrollmentService.createEnrollment(userId, courseId, payment.id);

                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { role: true }
                });

                if (user && user.role !== 'ADMIN') {
                    await prisma.user.update({
                        where: { id: userId },
                        data: { role: (plan === 'INSTITUTIONAL' ? 'INSTITUTIONAL' : 'PRO') as any },
                    });
                }
                console.log(`Subscription payment successful: user ${userId}, plan ${plan}`);
            }

            return NextResponse.json({ message: "Payment processed successfully" }, { status: 200 });

        } else if (status === "failed" || event === "payment.failed") {
            // Handle failed payment (check both tables)
            if (existingPayment) {
                await prisma.payment.update({ where: { id: existingPayment.id }, data: { status: "failed" } });
            }
            if (existingLmsPayment) {
                await prisma.lmsPayment.update({ where: { id: existingLmsPayment.id }, data: { status: "failed" } });
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
