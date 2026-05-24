import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/user-session"

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, avatar } = body

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        isVerified: true,
        phoneNumber: true,
        lastPhonePromptDate: true,
      }
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (e) {
    console.error("PATCH /api/users/me error:", e)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
