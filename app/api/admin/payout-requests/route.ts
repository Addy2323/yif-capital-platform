import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserId } from "@/lib/admin-auth"

export async function GET(req: NextRequest) {
  try {
    if (!(await getAdminUserId())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    const requests = await prisma.payoutRequest.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        expert: {
          include: {
            user: { select: { id: true, name: true, email: true, phoneNumber: true, avatar: true } },
          },
        },
      },
      orderBy: { requestedAt: "desc" },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error("GET /api/admin/payout-requests error:", error)
    return NextResponse.json({ error: "Failed to fetch payout requests" }, { status: 500 })
  }
}
