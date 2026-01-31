// Mock market data for YIF Capital platform
// In production, this would connect to real market APIs

export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  sector: string
  industry: string
  description: string
  listingDate: string
  freeFloat: string
  avgVolume: number
  high52w: number
  low52w: number
  pe?: number
  dividend?: number
  dividendHistory?: { date: string; amount: number }[]
  corporateActions?: { date: string; type: string; description: string }[]
}

export interface Index {
  name: string
  value: number
  change: number
  changePercent: number
}

export interface MarketNews {
  id: string
  title: string
  summary: string
  source: string
  date: string
  category: "market" | "company" | "economy" | "analysis"
}

// DSE (Dar es Salaam Stock Exchange) mock data
export const dseStocks: Stock[] = [
  {
    symbol: "AFRIPRISE",
    name: "Afriprise Plc",
    price: 1000,
    change: 115,
    changePercent: 12.99,
    volume: 899692,
    marketCap: 100000000000,
    sector: "Investment",
    industry: "Financial Services",
    description: "Afriprise Plc is an investment company listed on the DSE.",
    listingDate: "2020-01-01",
    freeFloat: "50%",
    avgVolume: 500000,
    high52w: 1200,
    low52w: 800,
  },
  {
    symbol: "CRDB",
    name: "CRDB Bank Plc",
    price: 2310,
    change: 100,
    changePercent: 4.52,
    volume: 5403531,
    marketCap: 1125000000000,
    sector: "Banking",
    industry: "Commercial Banks",
    description: "CRDB Bank Plc is a leading, wholly-owned Tanzanian commercial bank.",
    listingDate: "2009-06-17",
    freeFloat: "78.5%",
    avgVolume: 950000,
    high52w: 2500,
    low52w: 1800,
  },
  {
    symbol: "DSE",
    name: "Dar es Salaam Stock Exchange",
    price: 7260,
    change: 70,
    changePercent: 0.97,
    volume: 150000,
    marketCap: 72600000000,
    sector: "Financial Services",
    industry: "Stock Exchange",
    description: "The primary stock exchange of Tanzania.",
    listingDate: "1998-09-30",
    freeFloat: "100%",
    avgVolume: 100000,
    high52w: 8000,
    low52w: 6500,
  },
  {
    symbol: "KCB",
    name: "KCB Group Plc",
    price: 1510,
    change: 10,
    changePercent: 0.67,
    volume: 250000,
    marketCap: 450000000000,
    sector: "Banking",
    industry: "Commercial Banks",
    description: "KCB Group is a financial services provider in East Africa.",
    listingDate: "2008-11-06",
    freeFloat: "60%",
    avgVolume: 200000,
    high52w: 1800,
    low52w: 1400,
  },
  {
    symbol: "MCB",
    name: "Mwanga Community Bank",
    price: 810,
    change: 70,
    changePercent: 9.46,
    volume: 120000,
    marketCap: 15000000000,
    sector: "Banking",
    industry: "Community Banks",
    description: "A community bank serving the Mwanga area.",
    listingDate: "2010-01-01",
    freeFloat: "40%",
    avgVolume: 80000,
    high52w: 900,
    low52w: 700,
  },
  {
    symbol: "NMB",
    name: "NMB Bank Plc",
    price: 9960,
    change: 130,
    changePercent: 1.32,
    volume: 450000,
    marketCap: 1900000000000,
    sector: "Banking",
    industry: "Commercial Banks",
    description: "NMB Bank Plc is one of the largest commercial banks in Tanzania.",
    listingDate: "2008-11-06",
    freeFloat: "65.2%",
    avgVolume: 380000,
    high52w: 10500,
    low52w: 8500,
  },
  {
    symbol: "PAL",
    name: "Precision Air Services",
    price: 350,
    change: 20,
    changePercent: 6.06,
    volume: 300000,
    marketCap: 35000000000,
    sector: "Services",
    industry: "Aviation",
    description: "A Tanzanian airline based in Dar es Salaam.",
    listingDate: "2011-12-21",
    freeFloat: "30%",
    avgVolume: 250000,
    high52w: 450,
    low52w: 300,
  },
  {
    symbol: "SWIS",
    name: "Swissport Tanzania Plc",
    price: 3170,
    change: 10,
    changePercent: 0.32,
    volume: 125000,
    marketCap: 420000000000,
    sector: "Services",
    industry: "Aviation Services",
    description: "Leading ground handling services provider in Tanzania.",
    listingDate: "2003-06-16",
    freeFloat: "49.0%",
    avgVolume: 110000,
    high52w: 3500,
    low52w: 2800,
  },
  {
    symbol: "TCC",
    name: "Tanzania Cigarette Company",
    price: 11630,
    change: 130,
    changePercent: 1.13,
    volume: 45000,
    marketCap: 1163000000000,
    sector: "Consumer Goods",
    industry: "Tobacco",
    description: "Leading cigarette manufacturer in Tanzania.",
    listingDate: "2000-11-15",
    freeFloat: "25.0%",
    avgVolume: 35000,
    high52w: 12500,
    low52w: 10000,
  },
  {
    symbol: "TCCL",
    name: "Tanga Cement Company",
    price: 3340,
    change: 340,
    changePercent: 11.33,
    volume: 1002641,
    marketCap: 210000000000,
    sector: "Construction",
    industry: "Building Materials",
    description: "A leading cement producer in Tanzania.",
    listingDate: "2002-09-26",
    freeFloat: "35%",
    avgVolume: 500000,
    high52w: 3500,
    low52w: 2500,
  },
  {
    symbol: "TOL",
    name: "TOL Gases Limited",
    price: 1110,
    change: 20,
    changePercent: 1.83,
    volume: 95000,
    marketCap: 11100000000,
    sector: "Industrial",
    industry: "Industrial Gases",
    description: "Leading manufacturer and distributor of industrial and medical gases.",
    listingDate: "1998-09-30",
    freeFloat: "55.0%",
    avgVolume: 80000,
    high52w: 1300,
    low52w: 1000,
  },
  {
    symbol: "TPCC",
    name: "Tanzania Portland Cement",
    price: 6150,
    change: 40,
    changePercent: 0.65,
    volume: 320000,
    marketCap: 513000000000,
    sector: "Construction",
    industry: "Building Materials",
    description: "Largest cement producing company in Tanzania.",
    listingDate: "2008-09-29",
    freeFloat: "30.8%",
    avgVolume: 280000,
    high52w: 6500,
    low52w: 5500,
  },
  {
    symbol: "DCB",
    name: "DCB Commercial Bank",
    price: 440,
    change: -20,
    changePercent: -4.35,
    volume: 680000,
    marketCap: 76000000000,
    sector: "Banking",
    industry: "Commercial Banks",
    description: "First bank in Tanzania to be listed on the DSE.",
    listingDate: "2008-09-16",
    freeFloat: "85.0%",
    avgVolume: 550000,
    high52w: 500,
    low52w: 400,
  },
  {
    symbol: "MBP",
    name: "Maendeleo Bank Plc",
    price: 2580,
    change: -340,
    changePercent: -11.64,
    volume: 50000,
    marketCap: 25000000000,
    sector: "Banking",
    industry: "Commercial Banks",
    description: "A commercial bank listed on the DSE.",
    listingDate: "2013-11-07",
    freeFloat: "45%",
    avgVolume: 40000,
    high52w: 3000,
    low52w: 2400,
  },
  {
    symbol: "MKCB",
    name: "Mkombozi Commercial Bank",
    price: 4190,
    change: -320,
    changePercent: -7.1,
    volume: 30000,
    marketCap: 41900000000,
    sector: "Banking",
    industry: "Commercial Banks",
    description: "A commercial bank established by the Catholic Church.",
    listingDate: "2014-12-29",
    freeFloat: "50%",
    avgVolume: 25000,
    high52w: 4600,
    low52w: 4000,
  },
  {
    symbol: "NICO",
    name: "National Investments Company",
    price: 3250,
    change: -370,
    changePercent: -10.22,
    volume: 200000,
    marketCap: 325000000000,
    sector: "Investment",
    industry: "Financial Services",
    description: "An investment company listed on the DSE.",
    listingDate: "2008-07-15",
    freeFloat: "100%",
    avgVolume: 150000,
    high52w: 3800,
    low52w: 3000,
  },
  {
    symbol: "VODA",
    name: "Vodacom Tanzania",
    price: 980,
    change: -15,
    changePercent: -1.51,
    volume: 1000000,
    marketCap: 2195200000000,
    sector: "Telecommunications",
    industry: "Mobile Services",
    description: "Leading telecommunications company in Tanzania.",
    listingDate: "2017-08-15",
    freeFloat: "25%",
    avgVolume: 800000,
    high52w: 1100,
    low52w: 900,
  },
]

