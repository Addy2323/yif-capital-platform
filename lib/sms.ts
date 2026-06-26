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

  const destAddr = destAddrFromE164(phoneE164)

  console.info(`[SMS] Sending via Beem to ${destAddr.slice(0, 6)}*** (source: ${sourceAddr})`)

  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        api_key: apiKey,
        secret_key: secret,
      },
      body: JSON.stringify({
        source_addr: sourceAddr,
        schedule_time: "",
        encoding: 0,
        message,
        recipients: [{ recipient_id: "1", dest_addr: destAddr }],
      }),
    })
  } catch (networkErr) {
    console.error("[SMS] Beem network/fetch error:", networkErr)
    throw new Error(`Beem SMS network error: ${(networkErr as Error).message}`)
  }

  let data: Record<string, unknown> = {}
  let rawBody = ""
  try {
    rawBody = await res.text()
    data = JSON.parse(rawBody) as Record<string, unknown>
  } catch {
    console.error("[SMS] Beem non-JSON response:", res.status, rawBody.slice(0, 500))
  }

  if (!res.ok) {
    const detail = data.message || data.error || rawBody.slice(0, 200) || "(no body)"
    console.error(`[SMS] Beem HTTP ${res.status}:`, detail, data)
    throw new Error(`Beem SMS failed (HTTP ${res.status}): ${detail}`)
  }

  if (data.successful === false) {
    const detail = data.message || data.error || JSON.stringify(data)
    console.error("[SMS] Beem API rejected:", detail, data)
    throw new Error(`Beem SMS rejected: ${detail}`)
  }

  console.info("[SMS] Beem send OK:", data.request_id || data.code || "success")
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
