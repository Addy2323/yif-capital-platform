import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs"

const execAsync = promisify(exec)

// ---------------------------------------------------------------------------
// GET /api/cron/scrape-dse
// ---------------------------------------------------------------------------
// Runs only the DSE scraper (dse.co.tz + stock data). Use this to refresh
// market summary and stocks without running the heavy fund scraper.
// Same CRON_SECRET as scrape-funds.
//
// Usage:
//   curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yifcapital.co.tz/api/cron/scrape-dse
//
// Cron example (7 AM, 6 PM, 8 PM, 11 PM):
//   0 7,18,20,23 * * * curl -s -H "Authorization: Bearer YOUR_SECRET" https://yifcapital.co.tz/api/cron/scrape-dse
// ---------------------------------------------------------------------------

export const maxDuration = 300 // 5 minutes

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
    const stockScraperScript = path.join(projectDir, "fund_pipeline", "scraper", "dse_scraper.py")

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

    if (!fs.existsSync(stockScraperScript)) {
        return NextResponse.json(
            { success: false, error: `DSE scraper not found: ${stockScraperScript}` },
            { status: 500 },
        )
    }

    const stockApiUrl = process.env.STOCK_API_URL || `http://localhost:${process.env.PORT || 3000}`

    try {
        console.log(`[CRON scrape-dse] Running: ${pythonExec} dse_scraper.py --push`)

        const { stdout, stderr } = await execAsync(
            `"${pythonExec}" "${stockScraperScript}" --push`,
            {
                cwd: path.join(projectDir, "fund_pipeline"),
                timeout: 180_000,
                env: {
                    ...process.env,
                    STOCK_API_URL: stockApiUrl,
                },
            },
        )

        const lines = stdout.trim().split("\n").slice(-15)
        console.log(`[CRON scrape-dse] Completed successfully`)

        return NextResponse.json({
            success: true,
            message: "DSE scraper completed; market summary and stocks updated from dse.co.tz",
            summary: lines.join("\n"),
            stderr: stderr?.trim().slice(0, 300) || null,
        })
    } catch (error: any) {
        console.error("[CRON scrape-dse] Failed:", error.message)

        return NextResponse.json(
            {
                success: false,
                error: error.message,
                stdout: error.stdout?.slice(-800),
                stderr: error.stderr?.slice(-800),
            },
            { status: 500 },
        )
    }
}
