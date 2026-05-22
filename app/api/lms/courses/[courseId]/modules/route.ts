import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { courseId } = await params

    const expertProfile = await prisma.expertProfile.findUnique({ where: { userId }, select: { id: true } })
    if (!expertProfile) return NextResponse.json({ error: "Expert access required" }, { status: 403 })

    const course = await prisma.lmsCourse.findUnique({ where: { id: courseId } })
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })
    if (course.expertId !== expertProfile.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const modules = await prisma.courseModule.findMany({
      where: { courseId },
      include: { lessons: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    })

    return NextResponse.json(modules)
  } catch (error) {
    console.error("GET /api/lms/courses/[courseId]/modules error:", error)
    return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { courseId } = await params

    const expertProfile = await prisma.expertProfile.findUnique({ where: { userId }, select: { id: true } })
    if (!expertProfile) return NextResponse.json({ error: "Expert access required" }, { status: 403 })

    const course = await prisma.lmsCourse.findUnique({ where: { id: courseId } })
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })
    if (course.expertId !== expertProfile.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await req.json()
    const { title, description, sortOrder } = body

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 })

    const module = await prisma.courseModule.create({
      data: {
        courseId,
        title,
        description: description ?? null,
        sortOrder: sortOrder ?? 0,
      },
    })

    return NextResponse.json(module, { status: 201 })
  } catch (error) {
    console.error("POST /api/lms/courses/[courseId]/modules error:", error)
    return NextResponse.json({ error: "Failed to create module" }, { status: 500 })
  }
}
