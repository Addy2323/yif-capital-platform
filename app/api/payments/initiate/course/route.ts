import { NextRequest, NextResponse } from "next/server";
import { SnippeService } from "@/lib/services/snippe-service";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * POST /api/payments/initiate/course
 * Initiates a mobile money payment for a course enrollment via Snippe
 */
export async function POST(req: NextRequest) {
    try {
        const { courseId, phone, amount } = await req.json();

        // 1. Auth check
        const cookieStore = await cookies();
        const userId = cookieStore.get("user_id")?.value;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!courseId || !phone || !amount) {
            return NextResponse.json({ error: "Missing required fields: courseId, phone, amount" }, { status: 400 });
        }

        // 2. Verify course and user
        const [course, user] = await Promise.all([
            prisma.lmsCourse.findUnique({
                where: { id: courseId },
                select: { id: true, title: true, price: true }
            }),
            prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, email: true, name: true }
            })
        ]);

        if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // 3. Initiate Snippe Payment
        const result = await SnippeService.initiatePayment({
            userId,
            phone,
            amount: parseFloat(amount),
            plan: "COURSE",
            description: `Course: ${course.title}`,
            customerEmail: user.email,
            customerName: user.name || "Student"
        });

        // 4. Create pending LmsPayment record
        await prisma.lmsPayment.create({
            data: {
                userId,
                courseId: course.id,
                amount: parseFloat(amount),
                currency: "TZS",
                provider: "snippe",
                providerReference: result.reference,
                status: "pending",
                paymentType: "course",
                description: `Payment for course: ${course.title}`
            }
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("[INITIATE_COURSE_PAYMENT] Error:", error);
        return NextResponse.json({
            error: "Failed to initiate payment",
            message: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
