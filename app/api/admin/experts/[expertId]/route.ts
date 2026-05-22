import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

async function isAdmin(req: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value
  if (!userId) return false
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  return user?.role === "ADMIN"
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ expertId: string }> }
) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { expertId } = await context.params
    const updates = await req.json()

    const data: Record<string, any> = {}
    if (updates.approvalStatus) data.approvalStatus = updates.approvalStatus
    if (updates.approvalNote !== undefined) data.approvalNote = updates.approvalNote
    if (updates.nationalIdVerified !== undefined) data.nationalIdVerified = updates.nationalIdVerified
    if (updates.bio !== undefined) data.bio = updates.bio
    if (updates.headline !== undefined) data.headline = updates.headline
    if (updates.hourlyRate !== undefined) data.hourlyRate = updates.hourlyRate
    if (updates.location !== undefined) data.location = updates.location
    if (updates.experienceYears !== undefined) data.experienceYears = updates.experienceYears
    if (updates.specializations !== undefined) data.specializations = updates.specializations
    if (updates.isAvailableOnline !== undefined) data.isAvailableOnline = updates.isAvailableOnline
    if (updates.isAvailablePhysical !== undefined) data.isAvailablePhysical = updates.isAvailablePhysical

    const updated = await prisma.expertProfile.update({
      where: { id: expertId },
      data,
      include: {
        user: { select: { id: true, name: true, email: true, phoneNumber: true } },
      },
    })

    // If approved, update user role to EXPERT. If rejected or suspended, revert user role to FREE
    if (updates.approvalStatus === "APPROVED") {
      await prisma.user.update({
        where: { id: updated.userId },
        data: { role: "EXPERT" },
      })
    } else if (updates.approvalStatus === "REJECTED" || updates.approvalStatus === "SUSPENDED") {
      await prisma.user.update({
        where: { id: updated.userId },
        data: { role: "FREE" },
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update expert error:", error)
    return NextResponse.json({ error: "Failed to update expert" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ expertId: string }> }
) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { expertId } = await context.params
    
    const profile = await prisma.expertProfile.findUnique({ where: { id: expertId } })
    if (profile) {
      await prisma.user.update({
        where: { id: profile.userId },
        data: { role: "FREE" },
      })
      await prisma.expertProfile.delete({ where: { id: expertId } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete expert error:", error)
    return NextResponse.json({ error: "Failed to delete expert" }, { status: 500 })
  }
}
