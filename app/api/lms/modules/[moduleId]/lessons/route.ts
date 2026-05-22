import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

async function getExpertModule(userId: string, moduleId: string) {
  const expertProfile = await prisma.expertProfile.findUnique({ where: { userId }, select: { id: true } })
  if (!expertProfile) return null

  const module = await prisma.courseModule.findUnique({
    where: { id: moduleId },
    include: { course: { select: { expertId: true } } },
  })
  if (!module || module.course.expertId !== expertProfile.id) return null

  return module
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { moduleId } = await params
    const module = await getExpertModule(userId, moduleId)
    if (!module) return NextResponse.json({ error: "Module not found or forbidden" }, { status: 403 })

    const lessons = await prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { sortOrder: "asc" },
    })

    return NextResponse.json(lessons)
  } catch (error) {
    console.error("GET /api/lms/modules/[moduleId]/lessons error:", error)
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { moduleId } = await params
    const module = await getExpertModule(userId, moduleId)
    if (!module) return NextResponse.json({ error: "Module not found or forbidden" }, { status: 403 })

    const body = await req.json()
    const { title, description, videoUrl, pdfUrl, content, duration, sortOrder, isFree } = body

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 })

    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title,
        description: description ?? null,
        videoUrl: videoUrl ?? null,
        pdfUrl: pdfUrl ?? null,
        content: content ?? null,
        duration: duration ?? 0,
        sortOrder: sortOrder ?? 0,
        isFree: isFree ?? false,
      },
    })

    return NextResponse.json(lesson, { status: 201 })
  } catch (error) {
    console.error("POST /api/lms/modules/[moduleId]/lessons error:", error)
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 })
  }
}
