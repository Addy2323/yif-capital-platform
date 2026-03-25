import { NextRequest, NextResponse } from "next/server"
import { getAdminUserId } from "@/lib/admin-auth"
import {
  isBulkGroupId,
  resolveRecipientPhones,
  type BulkGroupId,
} from "@/lib/bulk-sms-recipients"

export async function GET(req: NextRequest) {
  try {
    if (!(await getAdminUserId())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const raw = searchParams.getAll("groups")
    const groups: BulkGroupId[] = []
    for (const g of raw) {
      if (isBulkGroupId(g)) groups.push(g)
    }

    if (groups.length === 0) {
      return NextResponse.json({ count: 0 })
    }

    const phones = await resolveRecipientPhones(groups)
    return NextResponse.json({ count: phones.length })
  } catch (e) {
    console.error("GET /api/admin/bulk-sms/estimate:", e)
    return NextResponse.json({ error: "Estimate failed" }, { status: 500 })
  }
}
