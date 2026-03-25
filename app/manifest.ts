import type { MetadataRoute } from "next"

/**
 * Web app manifest with absolute icon URLs so Android Chrome can resolve
 * launcher icons reliably (relative URLs sometimes fail behind proxies/CDNs).
 * `id` must be a stable URL for the same origin (Chrome install identity).
 */
const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://yifcapital.co.tz").replace(/\/$/, "")

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: `${base}/`,
    name: "YIF Capital",
    short_name: "YIF Capital",
    description:
      "Tanzania digital investment & fund analytics — NAV, DSE stocks, and portfolio tools.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0A1F44",
    theme_color: "#0A1F44",
    lang: "en-TZ",
    icons: [
      {
        src: `${base}/icons/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${base}/icons/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${base}/icons/icon-maskable-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["finance", "business"],
    prefer_related_applications: false,
  }
}
