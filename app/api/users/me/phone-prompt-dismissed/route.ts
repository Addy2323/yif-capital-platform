import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/user-session"

/** Sets last_phone_prompt_date to today's calendar date (UTC) so the prompt hides until tomorrow. */
export async function PATCH() {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

    await prisma.user.update({
      where: { id: userId },
      data: { lastPhonePromptDate: today },
    })

    const last_phone_prompt_date = today.toISOString().slice(0, 10)

    return NextResponse.json({ success: true, last_phone_prompt_date })
  } catch (e) {
    console.error("PATCH /api/users/me/phone-prompt-dismissed:", e)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
