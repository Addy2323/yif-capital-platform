import { NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/register-handler"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await registerUser(body)

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      message: "Account created. Enter the code we sent to your phone to continue.",
      maskedPhone: result.maskedPhone,
      expiresAt: result.expiresAt,
    })
  } catch (e) {
    console.error("POST /api/register:", e)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
