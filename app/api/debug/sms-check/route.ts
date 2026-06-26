import { NextResponse } from "next/server"
import { isSmsProviderConfigured } from "@/lib/sms"

/**
 * GET /api/debug/sms-check
 * Quick diagnostic: reports whether Beem / Twilio is configured
 * and tries a test request to Beem's balance endpoint.
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
    beemSenderId: process.env.BEEM_SENDER_ID || "INFO (default)",
    nodeEnv: process.env.NODE_ENV,
  }

  // If Beem is configured, try checking balance
  if (hasBeem) {
    try {
      const auth = Buffer.from(
        `${process.env.BEEM_API_KEY}:${process.env.BEEM_SECRET_KEY}`
      ).toString("base64")

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

      result.beemBalanceStatus = balRes.status
      result.beemBalanceOk = balRes.ok
      result.beemBalance = balData.data || balData.balance || balData
      if (!balRes.ok) {
        result.beemBalanceError = balText.slice(0, 300)
      }
    } catch (e) {
      result.beemBalanceError = `Network error: ${(e as Error).message}`
    }
  }

  return NextResponse.json(result, { status: 200 })
}
