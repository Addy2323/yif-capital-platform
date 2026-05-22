import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { sendBeemBulkSms } from "@/lib/bulk-sms-beem"

const PLATFORM_FEE_PCT = 0.20
const EXPERT_SHARE_PCT = 0.80

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const expertProfile = await prisma.expertProfile.findUnique({ where: { userId }, select: { id: true } })
    if (!expertProfile) return NextResponse.json({ error: "Expert access required" }, { status: 403 })

    const requests = await prisma.payoutRequest.findMany({
      where: { expertId: expertProfile.id },
      orderBy: { requestedAt: "desc" },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error("GET /api/expert/payout-requests error:", error)
    return NextResponse.json({ error: "Failed to fetch payout requests" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { expertProfile: true },
    })
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let expertProfile = user.expertProfile
    if (!expertProfile && user.role === "EXPERT") {
      expertProfile = await prisma.expertProfile.create({ data: { userId: user.id } })
    }
    if (!expertProfile) return NextResponse.json({ error: "Expert access required" }, { status: 403 })

    const body = await req.json()
    const {
      amount,
      payoutMethod,
      mobileProvider,
      mobileNumber,
      bankName,
      accountNumber,
      accountName,
      branchName,
    } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "No amount available for payout" }, { status: 400 })
    }
    if (!payoutMethod) {
      return NextResponse.json({ error: "Payout method is required" }, { status: 400 })
    }
    if (payoutMethod === "MOBILE_MONEY" && !mobileNumber) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 })
    }
    if (payoutMethod === "BANK_TRANSFER" && !accountNumber) {
      return NextResponse.json({ error: "Bank account number is required" }, { status: 400 })
    }

    const expertAmount = Math.round(amount * EXPERT_SHARE_PCT)
    const platformFee = Math.round(amount * PLATFORM_FEE_PCT)

    const payoutRequest = await prisma.payoutRequest.create({
      data: {
        expertId: expertProfile.id,
        amount,
        expertAmount,
        platformFee,
        payoutMethod,
        mobileProvider: mobileProvider ?? null,
        mobileNumber: mobileNumber ?? null,
        bankName: bankName ?? null,
        accountNumber: accountNumber ?? null,
        accountName: accountName ?? null,
        branchName: branchName ?? null,
      },
    })

    // Notify admin via SMS
    const adminPhone = process.env.ADMIN_PHONE_NUMBER
    if (adminPhone) {
      const smsText =
        `YIF Capital: Payout request from ${user.name}. ` +
        `Gross: TZS ${amount.toLocaleString()}. ` +
        `Expert share (80%): TZS ${expertAmount.toLocaleString()}. ` +
        `Platform fee (20%): TZS ${platformFee.toLocaleString()}. ` +
        `Method: ${payoutMethod === "MOBILE_MONEY" ? `Mobile (${mobileNumber})` : `Bank (${bankName} ${accountNumber})`}.`
      sendBeemBulkSms([adminPhone], smsText).catch(e =>
        console.error("Admin payout SMS error:", e)
      )
    }

    // In-app notification for all admins
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } })
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          type: "PAYMENT" as const,
          title: "New Payout Request",
          message: `${user.name} has requested a payout of TZS ${amount.toLocaleString()}. Expert share: TZS ${expertAmount.toLocaleString()} (80%). Platform fee: TZS ${platformFee.toLocaleString()} (20%).`,
          actionUrl: "/admin/payout-requests",
        })),
      })
    }

    return NextResponse.json({ ...payoutRequest, expertAmount, platformFee }, { status: 201 })
  } catch (error) {
    console.error("POST /api/expert/payout-requests error:", error)
    const detail = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: "Failed to submit payout request", detail }, { status: 500 })
  }
}
