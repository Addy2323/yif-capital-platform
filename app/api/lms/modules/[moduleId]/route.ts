import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

async function verifyExpertOwnsModule(userId: string, moduleId: string) {
  const expertProfile = await prisma.expertProfile.findUnique({ where: { userId }, select: { id: true } })
  if (!expertProfile) return null

  const module = await prisma.courseModule.findUnique({
    where: { id: moduleId },
    include: { course: { select: { expertId: true } } },
  })
  if (!module || module.course.expertId !== expertProfile.id) return null

  return module
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { moduleId } = await params
    const module = await verifyExpertOwnsModule(userId, moduleId)
    if (!module) return NextResponse.json({ error: "Module not found or forbidden" }, { status: 403 })

    const body = await req.json()
    const { title, description, sortOrder } = body

    const updated = await prisma.courseModule.update({
      where: { id: moduleId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/lms/modules/[moduleId] error:", error)
    return NextResponse.json({ error: "Failed to update module" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { moduleId } = await params
    const module = await verifyExpertOwnsModule(userId, moduleId)
    if (!module) return NextResponse.json({ error: "Module not found or forbidden" }, { status: 403 })

    await prisma.courseModule.delete({ where: { id: moduleId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/lms/modules/[moduleId] error:", error)
    return NextResponse.json({ error: "Failed to delete module" }, { status: 500 })
  }
}
