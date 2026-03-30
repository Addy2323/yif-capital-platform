import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { generateLlmContent } from "@/src/ai/llmGenerate"

export async function POST(req: NextRequest) {
  try {
    const { 
      initialInvestment, 
      monthlyContribution, 
      years, 
      expectedYield, 
      reinvest,
      totalValue,
      totalDividends 
    } = await req.json()

    // 1. Load the latest scraped stock data to provide context to Gemini
    let stockData = []
    try {
      const dataPath = path.join(process.cwd(), "fund_pipeline", "data", "stocks", "dse_stocks_latest.json")
      const fileContent = await fs.readFile(dataPath, "utf-8")
      stockData = JSON.parse(fileContent)
    } catch (err) {
      console.error("Failed to load stock data for AI advice:", err)
    }

    // 2. Filter for high-yield dividend stocks to recommend
    const topDividendStocks = stockData
      .filter((s: any) => s.dividend_yield && s.dividend_yield > 0)
      .sort((a: any, b: any) => (b.dividend_yield || 0) - (a.dividend_yield || 0))
      .slice(0, 8)
      .map((s: any) => ({
        symbol: s.symbol,
        name: s.name,
        yield: s.dividend_yield,
        growth: s.dividend_growth,
        price: s.price
      }))

    // 3. Build the prompt
    const systemInstruction = `You are the YIF Capital AI Strategist, an expert on the Dar es Salaam Stock Exchange (DSE). 
Your goal is to provide a "Dividend Snowball" strategy for an investor.
Be professional, encouraging, and specific to the Tanzanian market.
Keep your response to exactly 3 paragraphs:
1. Analysis of their projection: Comment on the power of compounding based on their initial ${initialInvestment.toLocaleString()} TZS and monthly ${monthlyContribution.toLocaleString()} TZS.
2. Specific DSE Recommendations: Mention 2-3 specific stocks from the provided list that are excellent for a dividend snowball (high yield or consistent growth).
3. Risk & Strategy: Advice on diversification and long-term mindset in the DSE market.`

    const userText = `Here is my projection data:
- Initial Investment: ${initialInvestment.toLocaleString()} TZS
- Monthly Contribution: ${monthlyContribution.toLocaleString()} TZS
- Time Horizon: ${years} years
- Reinvesting Dividends: ${reinvest ? "Yes" : "No"}
- Target Portfolio Value: ${totalValue.toLocaleString()} TZS
- Total Dividends Collected: ${totalDividends.toLocaleString()} TZS

Top DSE Dividend Stocks currently available:
${JSON.stringify(topDividendStocks, null, 2)}

Please provide my Dividend Snowball Strategy.`

    const result = await generateLlmContent({
      systemInstruction,
      userText,
      maxOutputTokens: 1000
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status || 500 })
    }

    return NextResponse.json({ 
      strategy: result.text,
      recommendedStocks: topDividendStocks.slice(0, 3) // Return top 3 for UI components
    })

  } catch (error: any) {
    console.error("Dividend advice API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
