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

  // Beem dashboard may provide the secret as a base64-encoded string.
  // Determine the actual secret to use: try the raw value first;
  // if it looks like base64 (ends with =), also prepare the decoded variant.
  const isBase64 = /^[A-Za-z0-9+/]+=+$/.test(secret) || /^[A-Za-z0-9+/]{4,}$/.test(secret)
  const decodedSecret = isBase64
    ? Buffer.from(secret, "base64").toString("utf-8")
    : null

  // Build the request body once
  const body = JSON.stringify({
    source_addr: sourceAddr,
    schedule_time: null,
    encoding: 0,
    message,
    recipients: [{ recipient_id: 1, dest_addr: destAddr }],
  })

  // Try with the raw secret first
  const secretsToTry = [secret, ...(decodedSecret && decodedSecret !== secret ? [decodedSecret] : [])]

  let lastRes: Response | null = null
  let lastData: Record<string, unknown> = {}
  let lastRawBody = ""

  for (const s of secretsToTry) {
    const auth = Buffer.from(`${apiKey}:${s}`).toString("base64")

    let res: Response
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body,
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

    // If auth succeeded (not 401), process the response
    if (res.status !== 401) {
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
      return
    }

    // 401 — save for potential retry with decoded secret
    console.warn(`[SMS] Beem 401 with secret variant (len=${s.length}), trying next...`)
    lastRes = res
    lastData = data
    lastRawBody = rawBody
  }

  // All variants failed with 401
  const detail = lastData.message || lastData.error || lastRawBody.slice(0, 200) || "(no body)"
  console.error("[SMS] Beem 401 with all secret variants:", detail, lastData)
  throw new Error(`Beem SMS failed (HTTP 401): ${detail}`)
}

export async function requestBeemOtp(phoneE164: string): Promise<string> {
  const apiKey = process.env.BEEM_API_KEY
  const secret = process.env.BEEM_SECRET_KEY
  const appId = process.env.BEEM_APP_ID

  if (!apiKey || !secret || !appId) {
    throw new Error("BEEM_OTP_NOT_CONFIGURED")
  }

  const destAddr = destAddrFromE164(phoneE164)
  console.info(`[SMS] Requesting Beem OTP pin for ${destAddr.slice(0, 6)}*** (appId: ${appId})`)

  const isBase64 = /^[A-Za-z0-9+/]+=+$/.test(secret) || /^[A-Za-z0-9+/]{4,}$/.test(secret)
  const decodedSecret = isBase64
    ? Buffer.from(secret, "base64").toString("utf-8")
    : null

  const secretsToTry = [secret, ...(decodedSecret && decodedSecret !== secret ? [decodedSecret] : [])]
  const body = JSON.stringify({
    appId: Number(appId),
    msisdn: destAddr,
  })

  let lastRes: Response | null = null
  let lastData: Record<string, unknown> = {}
  let lastRawBody = ""

  for (const s of secretsToTry) {
    const auth = Buffer.from(`${apiKey}:${s}`).toString("base64")
    let res: Response
    try {
      res = await fetch("https://apiotp.beem.africa/v1/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body,
      })
    } catch (networkErr) {
      console.error("[SMS] Beem OTP network/fetch error:", networkErr)
      throw new Error(`Beem OTP request network error: ${(networkErr as Error).message}`)
    }

    let data: Record<string, unknown> = {}
    let rawBody = ""
    try {
      rawBody = await res.text()
      data = JSON.parse(rawBody) as Record<string, unknown>
    } catch {
      console.error("[SMS] Beem OTP request non-JSON response:", res.status, rawBody.slice(0, 500))
    }

    if (res.status !== 401) {
      if (!res.ok) {
        const detail = data.message || (data.message as any)?.message || rawBody.slice(0, 200) || "(no body)"
        console.error(`[SMS] Beem OTP HTTP ${res.status}:`, detail, data)
        throw new Error(`Beem OTP request failed (HTTP ${res.status}): ${detail}`)
      }

      const pinId = (data.data as any)?.pinId || data.pinId || (data.data as any)?.pin_id || data.pin_id
      if (!pinId) {
        console.error("[SMS] Beem OTP request succeeded but returned no pinId:", data)
        throw new Error("Beem OTP request returned no pinId")
      }

      console.info("[SMS] Beem OTP requested OK, pinId:", pinId)
      return String(pinId)
    }

    console.warn(`[SMS] Beem OTP 401 with secret variant (len=${s.length}), trying next...`)
    lastRes = res
    lastData = data
    lastRawBody = rawBody
  }

  const detail = lastData.message || lastRawBody.slice(0, 200) || "(no body)"
  console.error("[SMS] Beem OTP 401 with all secret variants:", detail, lastData)
  throw new Error(`Beem OTP request failed (HTTP 401): ${detail}`)
}

