import { randomInt } from "crypto"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { sendOtpSms } from "@/lib/sms"
import {
  checkOtpSendRateLimit,
  clearVerifyAttempts,
  recordVerifyAttempt,
  rollbackLastOtpSend,
} from "@/lib/otp-rate-limit"
import { normalizeE164 } from "@/lib/phone"
import { setAuthCookies } from "@/lib/auth-cookies"

const OTP_TTL_MS = 5 * 60 * 1000
const BCRYPT_ROUNDS = 10

export function generateOtpDigits(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0")
}

export async function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, BCRYPT_ROUNDS)
}

export async function compareOtp(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash)
}

export async function issueOtpForPhone(phoneE164: string): Promise<{ expiresAt: Date }> {
  const phone = normalizeE164(phoneE164)
  const limited = checkOtpSendRateLimit(phone)
  if (!limited.ok) {
    throw Object.assign(new Error("Too many OTP requests"), {
      status: 429,
      retryAfterMs: limited.retryAfterMs,
    })
  }

  const plainCode = generateOtpDigits()
  const otpHash = await hashOtp(plainCode)
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)

  await prisma.otp.deleteMany({ where: { phoneNumber: phone } })
  await prisma.otp.create({
    data: {
      phoneNumber: phone,
      otpHash,
      expiresAt,
    },
  })

  try {
    await sendOtpSms(phone, plainCode)
  } catch (e) {
    rollbackLastOtpSend(phone)
    await prisma.otp.deleteMany({ where: { phoneNumber: phone } })
    throw e
  }

  return { expiresAt }
}

export async function verifyPhoneOtpAndActivate(
  phoneE164: string,
  code: string
): Promise<
  | { ok: true; user: { id: string; email: string; name: string; role: string; createdAt: string } }
  | { ok: false; error: string; status: number }
> {
  const phone = normalizeE164(phoneE164)
  const digits = code.replace(/\D/g, "")
  if (digits.length !== 6) {
    return { ok: false, error: "Enter the 6-digit code", status: 400 }
  }

  const vlim = recordVerifyAttempt(phone)
  if (!vlim.ok) {
    return {
      ok: false,
      error: "Too many attempts. Try again later.",
      status: 429,
    }
  }

  const user = await prisma.user.findFirst({
    where: { phoneNumber: phone },
  })

  if (!user) {
    return { ok: false, error: "Invalid or expired code", status: 400 }
  }

  if (user.isVerified) {
    clearVerifyAttempts(phone)
    return { ok: false, error: "This phone number is already verified", status: 400 }
  }

  const otpRow = await prisma.otp.findFirst({
    where: {
      phoneNumber: phone,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  })

  if (!otpRow) {
    return { ok: false, error: "Invalid or expired code", status: 400 }
  }

  const match = await compareOtp(digits, otpRow.otpHash)
  if (!match) {
    return { ok: false, error: "Invalid or expired code", status: 400 }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    }),
    prisma.otp.deleteMany({ where: { phoneNumber: phone } }),
  ])

  clearVerifyAttempts(phone)
  await setAuthCookies(user.id)

  const refreshed = await prisma.user.findUnique({ where: { id: user.id } })
  if (!refreshed) {
    return { ok: false, error: "Verification failed", status: 500 }
  }

  return {
    ok: true,
    user: {
      id: refreshed.id,
      email: refreshed.email,
      name: refreshed.name,
      role: refreshed.role.toLowerCase(),
      createdAt: refreshed.createdAt.toISOString(),
    },
  }
}
