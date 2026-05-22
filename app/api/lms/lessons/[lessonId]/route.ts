import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

async function getExpertLesson(userId: string, lessonId: string) {
  const expertProfile = await prisma.expertProfile.findUnique({ where: { userId }, select: { id: true } })
  if (!expertProfile) return null

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: { course: { select: { expertId: true } } },
      },
    },
  })
  if (!lesson || lesson.module.course.expertId !== expertProfile.id) return null

  return lesson
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { lessonId } = await params

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: { course: { select: { expertId: true, id: true } } },
        },
      },
    })
    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 })

    const expertProfile = await prisma.expertProfile.findUnique({ where: { userId }, select: { id: true } })
    const isExpertOwner = expertProfile && lesson.module.course.expertId === expertProfile.id

    if (!isExpertOwner) {
      const enrollment = await prisma.lmsCourseEnrollment.findUnique({
        where: { userId_courseId: { userId, courseId: lesson.module.course.id } },
      })
      if (!enrollment && !lesson.isFree) {
        return NextResponse.json({ error: "Enrollment required" }, { status: 403 })
      }
    }

    return NextResponse.json(lesson)
  } catch (error) {
    console.error("GET /api/lms/lessons/[lessonId] error:", error)
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { lessonId } = await params
    const lesson = await getExpertLesson(userId, lessonId)
    if (!lesson) return NextResponse.json({ error: "Lesson not found or forbidden" }, { status: 403 })

    const body = await req.json()
    const { title, description, videoUrl, pdfUrl, content, duration, sortOrder, isFree } = body

    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(pdfUrl !== undefined && { pdfUrl }),
        ...(content !== undefined && { content }),
        ...(duration !== undefined && { duration }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isFree !== undefined && { isFree }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/lms/lessons/[lessonId] error:", error)
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { lessonId } = await params
    const lesson = await getExpertLesson(userId, lessonId)
    if (!lesson) return NextResponse.json({ error: "Lesson not found or forbidden" }, { status: 403 })

    await prisma.lesson.delete({ where: { id: lessonId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/lms/lessons/[lessonId] error:", error)
    return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 })
  }
}
