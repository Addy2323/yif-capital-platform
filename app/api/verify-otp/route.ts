import { NextRequest, NextResponse } from "next/server"
import { verifyPhoneOtpAndActivate } from "@/lib/otp-service"

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json()
    if (!phone || !code) {
      return NextResponse.json({ error: "Phone and code are required" }, { status: 400 })
    }

    const result = await verifyPhoneOtpAndActivate(phone, code)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      message: "Phone verified. Welcome!",
      user: result.user,
    })
  } catch (e) {
    console.error("POST /api/verify-otp:", e)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