export const indices: Index[] = [
  { name: "DSE All Share Index", value: 2145.67, change: 18.45, changePercent: 0.87 },
  { name: "DSE Industrial Index", value: 4523.12, change: -12.34, changePercent: -0.27 },
  { name: "DSE Banking Index", value: 1876.89, change: 25.67, changePercent: 1.39 },
]

export const marketNews: MarketNews[] = [
  {
    id: "1",
    title: "DSE Trading Volume Reaches 6-Month High",
    summary:
      "The Dar es Salaam Stock Exchange recorded its highest trading volume in six months as investor confidence continues to grow in the Tanzanian market.",
    source: "YIF Research",
    date: "2026-01-24",
    category: "market",
  },
  {
    id: "2",
    title: "CRDB Bank Reports Strong Q4 Earnings",
    summary:
      "CRDB Bank Plc announced quarterly earnings that exceeded analyst expectations, driven by increased lending activity and digital banking adoption.",
    source: "Company Release",
    date: "2026-01-23",
    category: "company",
  },
  {
    id: "3",
    title: "Bank of Tanzania Maintains Interest Rates",
    summary:
      "The central bank decided to keep benchmark interest rates unchanged, citing stable inflation and continued economic growth momentum.",
    source: "Economic News",
    date: "2026-01-22",
    category: "economy",
  },
  {
    id: "4",
    title: "Technical Analysis: Banking Sector Outlook",
    summary:
      "Our technical analysis suggests the banking sector may see continued strength as key support levels hold and momentum indicators turn bullish.",
    source: "YIF Analytics",
    date: "2026-01-21",
    category: "analysis",
  },
]

