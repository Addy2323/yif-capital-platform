/**
 * Server-only Beem Africa bulk SMS (multiple recipients per request, chunked).
 */

const DEFAULT_URL = "https://apisms.beem.africa/v1/send"
const CHUNK_SIZE = 150

function destAddr(phoneE164: string): string {
  return phoneE164.replace(/^\+/, "").replace(/\s/g, "")
}

export type BeemBulkResult = {
  delivered: number
  failed: number
  responses: unknown[]
}

export async function sendBeemBulkSms(
  phonesE164: string[],
  message: string,
  options?: { scheduleTime?: string }
): Promise<BeemBulkResult> {
  const apiKey = process.env.BEEM_API_KEY
  const secret = process.env.BEEM_SECRET_KEY
  const sourceAddr = process.env.BEEM_SENDER_ID || "INFO"
  const url = process.env.BEEM_SMS_URL || DEFAULT_URL

  if (!apiKey || !secret) {
    throw new Error("Beem SMS is not configured (BEEM_API_KEY / BEEM_SECRET_KEY)")
  }

  const auth = Buffer.from(`${apiKey}:${secret}`).toString("base64")
  const schedule_time = options?.scheduleTime?.trim() ?? ""

  let delivered = 0
  let failed = 0
  const responses: unknown[] = []

  for (let offset = 0; offset < phonesE164.length; offset += CHUNK_SIZE) {
    const slice = phonesE164.slice(offset, offset + CHUNK_SIZE)
    const recipients = slice.map((phone, i) => ({
      recipient_id: String(offset + i + 1),
      dest_addr: destAddr(phone),
    }))

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        source_addr: sourceAddr,
        schedule_time,
        encoding: 0,
        message,
        recipients,
      }),
    })

    let data: Record<string, unknown> = {}
    try {
      data = (await res.json()) as Record<string, unknown>
    } catch {
      /* ignore */
    }

    responses.push(data)

    if (!res.ok) {
      failed += slice.length
      continue
    }

    if (data.successful === false) {
      failed += slice.length
      continue
    }

    const valid =
      typeof data.valid === "number"
        ? data.valid
        : typeof data.valid === "string"
          ? parseInt(data.valid, 10)
          : slice.length
    const invalid =
      typeof data.invalid === "number"
        ? data.invalid
        : typeof data.invalid === "string"
          ? parseInt(data.invalid, 10)
          : 0

    delivered += Number.isFinite(valid) ? valid : slice.length
    failed += Number.isFinite(invalid) ? invalid : 0
  }

  return { delivered, failed, responses }
}
