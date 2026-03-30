import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { generateLlmContent } from "@/src/ai/llmGenerate"

export async function POST(req: NextRequest) {
  try {
    const { symbolA, symbolB } = await req.json()

    if (!symbolA || !symbolB) {
      return NextResponse.json({ error: "Two stock symbols are required" }, { status: 400 })
    }

    // 1. Load the latest scraped stock data
    let stockData = []
    try {
      const dataPath = path.join(process.cwd(), "fund_pipeline", "data", "stocks", "dse_stocks_latest.json")
      const fileContent = await fs.readFile(dataPath, "utf-8")
      stockData = JSON.parse(fileContent)
    } catch (err) {
      console.error("Failed to load stock data for Duel:", err)
      return NextResponse.json({ error: "Stock data unavailable" }, { status: 500 })
    }

    // 2. Extract data for both stocks
    const stockA = stockData.find((s: any) => s.symbol === symbolA)
    const stockB = stockData.find((s: any) => s.symbol === symbolB)

    if (!stockA || !stockB) {
      return NextResponse.json({ error: "One or both stocks not found" }, { status: 404 })
    }

    // 3. Build the comparison prompt
    const systemInstruction = `You are the "DSE Stock Clash Referee". Your job is to compare two stocks on the Dar es Salaam Stock Exchange and declare a winner for different categories.
Be objective, professional, and use the provided stats.
Keep your response to 3 short sections:
1. "Income Champion": Compare their dividend yields and payout stability. Who wins for an income investor?
2. "Growth Gladiator": Compare their P/E ratios and recent price changes. Who has more momentum or value potential?
3. "The Referee's Verdict": A final summary recommending which stock is better for which type of investor.`

    const userText = `STOCKS TO DUEL:
    
STOCK A: ${stockA.name} (${stockA.symbol})
- Price: ${stockA.price} TZS
- Div Yield: ${stockA.dividend_yield || "N/A"}%
- P/E Ratio: ${stockA.pe_ratio || "N/A"}
- 1Y Change: ${stockA.change_1y || "N/A"}%
- Sector: ${stockA.sector}

STOCK B: ${stockB.name} (${stockB.symbol})
- Price: ${stockB.price} TZS
- Div Yield: ${stockB.dividend_yield || "N/A"}%
- P/E Ratio: ${stockB.pe_ratio || "N/A"}
- 1Y Change: ${stockB.change_1y || "N/A"}%
- Sector: ${stockB.sector}

Which one wins the duel?`

    const result = await generateLlmContent({
      systemInstruction,
      userText,
      maxOutputTokens: 1000
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status || 500 })
    }

    return NextResponse.json({ 
      verdict: result.text,
      stockA,
      stockB
    })

  } catch (error: any) {
    console.error("Stock duel API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
