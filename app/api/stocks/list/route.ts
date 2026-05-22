import { NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const stocks = await prisma.stock.findMany({
      select: {
        symbol: true,
        name: true,
      },
      orderBy: {
        symbol: 'asc',
      },
    })

    return NextResponse.json(stocks)
  } catch (error) {
    console.error("Failed to load stock list from database:", error)
    return NextResponse.json({ error: "Stock list unavailable" }, { status: 500 })
  }
}
