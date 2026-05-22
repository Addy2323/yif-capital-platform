import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserId } from "@/lib/admin-auth"
import { sendBeemBulkSms } from "@/lib/bulk-sms-beem"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const adminId = await getAdminUserId()
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { requestId } = await params
    const body = await req.json()
    const { status, adminNote } = body

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Status must be APPROVED or REJECTED" }, { status: 400 })
    }

    const existing = await prisma.payoutRequest.findUnique({
      where: { id: requestId },
      include: {
        expert: {
          include: {
            user: { select: { id: true, name: true, phoneNumber: true } },
          },
        },
      },
    })

    if (!existing) return NextResponse.json({ error: "Request not found" }, { status: 404 })
    if (existing.status !== "PENDING") {
      return NextResponse.json({ error: "Request already processed" }, { status: 409 })
    }

    const updated = await prisma.payoutRequest.update({
      where: { id: requestId },
      data: {
        status,
        adminNote: adminNote ?? null,
        processedAt: new Date(),
        processedBy: adminId,
      },
    })

    // Notify expert via SMS
    const expertPhone = existing.expert.user.phoneNumber
    if (expertPhone) {
      const isApproved = status === "APPROVED"
      const smsText = isApproved
        ? `YIF Capital: Your payout request of TZS ${existing.amount.toLocaleString()} has been APPROVED. You will receive TZS ${existing.expertAmount.toLocaleString()} (80%). Platform fee: TZS ${existing.platformFee.toLocaleString()} (20%).`
        : `YIF Capital: Your payout request of TZS ${existing.amount.toLocaleString()} has been REJECTED. ${adminNote ? `Reason: ${adminNote}` : "Please contact support for details."}`
      sendBeemBulkSms([expertPhone], smsText).catch(e =>
        console.error("Expert payout SMS error:", e)
      )
    }

    // In-app notification for expert
    await prisma.notification.create({
      data: {
        userId: existing.expert.user.id,
        type: "PAYMENT",
        title: status === "APPROVED" ? "Payout Approved!" : "Payout Request Rejected",
        message:
          status === "APPROVED"
            ? `Your payout request of TZS ${existing.amount.toLocaleString()} has been approved. You will receive TZS ${existing.expertAmount.toLocaleString()} (80%). Platform fee: TZS ${existing.platformFee.toLocaleString()} (20%).`
            : `Your payout request of TZS ${existing.amount.toLocaleString()} was rejected.${adminNote ? ` Reason: ${adminNote}` : ""}`,
        actionUrl: "/expert/earnings",
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/admin/payout-requests/[requestId] error:", error)
    return NextResponse.json({ error: "Failed to update payout request" }, { status: 500 })
  }
}
