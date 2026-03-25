import { NextRequest, NextResponse } from "next/server"
import { handleResendOtp } from "@/lib/resend-otp-handler"

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()
    const result = await handleResendOtp(phone)
    return NextResponse.json(result.body, { status: result.status })
  } catch (e) {
    console.error("POST /api/resend-otp:", e)
    return NextResponse.json({ error: "Request failed" }, { status: 500 })
  }
}
