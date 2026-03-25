import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { normalizePhoneInputToE164 } from "@/lib/phone"

async function isAdmin() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value
  if (!userId) return false
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  return user?.role === "ADMIN"
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await context.params
    const updates = await req.json()

    const data: {
      name?: string
      role?: "FREE" | "PRO" | "INSTITUTIONAL" | "ADMIN"
      phoneNumber?: string | null
      lastPhonePromptDate?: null
    } = {}

    if (updates.name) data.name = updates.name
    if (updates.role) data.role = updates.role.toUpperCase() as "FREE" | "PRO" | "INSTITUTIONAL" | "ADMIN"

    if (updates.phoneNumber !== undefined && updates.phoneNumber !== null) {
      const raw = String(updates.phoneNumber).trim()
      if (raw === "") {
        data.phoneNumber = null
        data.lastPhonePromptDate = null
      } else {
        const parsed = normalizePhoneInputToE164(raw)
        if (!parsed.ok) {
          return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
        }
        const existing = await prisma.user.findFirst({
          where: { phoneNumber: parsed.e164, NOT: { id: userId } },
          select: { id: true },
        })
        if (existing) {
          return NextResponse.json({ error: "Phone number already in use" }, { status: 409 })
        }
        data.phoneNumber = parsed.e164
        data.lastPhonePromptDate = null
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No updates" }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    })

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role.toLowerCase(),
      createdAt: updatedUser.createdAt.toISOString(),
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await context.params

    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
