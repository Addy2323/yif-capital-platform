import { NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"
import fs from "fs"

// ---------------------------------------------------------------------------
// GET /api/cron/scrape-funds
// ---------------------------------------------------------------------------
// Starts the fund + DSE scrapers in the background and returns 202 immediately.
// This avoids 504 Gateway Timeout when Nginx/proxy has a short timeout.
// Protected by CRON_SECRET.
//
// Usage:
//   curl -H "Authorization: Bearer YOUR_SECRET" https://yifcapital.co.tz/api/cron/scrape-funds
// ---------------------------------------------------------------------------

export const maxDuration = 60 // Only need a few seconds to spawn the job

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 },
        )
    }

    const projectDir = process.cwd()
    const fundScript = path.join(projectDir, "fund_pipeline", "scraper", "selenium_scraper.py")
    const stockScript = path.join(projectDir, "fund_pipeline", "scraper", "dse_scraper.py")

    const pythonPaths = [
        path.join(projectDir, "fund_pipeline", ".venv", "bin", "python3"),
        path.join(projectDir, "fund_pipeline", ".venv", "Scripts", "python.exe"),
        "python3",
        "python",
    ]

    let pythonExec = "python3"
    for (const p of pythonPaths) {
        if (p.includes("/") || p.includes("\\")) {
            if (fs.existsSync(p)) {
                pythonExec = p
                break
            }
        } else {
            pythonExec = p
            break
        }
    }

    if (!fs.existsSync(fundScript)) {
        return NextResponse.json(
            { success: false, error: `Fund scraper not found: ${fundScript}` },
            { status: 500 },
        )
    }

    const port = process.env.PORT || "3000"
    const apiUrl = process.env.FUND_API_URL || `http://localhost:${port}/api/funds/update`
    const stockApiUrl = process.env.STOCK_API_URL || `http://localhost:${port}`
    const cwd = path.join(projectDir, "fund_pipeline")
    const env = {
        ...process.env,
        FUND_API_URL: apiUrl,
        STOCK_API_URL: stockApiUrl,
    }

    // Run both scrapers in a background shell so we can return 202 immediately
    const logPath = path.join(projectDir, "fund_pipeline", "logs", "cron-scrape-funds.log")
    const logDir = path.dirname(logPath)
    if (!fs.existsSync(logDir)) {
        try {
            fs.mkdirSync(logDir, { recursive: true })
        } catch {
            // ignore
        }
    }

    const cmd = [
        `"${pythonExec}" "${fundScript}" --latest-only`,
        fs.existsSync(stockScript) ? `"${pythonExec}" "${stockScript}" --push` : "true",
    ].join(" && ")

    try {
        fs.appendFileSync(logPath, `\n--- ${new Date().toISOString()} scrape-funds started ---\n`)
    } catch {
        // ignore
    }

    const child = spawn("sh", ["-c", cmd], {
        cwd,
        env,
        detached: true,
        stdio: ["ignore", "pipe", "pipe"],
    })

    const out = fs.openSync(logPath, "a")
    child.stdout?.on("data", (d) => fs.writeSync(out, d))
    child.stderr?.on("data", (d) => fs.writeSync(out, d))
    child.on("close", () => fs.closeSync(out))
    child.unref()

    console.log(`[CRON] scrape-funds started in background (PID ${child.pid}), log: ${logPath}`)

    return NextResponse.json(
        {
            success: true,
            message: "Scrape started in background. Check fund_pipeline/logs/cron-scrape-funds.log for progress.",
            pid: child.pid,
        },
        { status: 202 },
    )
}
