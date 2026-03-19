import { MetadataRoute } from "next"
import { TANZANIAN_FUNDS_STATIC } from "@/lib/data/tanzanian-funds"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yifcapital.co.tz"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/funds`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${BASE_URL}/stocks`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/portfolio`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/academy`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE_URL}/research`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE_URL}/investment-pro`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/subscribe`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/economics`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/articles`, lastModified: now, changeFrequency: "weekly", priority: 0.65 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ]

  const fundPages: MetadataRoute.Sitemap = TANZANIAN_FUNDS_STATIC.map((fund) => ({
    url: `${BASE_URL}/funds/${fund.fund_id}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }))

  return [...staticPages, ...fundPages]
}
