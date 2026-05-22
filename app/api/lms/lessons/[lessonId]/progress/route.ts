import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * POST /api/lms/lessons/[lessonId]/progress — Update lesson progress (toggle completion)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;

  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isCompleted } = await req.json();

    // Verify lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const courseId = lesson.module.course.id;

    // Check if enrolled
    const enrollment = await prisma.lmsCourseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
    }

    // Create or update progress
    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      update: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        userId,
        lessonId,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // Fetch all lessons in course to compute total and completed counts
    const allLessons = lesson.module.course.modules.flatMap((m) => m.lessons);
    const totalLessons = allLessons.length;

    // Fetch all completed lessons for this user in this course
    const completedProgress = await prisma.lessonProgress.findMany({
      where: {
        userId,
        isCompleted: true,
        lesson: {
          module: {
            courseId,
          },
        },
      },
    });

    const completedLessonsCount = completedProgress.length;
    const progressPercent = totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0;
    const isCompletedCourse = progressPercent >= 100;

    // Update enrollment status
    const updatedEnrollment = await prisma.lmsCourseEnrollment.update({
      where: { id: enrollment.id },
      data: {
        completedLessons: completedLessonsCount,
        totalLessons,
        progress: progressPercent,
        isCompleted: isCompletedCourse,
        completedAt: isCompletedCourse ? (enrollment.completedAt || new Date()) : null,
      },
    });

    // Auto-generate certificate if course completed
    if (isCompletedCourse) {
      const existingCert = await prisma.certificate.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });

      if (!existingCert) {
        const certCode = `YIF-CERT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        await prisma.certificate.create({
          data: {
            userId,
            courseId,
            certificateCode: certCode,
            qrCodeData: `https://verify.yifcapital.co.tz/cert/${certCode}`,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      enrollment: updatedEnrollment,
    });
  } catch (error) {
    console.error("POST /api/lms/lessons/[lessonId]/progress error:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
