/**
 * Static registry of Tanzanian mutual funds (9 managers, 22 funds).
 * Used to ensure the mobile Funds view always shows the full list with correct counts.
 */
import type { Fund, FundType } from "@/lib/types/funds"

const baseDate = "2020-01-01"
const currency = "Tsh"

export const TANZANIAN_FUNDS_STATIC: Fund[] = [
  // 1. ITRUST FINANCE LIMITED - 6 funds
  { fund_id: "itrust-icash", fund_slug: "icash-fund", fund_name: "ICash Fund", fund_type: "money_market", manager_name: "iTrust Finance Limited", description: "Money market fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 1210.45, return_1y: 8.6 },
  { fund_id: "itrust-igrowth", fund_slug: "igrowth-fund", fund_name: "Igrowth Fund", fund_type: "equity", manager_name: "iTrust Finance Limited", description: "Equity growth fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 1850, return_1y: 18.2 },
  { fund_id: "itrust-iincome", fund_slug: "iincome-fund", fund_name: "IIncome Fund", fund_type: "income", manager_name: "iTrust Finance Limited", description: "Income fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 1100, return_1y: 9.2 },
  { fund_id: "itrust-idollar", fund_slug: "idollar-fund", fund_name: "IDollar Fund", fund_type: "fixed_income", manager_name: "iTrust Finance Limited", description: "USD-denominated fund.", inception_date: baseDate, base_currency: "USD", is_active: true, current_nav: 1.05, return_1y: 6.5 },
  { fund_id: "itrust-iimaan", fund_slug: "iimaan-fund", fund_name: "Iimaan Fund", fund_type: "income", manager_name: "iTrust Finance Limited", description: "Sharia-compliant income fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 1020, return_1y: 7.8 },
  { fund_id: "itrust-isave", fund_slug: "isave-fund", fund_name: "Isave Fund", fund_type: "money_market", manager_name: "iTrust Finance Limited", description: "Savings-oriented money market fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 1150, return_1y: 8.1 },
  // 2. UTT AMIS - 6 funds
  { fund_id: "utt-umoja", fund_slug: "umoja-fund", fund_name: "Umoja Fund", fund_type: "balanced", manager_name: "UTT AMIS", description: "Balanced fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 945.30, return_1y: 12.8 },
  { fund_id: "utt-watoto", fund_slug: "watoto-fund", fund_name: "Watoto Fund", fund_type: "balanced", manager_name: "UTT AMIS", description: "Children's education fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 980, return_1y: 11.0 },
  { fund_id: "utt-jikiku", fund_slug: "jikiku-fund", fund_name: "Jikiku Fund", fund_type: "money_market", manager_name: "UTT AMIS", description: "Money market fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 1050, return_1y: 8.5 },
  { fund_id: "utt-wekeza-maisha", fund_slug: "wekeza-maisha-fund", fund_name: "Wekeza Maisha Fund", fund_type: "balanced", manager_name: "UTT AMIS", description: "Life savings fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 920, return_1y: 10.2 },
  { fund_id: "utt-bond", fund_slug: "utt-bond-fund", fund_name: "Bond Fund", fund_type: "bond", manager_name: "UTT AMIS", description: "Bond fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 1100, return_1y: 9.5 },
  { fund_id: "utt-liquid", fund_slug: "liquid-fund", fund_name: "Liquid Fund", fund_type: "money_market", manager_name: "UTT AMIS", description: "Liquid money market fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 1005, return_1y: 7.8 },
  // 3. ORBIT SECURITIES - 2 funds
  { fund_id: "orbit-inuka-mm", fund_slug: "inuka-money-market-fund", fund_name: "Inuka Money Market Fund", fund_type: "money_market", manager_name: "Orbit Securities", description: "Money market fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 1080, return_1y: 8.2 },
  { fund_id: "orbit-inuka-dozen", fund_slug: "inuka-dozen-index-fund", fund_name: "Inuka Dozen Index Fund", fund_type: "equity", manager_name: "Orbit Securities", description: "Equity index fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 2560.75, return_1y: 15.0 },
  // 4. ZAN SECURITIES - 1 fund
  { fund_id: "zan-timiza", fund_slug: "timiza-funds", fund_name: "Timiza Funds", fund_type: "balanced", manager_name: "Zan Securities", description: "Timiza fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 1320, return_1y: 15.0 },
  // 5. TANZANIA SECURITIES LIMITED - 2 funds
  { fund_id: "tsl-imara", fund_slug: "imara-fund", fund_name: "Imara Fund", fund_type: "equity", manager_name: "Tanzania Securities Limited", description: "Equity fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 2100, return_1y: 11.5 },
  { fund_id: "tsl-kesho", fund_slug: "kesho-tulivu-fund", fund_name: "Kesho Tulivu Fund", fund_type: "balanced", manager_name: "Tanzania Securities Limited", description: "Balanced fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 950, return_1y: 9.8 },
  // 6. VERTEX INTERNATIONAL SECURITIES - 1 fund
  { fund_id: "vertex-bond", fund_slug: "vertex-bond-fund", fund_name: "Bond Fund", fund_type: "bond", manager_name: "Vertex International Securities Limited", description: "Bond fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 1025, return_1y: 8.0 },
  // 7. AFRICAN PENSION FUND (APEF) - 1 fund
  { fund_id: "apef-ziada", fund_slug: "ziada-fund", fund_name: "Ziada Fund", fund_type: "income", manager_name: "African Pension Fund (APEF)", description: "Pension-focused fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 1180, return_1y: 8.5 },
  // 8. WATUMISHI HOUSING INVESTMENT (WHI) - 1 fund
  { fund_id: "whi-faida", fund_slug: "faida-fund", fund_name: "Faida Fund", fund_type: "income", manager_name: "Watumishi Housing Investment (WHI)", description: "Housing investment fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 1090, return_1y: 7.5 },
  // 9. SANLAMALLIANZ EAST AFRICA - 2 funds
  { fund_id: "sanlam-pesa", fund_slug: "sanlamallianz-pesa-money-market-fund", fund_name: "SanlamAllianz Pesa Money Market Fund", fund_type: "money_market", manager_name: "SanlamAllianz East Africa Investment", description: "Money market fund.", inception_date: baseDate, base_currency: currency, is_active: true, current_nav: 1010, return_1y: 7.2 },
  { fund_id: "sanlam-usd", fund_slug: "sanlamallianz-usd-fixed-income-fund", fund_name: "SanlamAllianz USD Fixed Income Fund", fund_type: "fixed_income", manager_name: "SanlamAllianz East Africa Investment", description: "USD fixed income fund.", inception_date: baseDate, base_currency: "USD", is_active: true, current_nav: 1.02, return_1y: 6.8 },
]

export const TANZANIAN_SUMMARY = {
  totalFundManagers: 9,
  totalMutualFunds: 22,
  totalAumFormatted: "Tsh 450B",
  avgMarketReturnPct: 12.5,
}

const STATIC_FUND_IDS = new Set(TANZANIAN_FUNDS_STATIC.map((f) => f.fund_id))

/** Merge API funds with static list. Returns exactly the 22 static funds (9 managers); API data overwrites when fund_id matches. API-only funds are not included so the total stays 22. */
export function mergeWithStaticFunds(apiFunds: Fund[]): Fund[] {
  const byId = new Map<string, Fund>()
  for (const f of TANZANIAN_FUNDS_STATIC) {
    byId.set(f.fund_id, { ...f })
  }
  for (const f of apiFunds) {
    if (!f.fund_id || !STATIC_FUND_IDS.has(f.fund_id)) continue
    const staticFund = TANZANIAN_FUNDS_STATIC.find((s) => s.fund_id === f.fund_id)!
    byId.set(f.fund_id, {
      ...f,
      manager_name: staticFund.manager_name,
      fund_name: staticFund.fund_name,
    })
  }
  return Array.from(byId.values()).sort((a, b) => a.fund_name.localeCompare(b.fund_name))
}

/** URL slug for a fund manager (e.g. "iTrust Finance Limited" -> "itrust-finance-limited") */
export function getManagerSlug(managerName: string): string {
  return managerName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

/** Resolve slug to manager name from static fund list (for manager detail page) */
export function getManagerNameFromSlug(slug: string): string | null {
  const names = [...new Set(TANZANIAN_FUNDS_STATIC.map((f) => f.manager_name))]
  return names.find((name) => getManagerSlug(name) === slug) ?? null
}

/** Official display names for "Fund Managers and Their Funds" / View All page (order = 1–9) */
export const MANAGERS_VIEW_ALL_ORDER: string[] = [
  "iTrust Finance Limited",
  "UTT AMIS",
  "Orbit Securities",
  "Zan Securities",
  "Tanzania Securities Limited",
  "Vertex International Securities Limited",
  "African Pension Fund (APEF)",
  "Watumishi Housing Investment (WHI)",
  "SanlamAllianz East Africa Investment",
]

/** Display name for each manager on the View All page */
export const MANAGER_DISPLAY_NAME: Record<string, string> = {
  "iTrust Finance Limited": "ITrust Finance Limited",
  "UTT AMIS": "UTT Asset Management and Investor Services (UTT AMIS)",
  "Orbit Securities": "Orbit Securities Company Limited",
  "Zan Securities": "Zan Securities Limited",
  "Tanzania Securities Limited": "Tanzania Securities Limited",
  "Vertex International Securities Limited": "Vertex International Securities Limited",
  "African Pension Fund (APEF)": "African Pension Fund (APEF)",
  "Watumishi Housing Investment (WHI)": "Watumishi Housing Investments (WHI)",
  "SanlamAllianz East Africa Investment": "SanlamAllianz East Africa Investment Management",
}
