import { NextRequest, NextResponse } from "next/server"
import { handleResendOtp } from "@/lib/resend-otp-handler"

/** Generate and send a new OTP for an unverified account (same behavior as resend-otp). */
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()
    const result = await handleResendOtp(phone)
    return NextResponse.json(result.body, { status: result.status })
  } catch (e) {
    console.error("POST /api/send-otp:", e)
    return NextResponse.json({ error: "Request failed" }, { status: 500 })
  }
}
