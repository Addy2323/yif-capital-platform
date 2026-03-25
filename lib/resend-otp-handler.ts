import { prisma } from "@/lib/prisma"
import { issueOtpForPhone } from "@/lib/otp-service"
import { isValidE164, normalizeE164, maskPhoneE164 } from "@/lib/phone"

export async function handleResendOtp(phoneInput: string) {
  const phone = normalizeE164(phoneInput || "")
  if (!phone || !isValidE164(phone)) {
    return { status: 400 as const, body: { error: "Invalid phone number" } }
  }

  const user = await prisma.user.findFirst({ where: { phoneNumber: phone } })

  if (!user) {
    await new Promise((r) => setTimeout(r, 400))
    return {
      status: 200 as const,
      body: {
        success: true,
        message: "If an account exists for this number, a verification code was sent.",
      },
    }
  }

  if (user.isVerified) {
    return { status: 400 as const, body: { error: "This phone number is already verified" } }
  }

  try {
    const { expiresAt } = await issueOtpForPhone(phone)
    return {
      status: 200 as const,
      body: {
        expiresAt: expiresAt.toISOString(),
        maskedPhone: maskPhoneE164(phone),
      },
    }
  } catch (e: unknown) {
    const err = e as { status?: number }
    if (err.status === 429) {
      return {
        status: 429 as const,
        body: { error: "Too many OTP requests. Please wait before trying again." },
      }
    }
    return {
      status: 500 as const,
      body: { error: "Could not send verification code. Try again later." },
    }
  }
}
