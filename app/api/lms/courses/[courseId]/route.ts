import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * GET /api/lms/courses/[courseId] — Get single course with full modules + lessons + progress (for enrolled users)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  try {
    // Check enrollment status first
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    // Try by slug first, then by id to find the course
    const courseLookup = await prisma.lmsCourse.findFirst({
      where: {
        OR: [{ id: courseId }, { slug: courseId }],
      },
    });

    if (!courseLookup) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    let isEnrolled = false;
    let enrollment = null;
    let completedLessonIds: string[] = [];

    if (userId) {
      enrollment = await prisma.lmsCourseEnrollment.findUnique({
        where: { userId_courseId: { userId, courseId: courseLookup.id } },
      });
      isEnrolled = !!enrollment;

      if (isEnrolled) {
        const progressList = await prisma.lessonProgress.findMany({
          where: { userId, isCompleted: true },
          select: { lessonId: true },
        });
        completedLessonIds = progressList.map((p) => p.lessonId);
      }
    }

    // Now retrieve course structure
    const course = await prisma.lmsCourse.findUnique({
      where: { id: courseLookup.id },
      include: {
        expert: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        modules: {
          orderBy: { sortOrder: "asc" },
          include: {
            lessons: {
              orderBy: { sortOrder: "asc" },
            },
            quizzes: {
              select: {
                id: true,
                title: true,
                passingScore: true,
                _count: { select: { questions: true } },
              },
            },
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Process modules/lessons based on enrollment check
    const processedModules = course.modules.map((module) => {
      const processedLessons = module.lessons.map((lesson) => {
        const isCompleted = completedLessonIds.includes(lesson.id);
        
        // If enrolled or lesson is free, expose full content; otherwise hide it
        if (isEnrolled || lesson.isFree) {
          return {
            ...lesson,
            isCompleted,
          };
        } else {
          return {
            id: lesson.id,
            moduleId: lesson.moduleId,
            title: lesson.title,
            description: lesson.description,
            duration: lesson.duration,
            sortOrder: lesson.sortOrder,
            isFree: lesson.isFree,
            createdAt: lesson.createdAt,
            isCompleted,
            videoUrl: null,
            pdfUrl: null,
            content: null,
          };
        }
      });

      return {
        ...module,
        lessons: processedLessons,
      };
    });

    return NextResponse.json({
      ...course,
      modules: processedModules,
      isEnrolled,
      enrollment,
    });
  } catch (error) {
    console.error("GET /api/lms/courses/[courseId] error:", error);
    return NextResponse.json({ error: "Failed to fetch course details" }, { status: 500 });
  }
}

/**
 * PATCH /api/lms/courses/[courseId] — Expert updates status or details
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const course = await prisma.lmsCourse.findUnique({
      where: { id: courseId },
      include: { expert: { include: { user: { select: { id: true } } } } },
    });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
    if (course.expert.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { status, title, description, price, isFree, thumbnailUrl } = body;

    const updated = await prisma.lmsCourse.update({
      where: { id: courseId },
      data: {
        ...(status !== undefined && { status }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(isFree !== undefined && { isFree }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/lms/courses/[courseId] error:", error);
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}