export async function verifyBeemOtp(pinId: string, pin: string): Promise<boolean> {
  const apiKey = process.env.BEEM_API_KEY
  const secret = process.env.BEEM_SECRET_KEY

  if (!apiKey || !secret) {
    throw new Error("BEEM_NOT_CONFIGURED")
  }

  console.info(`[SMS] Verifying Beem OTP (pinId: ${pinId})`)

  const isBase64 = /^[A-Za-z0-9+/]+=+$/.test(secret) || /^[A-Za-z0-9+/]{4,}$/.test(secret)
  const decodedSecret = isBase64
    ? Buffer.from(secret, "base64").toString("utf-8")
    : null

  const secretsToTry = [secret, ...(decodedSecret && decodedSecret !== secret ? [decodedSecret] : [])]
  const body = JSON.stringify({
    pinId,
    pin,
  })

  let lastRes: Response | null = null
  let lastData: Record<string, unknown> = {}
  let lastRawBody = ""

  for (const s of secretsToTry) {
    const auth = Buffer.from(`${apiKey}:${s}`).toString("base64")
    let res: Response
    try {
      res = await fetch("https://apiotp.beem.africa/v1/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body,
      })
    } catch (networkErr) {
      console.error("[SMS] Beem OTP verify network/fetch error:", networkErr)
      throw new Error(`Beem OTP verify network error: ${(networkErr as Error).message}`)
    }

    let data: Record<string, unknown> = {}
    let rawBody = ""
    try {
      rawBody = await res.text()
      data = JSON.parse(rawBody) as Record<string, unknown>
    } catch {
      console.error("[SMS] Beem OTP verify non-JSON response:", res.status, rawBody.slice(0, 500))
    }

    if (res.status !== 401) {
      if (!res.ok) {
        const detail = data.message || (data.message as any)?.message || rawBody.slice(0, 200) || "(no body)"
        console.error(`[SMS] Beem OTP verify HTTP ${res.status}:`, detail, data)
        return false
      }

      const msgObj = (data.data as any)?.message || data.message
      const code = msgObj?.code || data.code || (data.data as any)?.code
      
      console.info(`[SMS] Beem OTP verify response code: ${code}`, data)
      if (code === 117) {
        return true
      }
      return false
    }

    console.warn(`[SMS] Beem OTP verify 401 with secret variant (len=${s.length}), trying next...`)
    lastRes = res
    lastData = data
    lastRawBody = rawBody
  }

  console.error("[SMS] Beem OTP verify 401 with all secret variants:", lastRawBody || lastData)
  return false
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

export async function sendGeneralSms(phoneE164: string, message: string): Promise<void> {
  if (hasBeem()) {
    await sendViaBeem(phoneE164, message)
    return
  }

  if (hasTwilio()) {
    await sendViaTwilio(phoneE164, message)
    return
  }

  if (process.env.NODE_ENV === "production") {
    console.error(`[SMS] No Beem or Twilio credentials; cannot send SMS to ${phoneE164} in production`)
    throw new Error("SMS service is not configured")
  }

  console.info(`[DEV SMS] → ${phoneE164}: ${message}`)
}

export async function sendOtpSms(phoneE164: string, plainCode: string): Promise<void> {
  const message = OTP_MESSAGE(plainCode)
  await sendGeneralSms(phoneE164, message)
}
