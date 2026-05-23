import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      status: "unknown",
      连接Error: null,
    },
    tables: {},
  }

  try {
    // 1. Basic database check
    await prisma.$queryRaw`SELECT 1`
    diagnostics.database.status = "connected"

    // 2. Check key tables existence
    const tableChecks = [
      { name: "User", check: () => prisma.user.count() },
      { name: "UserSession", check: () => prisma.userSession.count() },
      { name: "Stock", check: () => prisma.stock.count() },
      { name: "DseStock", check: () => (prisma as any).dseStock.count() },
    ]

    for (const { name, check } of tableChecks) {
      try {
        const count = await check()
        diagnostics.tables[name] = { status: "exists", count }
      } catch (err: any) {
        diagnostics.tables[name] = { 
          status: "missing_or_error", 
          error: err.message.substring(0, 200) 
        }
        diagnostics.database.status = "degraded"
      }
    }

    return NextResponse.json(diagnostics, { status: diagnostics.database.status === "connected" ? 200 : 207 })
  } catch (error: any) {
    diagnostics.database.status = "failed"
    diagnostics.database.连接Error = error.message
    
    return NextResponse.json(diagnostics, { status: 500 })
  }
}