// IPO Mock Data
export interface IPO {
  symbol: string
  name: string
  price: number
  status: "upcoming" | "recent"
  date: string
  exchange: string
  shares: number
  marketCap: number
}

export const ipos: IPO[] = [
  {
    symbol: "TICL",
    name: "TICL Investment Co",
    price: 350,
    status: "recent",
    date: "2025-11-15",
    exchange: "DSE",
    shares: 100000000,
    marketCap: 35000000000,
  },
  {
    symbol: "VODA",
    name: "Vodacom Tanzania",
    price: 770,
    status: "recent",
    date: "2017-08-15",
    exchange: "DSE",
    shares: 2240000000,
    marketCap: 1724800000000,
  },
  {
    symbol: "UPCOMING1",
    name: "Tanzania Tech Solutions",
    price: 500,
    status: "upcoming",
    date: "2026-03-20",
    exchange: "DSE",
    shares: 50000000,
    marketCap: 25000000000,
  },
]

// ETF Mock Data
export interface ETF {
  symbol: string
  name: string
  price: number
  changePercent: number
  provider: string
  category: string
  expenseRatio: number
  objectives: string
  manager: string
  inceptionDate: string
  navHistory: { date: string; nav: number }[]
  performance: { period: string; return: number }[]
  benchmark: string
  assetAllocation: { category: string; weight: number }[]
  dividendHistory?: { date: string; amount: number }[]
}

