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
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await context.params
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

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        phoneNumber: phoneE164,
        lastPhonePromptDate: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Phone number updated.",
      phone_number: updated.phoneNumber,
    })
  } catch (e) {
    console.error("PATCH /api/admin/users/[userId]/phone:", e)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
