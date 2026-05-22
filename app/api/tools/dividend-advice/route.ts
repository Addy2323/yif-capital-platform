import { NextRequest, NextResponse } from "next/server"
import { generateLlmContent } from "@/src/ai/llmGenerate"
import { PrismaClient } from "@/lib/generated/client"

const prisma = new PrismaClient()

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

    // 1. Fetch the latest stock data from the database
    let topDividendStocks: any[] = []
    try {
      const stocks = await prisma.stock.findMany({
        include: {
          prices: {
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        },
        where: {
          prices: {
            some: {
              dividendYield: { gt: 0 }
            }
          }
        }
      })

      topDividendStocks = stocks
        .map(s => {
          const latestPrice = s.prices[0]
          return {
            symbol: s.symbol,
            name: s.name,
            yield: latestPrice?.dividendYield || 0,
            growth: latestPrice?.dividendGrowth || 0,
            price: latestPrice?.price || 0
          }
        })
        .sort((a, b) => b.yield - a.yield)
        .slice(0, 8)
    } catch (err) {
      console.error("Failed to fetch stock data from DB for AI advice:", err)
    }

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
