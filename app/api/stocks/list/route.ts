import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), "fund_pipeline", "data", "stocks", "dse_stocks_latest.json")
    const fileContent = await fs.readFile(dataPath, "utf-8")
    const stockData = JSON.parse(fileContent)

    const list = stockData.map((s: any) => ({
      symbol: s.symbol,
      name: s.name,
    })).sort((a: any, b: any) => a.symbol.localeCompare(b.symbol))

    return NextResponse.json(list)
  } catch (error) {
    console.error("Failed to load stock list:", error)
    return NextResponse.json({ error: "Stock list unavailable" }, { status: 500 })
  }
}
