import "server-only"

import { prisma } from "@/lib/prisma"
import { generateLlmContent, getAnyLlmApiKey } from "@/src/ai/llmGenerate"

const MOVE_PCT = (() => {
  const n = Number(process.env.INSIGHT_MOVE_PCT ?? "2.5")
  return Number.isFinite(n) && n > 0 ? n : 2.5
})()

export type InsightItem = {
  kind: "stock" | "fund"
  symbol: string
  name: string
  changePct: number
  /** Stock: position value; fund: NAV */
  price?: number
  qty?: number
  /** vs user cost / invested */
  pnlPct?: number
}

export type InsightPayload =
  | {
      show: true
      scrapeId: string
      insightKey: string
      kind: "holding" | "prospect"
      title: string
      body: string
      items: InsightItem[]
      source: "gemini" | "template"
    }
  | { show: false; scrapeId?: string }

function templateHolding(items: InsightItem[]): string {
  const lines = items.map((i) => {
    const dir = i.changePct >= 0 ? "up" : "down"
    const pnl =
      i.pnlPct != null && Number.isFinite(i.pnlPct)
        ? ` Your position is ${i.pnlPct >= 0 ? "+" : ""}${i.pnlPct.toFixed(1)}% vs average cost.`
        : ""
    if (i.kind === "fund") {
      return `• ${i.name}: NAV moved ${dir} ~${Math.abs(i.changePct).toFixed(2)}% recently.${pnl}`
    }
    return `• ${i.symbol} (${i.name}): session move ${i.changePct >= 0 ? "+" : ""}${i.changePct.toFixed(2)}%.${pnl}`
  })
  return [
    "Notable price movement on your holdings (educational only, not personal advice):",
    "",
    ...lines,
    "",
    "Consider your time horizon, fees, and risk tolerance before acting. Review issuer filings and the Stocks page. Many long-term investors avoid reacting to single-day noise; others use volatility to rebalance toward a target allocation.",
  ].join("\n")
}

function templateProspect(items: InsightItem[]): string {
  const names = items.map((i) => `${i.symbol} (${i.name})`).join(" and ")
  return [
    `Today's DSE data highlights strong recent momentum for: ${names}.`,
    "",
    "This is not a recommendation to buy. Research each company, read annual reports, and consider diversification before investing. New users can create a portfolio on YIF to track positions and review educational tools.",
  ].join("\n")
}

async function generateAiText(
  prompt: string
): Promise<{ text: string; provider: "gemini" } | null> {
  const geminiApiKey = getAnyLlmApiKey()
  if (!geminiApiKey) return null
  const r = await generateLlmContent({
    userText: prompt,
    maxOutputTokens: 600,
    signal: AbortSignal.timeout(20_000),
  })
  if (!r.ok) return null
  return { text: r.text, provider: r.provider }
}

async function buildStockMovesForHoldings(
  tickers: Map<string, { qty: number; buyAvg: number; name: string }>,
  scrapedAt: Date
): Promise<InsightItem[]> {
  const out: InsightItem[] = []
  for (const [symbol, h] of tickers) {
    const row = await prisma.dseStock.findFirst({
      where: {
        symbol: { equals: symbol, mode: "insensitive" },
        scrapedAt,
      },
    })
    if (!row) continue
    const pct = Number(row.changePct)
    if (!Number.isFinite(pct) || Math.abs(pct) < MOVE_PCT) continue
    const pnlPct = ((Number(row.price) - h.buyAvg) / h.buyAvg) * 100
    out.push({
      kind: "stock",
      symbol: symbol.toUpperCase(),
      name: row.name || h.name,
      changePct: pct,
      price: Number(row.price),
      qty: h.qty,
      pnlPct,
    })
  }
  out.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
  return out.slice(0, 6)
}

