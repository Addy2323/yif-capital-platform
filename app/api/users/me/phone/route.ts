import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/user-session"
import { normalizePhoneInputToE164 } from "@/lib/phone"

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const raw = String(body.phone_number ?? body.phoneNumber ?? "").trim()

    if (!raw) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number format." },
        { status: 400 }
      )
    }

    const parsed = normalizePhoneInputToE164(raw)
    if (!parsed.ok) {
      return NextResponse.json({ success: false, message: "Invalid phone number format." }, { status: 400 })
    }

    const phoneE164 = parsed.e164

    const existing = await prisma.user.findFirst({
      where: { phoneNumber: phoneE164, NOT: { id: userId } },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Phone number already in use." },
        { status: 409 }
      )
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        phoneNumber: phoneE164,
        lastPhonePromptDate: null,
      },
    })

    return NextResponse.json({ success: true, message: "Phone number updated." })
  } catch (e) {
    console.error("PATCH /api/users/me/phone:", e)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