export const etfs: ETF[] = [
  {
    symbol: "TZTOP20",
    name: "Tanzania Top 20 ETF",
    price: 1250,
    changePercent: 1.2,
    provider: "YIF Capital",
    category: "Equity",
    expenseRatio: 0.45,
    objectives: "To track the performance of the top 20 companies listed on the Dar es Salaam Stock Exchange by market capitalization.",
    manager: "YIF Asset Management",
    inceptionDate: "2024-01-15",
    navHistory: [
      { date: "2026-01-26", nav: 1250 },
      { date: "2026-01-19", nav: 1235 },
      { date: "2026-01-12", nav: 1242 },
    ],
    performance: [
      { period: "1M", return: 2.4 },
      { period: "3M", return: 5.8 },
      { period: "YTD", return: 1.2 },
      { period: "1Y", return: 12.5 },
    ],
    benchmark: "DSE All Share Index",
    assetAllocation: [
      { category: "Financials", weight: 45.2 },
      { category: "Consumer Goods", weight: 25.8 },
      { category: "Industrial", weight: 15.5 },
      { category: "Others", weight: 13.5 },
    ],
    dividendHistory: [
      { date: "2025-12-15", amount: 25 },
      { date: "2025-06-15", amount: 22 },
    ],
  },
  {
    symbol: "AFRICA50",
    name: "Africa 50 Index ETF",
    price: 2800,
    changePercent: -0.5,
    provider: "Standard Bank",
    category: "Regional",
    expenseRatio: 0.65,
    objectives: "To provide exposure to the 50 largest and most liquid stocks across major African stock exchanges.",
    manager: "Standard Bank Wealth",
    inceptionDate: "2022-05-10",
    navHistory: [
      { date: "2026-01-26", nav: 2800 },
      { date: "2026-01-19", nav: 2815 },
    ],
    performance: [
      { period: "1M", return: -1.2 },
      { period: "3M", return: 3.5 },
      { period: "YTD", return: -0.5 },
      { period: "1Y", return: 8.2 },
    ],
    benchmark: "MSCI Africa Index",
    assetAllocation: [
      { category: "South Africa", weight: 35.0 },
      { category: "Nigeria", weight: 20.0 },
      { category: "Kenya", weight: 15.0 },
      { category: "Egypt", weight: 12.0 },
      { category: "Others", weight: 18.0 },
    ],
  },
  {
    symbol: "GLD",
    name: "SPDR Gold Shares",
    price: 245000,
    changePercent: 0.8,
    provider: "State Street",
    category: "Commodity",
    expenseRatio: 0.4,
    objectives: "To track the performance of the price of gold bullion, less the Trust's expenses.",
    manager: "State Street Global Advisors",
    inceptionDate: "2004-11-18",
    navHistory: [
      { date: "2026-01-26", nav: 245000 },
    ],
    performance: [
      { period: "1M", return: 4.5 },
      { period: "3M", return: 10.2 },
      { period: "YTD", return: 0.8 },
      { period: "1Y", return: 15.4 },
    ],
    benchmark: "LBMA Gold Price PM",
    assetAllocation: [
      { category: "Gold Bullion", weight: 100.0 },
    ],
  },
]

// Analyst Ratings
export interface AnalystRating {
  symbol: string
  analyst: string
  firm: string
  rating: "Buy" | "Strong Buy" | "Hold" | "Sell" | "Underperform"
  targetPrice: number
  date: string
}

export const analystRatings: AnalystRating[] = [
  {
    symbol: "CRDB",
    analyst: "John Doe",
    firm: "YIF Research",
    rating: "Strong Buy",
    targetPrice: 550,
    date: "2026-01-20",
  },
  {
    symbol: "NMB",
    analyst: "Jane Smith",
    firm: "Global Markets",
    rating: "Buy",
    targetPrice: 4200,
    date: "2026-01-18",
  },
]