async function buildFundMovesForHoldings(
  funds: { name: string; invested: number; currentValue: number }[]
): Promise<InsightItem[]> {
  const seen = new Set<string>()
  const out: InsightItem[] = []
  for (const fh of funds) {
    const fname = fh.name.trim()
    const key = fname.toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    const fund = await prisma.fund.findFirst({
      where: {
        OR: [
          { fundName: { contains: fname, mode: "insensitive" } },
          { fundId: { equals: fname, mode: "insensitive" } },
        ],
      },
      select: { fundId: true, fundName: true },
    })
    if (!fund) continue
    const rows = await prisma.fundNavHistory.findMany({
      where: { fundId: fund.fundId },
      orderBy: { date: "desc" },
      take: 2,
    })
    if (rows.length < 1) continue
    const latest = rows[0]
    let chg: number | null = null
    const pctField = latest.navChangePct
    if (pctField != null && Number.isFinite(Number(pctField))) {
      chg = Number(pctField)
    } else if (rows.length >= 2) {
      const n0 = Number(rows[0].nav)
      const n1 = Number(rows[1].nav)
      if (Number.isFinite(n0) && Number.isFinite(n1) && n1 !== 0) {
        chg = ((n0 - n1) / n1) * 100
      }
    }
    if (chg == null || !Number.isFinite(chg) || Math.abs(chg) < MOVE_PCT) continue

    let pnlPct: number | undefined
    if (fh.invested > 0) {
      pnlPct = ((fh.currentValue - fh.invested) / fh.invested) * 100
    }

    out.push({
      kind: "fund",
      symbol: fund.fundId,
      name: fund.fundName,
      changePct: chg,
      price: Number(latest.nav),
      pnlPct,
    })
  }
  return out.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 4)
}

