import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { issueOtpForPhone } from "@/lib/otp-service"
import { maskPhoneE164, normalizePhoneInputToE164 } from "@/lib/phone"

/** At least 8 chars, uppercase, lowercase, digit */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

export type RegisterResult =
  | { ok: true; maskedPhone: string; expiresAt: string }
  | { ok: false; status: number; error: string }

export async function registerUser(body: {
  email: string
  password: string
  name: string
  phone: string
}): Promise<RegisterResult> {
  const email = body.email?.trim().toLowerCase()
  const name = body.name?.trim()
  const password = body.password

  if (!email || !name || !password) {
    return { ok: false, status: 400, error: "Missing required fields" }
  }

  const parsedPhone = normalizePhoneInputToE164(body.phone || "")
  if (!parsedPhone.ok) {
    return { ok: false, status: 400, error: parsedPhone.error }
  }
  const phone = parsedPhone.e164
  if (!PASSWORD_REGEX.test(password)) {
    return {
      ok: false,
      status: 400,
      error: "Password must be at least 8 characters and include uppercase, lowercase, and a number",
    }
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } })
  if (existingEmail) {
    return { ok: false, status: 409, error: "Email already registered" }
  }

  const existingPhone = await prisma.user.findUnique({ where: { phoneNumber: phone } })
  if (existingPhone) {
    return { ok: false, status: 409, error: "Phone number already registered" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  let userId: string
  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        phoneNumber: phone,
        isVerified: false,
        role: "FREE",
      },
    })
    userId = user.id
  } catch (e) {
    console.error("registerUser create:", e)
    return { ok: false, status: 500, error: "Registration failed" }
  }

  try {
    const { expiresAt } = await issueOtpForPhone(phone)
    return {
      ok: true,
      maskedPhone: maskPhoneE164(phone),
      expiresAt: expiresAt.toISOString(),
    }
  } catch (e: unknown) {
    await prisma.user.delete({ where: { id: userId } }).catch(() => {})
    const err = e as { status?: number; message?: string }
    if (err.status === 429) {
      return {
        ok: false,
        status: 429,
        error: "Too many OTP requests. Please wait before trying again.",
      }
    }
    if (String(err.message || e).includes("SMS service is not configured")) {
      return {
        ok: false,
        status: 503,
        error:
          "SMS service is not configured. Set Beem Africa (BEEM_*) or Twilio env vars, or use development mode.",
      }
    }
    return {
      ok: false,
      status: 500,
      error: "Could not send verification code. Try again later.",
    }
  }
}
