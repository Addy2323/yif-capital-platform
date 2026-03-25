import { NextRequest, NextResponse } from "next/server"
import { format } from "date-fns"
import { prisma } from "@/lib/prisma"
import { getAdminUserId } from "@/lib/admin-auth"
import { sendBeemBulkSms } from "@/lib/bulk-sms-beem"
import {
  isBulkGroupId,
  resolveRecipientPhones,
  type BulkGroupId,
} from "@/lib/bulk-sms-recipients"

const MAX_LEN = 160

function unitCostTzs(): number {
  const v = parseInt(process.env.BULK_SMS_UNIT_COST_TZS || "25", 10)
  return Number.isFinite(v) && v > 0 ? v : 25
}

export async function POST(req: NextRequest) {
  try {
    if (!(await getAdminUserId())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const rawGroups = Array.isArray(body.groups) ? body.groups : []
    const message = String(body.message ?? "").trim()
    const scheduleAtRaw = body.scheduleAt as string | null | undefined

    const groups: BulkGroupId[] = []
    for (const g of rawGroups) {
      if (typeof g === "string" && isBulkGroupId(g)) groups.push(g)
    }

    if (groups.length === 0) {
      return NextResponse.json({ error: "Select at least one recipient group" }, { status: 400 })
    }

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (message.length > MAX_LEN) {
      return NextResponse.json(
        { error: `Message must be ${MAX_LEN} characters or fewer` },
        { status: 400 }
      )
    }

    const phones = await resolveRecipientPhones(groups)
    if (phones.length === 0) {
      return NextResponse.json(
        { error: "No recipients with verified phone numbers for the selected groups" },
        { status: 400 }
      )
    }

    const unit = unitCostTzs()
    const estimatedCostTzs = phones.length * unit

    let scheduleAt: Date | null = null
    if (scheduleAtRaw) {
      scheduleAt = new Date(scheduleAtRaw)
      if (Number.isNaN(scheduleAt.getTime())) {
        return NextResponse.json({ error: "Invalid schedule time" }, { status: 400 })
      }
    }

    const now = new Date()
    const useSchedule = scheduleAt !== null && scheduleAt.getTime() > now.getTime() + 30_000
    const scheduleTime = useSchedule ? format(scheduleAt!, "yyyy-MM-dd HH:mm:ss") : undefined

    let delivered = 0
    let failed = 0
    let errorMessage: string | null = null

    try {
      const result = await sendBeemBulkSms(phones, message, {
        scheduleTime: useSchedule ? scheduleTime : undefined,
      })
      delivered = result.delivered
      failed = result.failed
    } catch (e) {
      errorMessage = e instanceof Error ? e.message : "SMS send failed"
      await prisma.bulkSmsCampaign.create({
        data: {
          message,
          groupsTargeted: groups,
          recipientCount: phones.length,
          deliveredCount: 0,
          failedCount: phones.length,
          status: "failed",
          scheduledAt: useSchedule ? scheduleAt : null,
          sentAt: now,
          estimatedCostTzs,
          errorMessage,
        },
      })
      return NextResponse.json({ error: errorMessage }, { status: 502 })
    }

    const status = useSchedule
      ? "scheduled"
      : failed > 0 && delivered === 0
        ? "failed"
        : failed > 0
          ? "partial"
          : "completed"

    await prisma.bulkSmsCampaign.create({
      data: {
        message,
        groupsTargeted: groups,
        recipientCount: phones.length,
        deliveredCount: delivered,
        failedCount: failed,
        status,
        scheduledAt: useSchedule ? scheduleAt : null,
        sentAt: now,
        estimatedCostTzs,
        errorMessage: errorMessage,
      },
    })

    return NextResponse.json({
      ok: true,
      recipientCount: phones.length,
      groups,
      deliveredCount: delivered,
      failedCount: failed,
      estimatedCostTzs,
      scheduled: useSchedule,
    })
  } catch (e) {
    console.error("POST /api/admin/bulk-sms/send:", e)
    return NextResponse.json({ error: "Bulk SMS failed" }, { status: 500 })
  }
}
