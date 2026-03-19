import { MetadataRoute } from "next"
import {
  TANZANIAN_FUNDS_STATIC,
  MANAGERS_VIEW_ALL_ORDER,
  getManagerSlug,
} from "@/lib/data/tanzanian-funds"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yifcapital.co.tz"

/** DSE stock symbols for /stocks/[symbol] sitemap entries */
const DSE_SYMBOLS = [
  "CRDB", "DCB", "DSE", "JATU", "JHL", "KA", "KCB", "MBP", "MCB", "MKCB",
  "MUCOBA", "NICO", "NMB", "NMG", "PAL", "SWIS", "TBL", "TCC", "TCCL",
  "TOL", "TPCC", "TTP", "USL", "VODA", "YETU", "EABL", "TICL",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/funds`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${BASE_URL}/funds/managers`, lastModified: now, changeFrequency: "weekly", priority: 0.88 },
    { url: `${BASE_URL}/stocks`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/etfs`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/bonds`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/portfolio`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/academy`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE_URL}/research`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE_URL}/investment-pro`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/analytics`, lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/subscribe`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/subscribe/success`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/economics`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/articles`, lastModified: now, changeFrequency: "weekly", priority: 0.65 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/funds/itrust`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/funds/sanlam-pesa`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ]

  const fundPages: MetadataRoute.Sitemap = TANZANIAN_FUNDS_STATIC.map((fund) => ({
    url: `${BASE_URL}/funds/${fund.fund_id}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }))

  const managerPages: MetadataRoute.Sitemap = MANAGERS_VIEW_ALL_ORDER.map((name) => ({
    url: `${BASE_URL}/funds/managers/${getManagerSlug(name)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.82,
  }))

  const stockPages: MetadataRoute.Sitemap = DSE_SYMBOLS.map((symbol) => ({
    url: `${BASE_URL}/stocks/${symbol}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }))

  return [...staticPages, ...fundPages, ...managerPages, ...stockPages]
}