// Earnings Calendar
export interface EarningsEvent {
  symbol: string
  name: string
  date: string
  period: string
  estimate: string
}

export const earningsCalendar: EarningsEvent[] = [
  {
    symbol: "CRDB",
    name: "CRDB Bank Plc",
    date: "2026-02-15",
    period: "Q4 2025",
    estimate: "TZS 45.20",
  },
  {
    symbol: "TBL",
    name: "Tanzania Breweries Ltd",
    date: "2026-02-28",
    period: "FY 2025",
    estimate: "TZS 850.00",
  },
]

// Stock Exchanges
export interface Exchange {
  id: string
  name: string
  location: string
  timezone: string
  hours: string
  description: string
}

export const exchanges: Exchange[] = [
  {
    id: "DSE",
    name: "Dar es Salaam Stock Exchange",
    location: "Dar es Salaam, Tanzania",
    timezone: "EAT (UTC+3)",
    hours: "10:00 AM - 02:00 PM",
    description: "The primary stock exchange of Tanzania, established in 1996.",
  },
  {
    id: "NYSE",
    name: "New York Stock Exchange",
    location: "New York, USA",
    timezone: "EST (UTC-5)",
    hours: "09:30 AM - 04:00 PM",
    description: "The world's largest stock exchange by market capitalization.",
  },
]

// Watchlist storage
const WATCHLIST_KEY = "yif_watchlists"

export interface Watchlist {
  id: string
  name: string
  symbols: string[]
  createdAt: string
}

export function getWatchlists(userId: string): Watchlist[] {
  const stored = localStorage.getItem(`${WATCHLIST_KEY}_${userId}`)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
  return []
}

export function saveWatchlists(userId: string, watchlists: Watchlist[]) {
  localStorage.setItem(`${WATCHLIST_KEY}_${userId}`, JSON.stringify(watchlists))
}

// Portfolio storage
const PORTFOLIO_KEY = "yif_portfolios"

export interface PortfolioHolding {
  symbol: string
  shares: number
  avgCost: number
  purchaseDate: string
}

export interface Portfolio {
  id: string
  name: string
  holdings: PortfolioHolding[]
  createdAt: string
}

export function getPortfolios(userId: string): Portfolio[] {
  const stored = localStorage.getItem(`${PORTFOLIO_KEY}_${userId}`)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
  return []
}

export function savePortfolios(userId: string, portfolios: Portfolio[]) {
  localStorage.setItem(`${PORTFOLIO_KEY}_${userId}`, JSON.stringify(portfolios))
}

// Generate random price history for charts
export function generatePriceHistory(basePrice: number, days: number = 30): { date: string; price: number; volume: number }[] {
  const history: { date: string; price: number; volume: number }[] = []
  let currentPrice = basePrice * 0.9

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const change = (Math.random() - 0.45) * (basePrice * 0.02)
    currentPrice = Math.max(currentPrice + change, basePrice * 0.7)

    // Generate some random volume based on base price / 100
    const volume = Math.floor(Math.random() * 2000000) + 100000

    history.push({
      date: date.toISOString().split("T")[0],
      price: Math.round(currentPrice * 100) / 100,
      volume: volume
    })
  }

  return history
}

// Helper functions to get stocks
export function getAllStocks(): Stock[] {
  return dseStocks
}

export function getStockBySymbol(symbol: string): Stock | undefined {
  return dseStocks.find((stock) => stock.symbol === symbol)
}

// Format currency (TZS)
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  if (value >= 1000000000000) {
    return (value / 1000000000000).toFixed(2) + "T"
  }
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(2) + "B"
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + "M"
  }
  return new Intl.NumberFormat("en-US").format(value)
}
