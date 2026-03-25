/**
 * OTP SMS delivery:
 * 1) Beem Africa — BEEM_API_KEY + BEEM_SECRET_KEY (recommended for TZ/Africa)
 * 2) Twilio — TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_PHONE_NUMBER
 * If neither is configured in development, logs to console only.
 */

const OTP_MESSAGE = (code: string) =>
  `Your YIF Capital verification code is: ${code}. Valid for 5 minutes. Do not share this code.`

function destAddrFromE164(e164: string): string {
  return e164.replace(/^\+/, "").replace(/\s/g, "")
}

async function sendViaBeem(phoneE164: string, message: string): Promise<void> {
  const apiKey = process.env.BEEM_API_KEY
  const secret = process.env.BEEM_SECRET_KEY
  const sourceAddr = process.env.BEEM_SENDER_ID || "INFO"
  const url = process.env.BEEM_SMS_URL || "https://apisms.beem.africa/v1/send"

  if (!apiKey || !secret) {
    throw new Error("BEEM_NOT_CONFIGURED")
  }

  const auth = Buffer.from(`${apiKey}:${secret}`).toString("base64")
  const destAddr = destAddrFromE164(phoneE164)

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      source_addr: sourceAddr,
      schedule_time: "",
      encoding: 0,
      message,
      recipients: [{ recipient_id: "1", dest_addr: destAddr }],
    }),
  })

  let data: Record<string, unknown> = {}
  try {
    data = (await res.json()) as Record<string, unknown>
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    console.error("[SMS] Beem HTTP error:", res.status, data)
    throw new Error("Failed to send verification SMS")
  }

  if (data.successful === false) {
    console.error("[SMS] Beem API rejected:", data)
    throw new Error("Failed to send verification SMS")
  }
}

async function sendViaTwilio(phoneE164: string, message: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!sid || !token || !from) {
    throw new Error("TWILIO_NOT_CONFIGURED")
  }

  const auth = Buffer.from(`${sid}:${token}`).toString("base64")
  const params = new URLSearchParams({
    To: phoneE164,
    From: from,
    Body: message,
  })

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("[SMS] Twilio error:", res.status, text)
    throw new Error("Failed to send verification SMS")
  }
}

function hasBeem(): boolean {
  return Boolean(process.env.BEEM_API_KEY && process.env.BEEM_SECRET_KEY)
}

function hasTwilio(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
  )
}

export function isSmsProviderConfigured(): boolean {
  return hasBeem() || hasTwilio()
}

export async function sendOtpSms(phoneE164: string, plainCode: string): Promise<void> {
  const message = OTP_MESSAGE(plainCode)

  if (hasBeem()) {
    await sendViaBeem(phoneE164, message)
    return
  }

  if (hasTwilio()) {
    await sendViaTwilio(phoneE164, message)
    return
  }

  if (process.env.NODE_ENV === "production") {
    console.error("[SMS] No Beem or Twilio credentials; cannot send OTP in production")
    throw new Error("SMS service is not configured")
  }

  console.info(`[DEV SMS] → ${phoneE164}: ${message}`)
}