export async function buildPortfolioInsight(
  userId: string,
  opts?: { skipAi?: boolean }
): Promise<InsightPayload> {
  const skipAi = opts?.skipAi === true
  const latest = await prisma.dseStock.findFirst({
    orderBy: { scrapedAt: "desc" },
    select: { scrapedAt: true },
  })
  if (!latest?.scrapedAt) {
    return { show: false }
  }
  const scrapeId = latest.scrapedAt.toISOString()
  const scrapedAt = latest.scrapedAt

  const portfolios = await prisma.portfolio.findMany({
    where: { userId },
    include: { stocks: true, funds: true },
  })

  const hasHoldings = portfolios.some(
    (p) => p.stocks.length > 0 || p.funds.length > 0
  )

  if (hasHoldings) {
    const byTicker = new Map<
      string,
      { qty: number; buyAvg: number; name: string }
    >()
    const fundRows: { name: string; invested: number; currentValue: number }[] = []
    const fundKeySeen = new Set<string>()

    for (const p of portfolios) {
      for (const s of p.stocks) {
        const t = s.ticker.trim().toUpperCase()
        const qty = Number(s.qty)
        const bp = Number(s.buyPrice)
        if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(bp)) continue
        const prev = byTicker.get(t)
        const cost = qty * bp
        if (prev) {
          const q = prev.qty + qty
          byTicker.set(t, {
            qty: q,
            buyAvg: (prev.buyAvg * prev.qty + cost) / q,
            name: s.name || t,
          })
        } else {
          byTicker.set(t, { qty, buyAvg: bp, name: s.name || t })
        }
      }
      for (const f of p.funds) {
        const nm = f.name?.trim()
        if (!nm) continue
        const fk = nm.toLowerCase()
        const inv = Number(f.invested)
        const cv = Number(f.currentValue)
        if (fundKeySeen.has(fk)) {
          const i = fundRows.findIndex((r) => r.name.toLowerCase() === fk)
          if (i >= 0) {
            fundRows[i] = {
              name: fundRows[i].name,
              invested: fundRows[i].invested + inv,
              currentValue: fundRows[i].currentValue + cv,
            }
          }
        } else {
          fundKeySeen.add(fk)
          fundRows.push({ name: nm, invested: inv, currentValue: cv })
        }
      }
    }

    const stockMoves = await buildStockMovesForHoldings(byTicker, scrapedAt)
    const fundMoves =
      fundRows.length > 0 ? await buildFundMovesForHoldings(fundRows) : []
    const items = [...stockMoves, ...fundMoves].sort(
      (a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)
    )

    if (items.length === 0) {
      return { show: false, scrapeId }
    }

    const insightKey = `hold:${scrapeId}:${items
      .map((i) => `${i.kind}:${i.symbol}`)
      .sort()
      .join("|")}`

    const lines = items.map((i) => {
      if (i.kind === "fund") {
        return `${i.name} (fund): NAV change ${i.changePct >= 0 ? "+" : ""}${i.changePct.toFixed(2)}%`
      }
      return `${i.symbol}: session ${i.changePct >= 0 ? "+" : ""}${i.changePct.toFixed(2)}%, avg cost ${i.pnlPct != null ? `position vs cost ~${i.pnlPct >= 0 ? "+" : ""}${i.pnlPct.toFixed(1)}%` : "n/a"}`
    })

    const prompt = `You help Tanzanian retail investors on the Dar es Salaam Stock Exchange (DSE). Currency TZS.

Holdings with notable moves (threshold ±${MOVE_PCT}% day/NAV change):
${lines.join("\n")}

Write 4–7 short sentences in plain English (or Swahili mix if natural):
1) Briefly explain what "today's move" might reflect (liquidity, sentiment — stay general).
2) Educational framing: when investors might **hold** through noise vs **review** trimming vs **consider** adding (no commands; no guarantees).
3) Remind: not personal financial advice; read filings; use YIF Stocks page.

No bullet labels like "1)". No markdown. Max 130 words.`

    let body: string
    let source: "gemini" | "template"
    if (skipAi) {
      body = templateHolding(items)
      source = "template"
    } else {
      const ai = await generateAiText(prompt)
      if (ai) {
        body = ai.text
        source = "gemini"
      } else {
        body = templateHolding(items)
        source = "template"
      }
    }

    return {
      show: true,
      scrapeId,
      insightKey,
      kind: "holding",
      title: "Your portfolio — notable moves",
      body,
      items,
      source,
    }
  }

  // No holdings: suggest up to 2 liquid names with positive momentum
  const positive = await prisma.dseStock.findMany({
    where: {
      scrapedAt,
      changePct: { gt: 0.25 },
    },
    orderBy: [{ changePct: "desc" }],
    take: 2,
  })

  let picks = positive
  if (picks.length < 2) {
    const fill = await prisma.dseStock.findMany({
      where: { scrapedAt },
      orderBy: [{ marketCap: "desc" }],
      take: 4,
    })
    const sym = new Set(picks.map((p) => p.symbol))
    for (const r of fill) {
      if (picks.length >= 2) break
      if (!sym.has(r.symbol)) {
        picks.push(r)
        sym.add(r.symbol)
      }
    }
    picks = picks.slice(0, 2)
  }

  if (picks.length === 0) {
    return { show: false, scrapeId }
  }

  const items: InsightItem[] = picks.map((r) => ({
    kind: "stock" as const,
    symbol: r.symbol,
    name: r.name,
    changePct: Number(r.changePct) || 0,
    price: Number(r.price),
  }))

  const insightKey = `prospect:${scrapeId}:${items.map((i) => i.symbol).sort().join(",")}`

  const prompt = `You help Tanzanian retail investors. These DSE listings show strong recent session momentum today: ${items.map((i) => `${i.symbol} (${i.name}) ${i.changePct >= 0 ? "+" : ""}${i.changePct.toFixed(2)}%`).join("; ")}.

Write 4–6 sentences: encourage research and diversification, mention risks, that this is NOT a buy recommendation. Suggest creating a portfolio to track ideas. Plain text, max 100 words, no markdown.`

  let body: string
  let source: "gemini" | "template"
  if (skipAi) {
    body = templateProspect(items)
    source = "template"
  } else {
    const ai = await generateAiText(prompt)
    if (ai) {
      body = ai.text
      source = "gemini"
    } else {
      body = templateProspect(items)
      source = "template"
    }
  }

  return {
    show: true,
    scrapeId,
    insightKey,
    kind: "prospect",
    title: "Ideas to research (not advice)",
    body,
    items,
    source,
  }
}
