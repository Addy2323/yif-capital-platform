import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserId } from "@/lib/admin-auth"
import { getGroupRecipientCounts } from "@/lib/bulk-sms-recipients"

export async function GET(req: NextRequest) {
  try {
    if (!(await getAdminUserId())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)))

    const [totalCampaigns, campaigns, agg, scheduledCount, groupCounts] = await Promise.all([
      prisma.bulkSmsCampaign.count(),
      prisma.bulkSmsCampaign.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.bulkSmsCampaign.aggregate({
        _sum: { recipientCount: true, deliveredCount: true, failedCount: true },
      }),
      prisma.bulkSmsCampaign.count({ where: { status: "scheduled" } }),
      getGroupRecipientCounts(),
    ])

    const totalRecipientsSum = agg._sum.recipientCount ?? 0
    const deliveredSum = agg._sum.deliveredCount ?? 0
    const deliveryRatePct =
      totalRecipientsSum > 0 ? Math.round((deliveredSum / totalRecipientsSum) * 1000) / 10 : 0

    const unitCostTzs = parseInt(process.env.BULK_SMS_UNIT_COST_TZS || "25", 10)
    const unitCost = Number.isFinite(unitCostTzs) && unitCostTzs > 0 ? unitCostTzs : 25

    return NextResponse.json({
      unitCostTzs: unitCost,
      stats: {
        totalSmsSent: totalCampaigns,
        totalRecipientsReached: totalRecipientsSum,
        deliveryRatePct,
        scheduledPending: scheduledCount,
      },
      groupCounts,
      logs: {
        items: campaigns.map((c) => ({
          id: c.id,
          message: c.message,
          groupsTargeted: c.groupsTargeted,
          recipientCount: c.recipientCount,
          deliveredCount: c.deliveredCount,
          failedCount: c.failedCount,
          status: c.status,
          scheduledAt: c.scheduledAt?.toISOString() ?? null,
          sentAt: c.sentAt?.toISOString() ?? null,
          estimatedCostTzs: c.estimatedCostTzs,
          errorMessage: c.errorMessage,
          createdAt: c.createdAt.toISOString(),
        })),
        total: totalCampaigns,
        page,
        limit,
      },
    })
  } catch (e) {
    console.error("GET /api/admin/bulk-sms:", e)
    return NextResponse.json({ error: "Failed to load bulk SMS data" }, { status: 500 })
  }
}
