import { NextRequest, NextResponse } from "next/server"
import { getDSEHistory } from "@/lib/services/mansaApi"

// GET /api/v1/stocks/[symbol]/history — Get historical stock prices
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ symbol: string }> }
) {
    try {
        const { symbol } = await params
        const upperSymbol = symbol.toUpperCase()

        const { searchParams } = new URL(req.url)
        const range = searchParams.get("range") || "1Y"

        const historyRes = await getDSEHistory(upperSymbol, range)
        if (!historyRes || !historyRes.success) {
            return NextResponse.json({
                success: false,
                data: [],
                error: historyRes?.error || "Failed to fetch stock history from Mansa"
            })
        }

        return NextResponse.json({
            success: true,
            data: historyRes.data
        })
    } catch (error: any) {
        console.error(`[STOCK HISTORY API] Error for single symbol:`, error)
        return NextResponse.json({
            success: false,
            data: [],
            error: error.message
        }, { status: 500 })
    }
}
