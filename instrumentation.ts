/**
 * In-app scheduler: runs DSE + fund scrape automatically at 7 AM, 6 PM, 8 PM, 11 PM (server time).
 * No need to set up system cron — as long as the app is running (e.g. PM2), scrapes run on their own.
 */

export async function register() {
    if (process.env.NEXT_RUNTIME !== "nodejs") return

    const secret = process.env.CRON_SECRET
    if (!secret) {
        console.log("[scheduler] CRON_SECRET not set — auto-scrape disabled. Set it in .env to enable.")
        return
    }

    // Use require() so Next doesn't bundle node-cron (avoids "Can't resolve 'path'" from Node built-ins)
    const cron = require("node-cron")
    const port = process.env.PORT || "3000"
    const baseUrl = `http://localhost:${port}`

    // 7:00, 18:00, 20:00, 23:00 every day (server local time)
    cron.schedule("0 7,18,20,23 * * *", () => {
        const url = `${baseUrl}/api/cron/scrape-funds`
        fetch(url, { headers: { Authorization: `Bearer ${secret}` } }).catch((err) => {
            console.error("[scheduler] scrape-funds trigger failed:", err?.message || err)
        })
    })

    console.log("[scheduler] Auto-scrape enabled at 7:00, 18:00, 20:00, 23:00 (server time)")
}
