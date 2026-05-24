import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * POST /api/lms/courses/[courseId]/enroll — Enroll user in a course
 * For free courses: instant enrollment
 * For paid courses: requires payment reference
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const course = await prisma.lmsCourse.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: { _count: { select: { lessons: true } } },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if enrollment deadline has passed
    if (course.enrollmentDeadline && new Date() > new Date(course.enrollmentDeadline)) {
      return NextResponse.json({ error: "Enrollment for this course has closed." }, { status: 400 });
    }

    // Check if already enrolled
    const existing = await prisma.lmsCourseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existing) {
      return NextResponse.json({ message: "Already enrolled", enrollment: existing });
    }

    // For paid courses, check payment
    if (!course.isFree && course.price > 0) {
      const body = await req.json().catch(() => ({}));
      const { paymentId } = body;

      if (!paymentId) {
        return NextResponse.json({
          error: "Payment required",
          price: course.price,
          currency: course.currency,
        }, { status: 402 });
      }

      // Verify payment
      const payment = await prisma.lmsPayment.findUnique({ where: { id: paymentId } });
      if (!payment || payment.status !== "success" || payment.userId !== userId) {
        return NextResponse.json({ error: "Invalid or incomplete payment" }, { status: 402 });
      }
    }

    // Calculate total lessons
    const totalLessons = course.modules.reduce((sum, m) => sum + m._count.lessons, 0);

    const enrollment = await prisma.lmsCourseEnrollment.create({
      data: {
        userId,
        courseId,
        totalLessons,
      },
    });

    // Increment enrollment count
    await prisma.lmsCourse.update({
      where: { id: courseId },
      data: { totalEnrollments: { increment: 1 } },
    });

    return NextResponse.json({ message: "Enrolled successfully", enrollment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/lms/courses/[courseId]/enroll error:", error);
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
  }
}
