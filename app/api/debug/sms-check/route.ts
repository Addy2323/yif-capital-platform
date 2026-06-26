import { NextResponse } from "next/server"
import { isSmsProviderConfigured } from "@/lib/sms"

/**
 * GET /api/debug/sms-check
 * Quick diagnostic: reports whether Beem / Twilio is configured
 * and tries a test request to Beem's balance endpoint.
 * Tests BOTH raw and decoded secret variants.
 * Remove this route after debugging.
 */
export async function GET() {
  const hasBeem = Boolean(process.env.BEEM_API_KEY && process.env.BEEM_SECRET_KEY)
  const hasTwilio = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
  )

  const result: Record<string, unknown> = {
    smsConfigured: isSmsProviderConfigured(),
    hasBeem,
    hasTwilio,
    beemKeyPrefix: process.env.BEEM_API_KEY?.slice(0, 6) || "(not set)",
    beemSecretLength: process.env.BEEM_SECRET_KEY?.length || 0,
    beemSenderId: process.env.BEEM_SENDER_ID || "INFO (default)",
    nodeEnv: process.env.NODE_ENV,
  }

  if (hasBeem) {
    const apiKey = process.env.BEEM_API_KEY!
    const rawSecret = process.env.BEEM_SECRET_KEY!

    // Also try decoding the secret if it looks like base64
    let decodedSecret: string | null = null
    try {
      decodedSecret = Buffer.from(rawSecret, "base64").toString("utf-8")
    } catch {
      /* not base64 */
    }

    const variants = [
      { label: "raw_secret", secret: rawSecret },
      ...(decodedSecret && decodedSecret !== rawSecret
        ? [{ label: "decoded_secret", secret: decodedSecret }]
        : []),
    ]

    const balanceResults: Record<string, unknown>[] = []

    for (const variant of variants) {
      const auth = Buffer.from(`${apiKey}:${variant.secret}`).toString("base64")
      try {
        const balRes = await fetch("https://apisms.beem.africa/public/v1/vendors/balance", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
          },
        })

        const balText = await balRes.text()
        let balData: Record<string, unknown> = {}
        try {
          balData = JSON.parse(balText) as Record<string, unknown>
        } catch {
          /* non-JSON */
        }

        balanceResults.push({
          variant: variant.label,
          secretPreview: `${variant.secret.slice(0, 8)}...`,
          httpStatus: balRes.status,
          ok: balRes.ok,
          response: balRes.ok ? (balData.data || balData) : balText.slice(0, 300),
        })
      } catch (e) {
        balanceResults.push({
          variant: variant.label,
          error: `Network error: ${(e as Error).message}`,
        })
      }
    }

    result.beemBalanceChecks = balanceResults
  }

  return NextResponse.json(result, { status: 200 })
}
