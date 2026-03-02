import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs"

const execAsync = promisify(exec)

// ---------------------------------------------------------------------------
// GET /api/cron/scrape-funds
// ---------------------------------------------------------------------------
// Triggers the Python scraper in --latest-only mode.
// Protected by CRON_SECRET to prevent unauthorized access.
//
// Usage:
//   curl -H "Authorization: Bearer YOUR_SECRET" https://yifcapital.co.tz/api/cron/scrape-funds
//
// Or add to crontab:
//   0 7,18 * * * curl -s -H "Authorization: Bearer YOUR_SECRET" https://yifcapital.co.tz/api/cron/scrape-funds
// ---------------------------------------------------------------------------

export const maxDuration = 300 // 5 minutes max

export async function GET(req: Request) {
    // Auth check
    const authHeader = req.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 },
        )
    }

    try {
        // Locate the project root and Python executable
        const projectDir = process.cwd()
        const scraperScript = path.join(projectDir, "fund_pipeline", "scraper", "selenium_scraper.py")

        // Try common Python paths
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

        if (!fs.existsSync(scraperScript)) {
            return NextResponse.json(
                { success: false, error: `Scraper script not found: ${scraperScript}` },
                { status: 500 },
            )
        }

        // Set the API URL so the scraper pushes to this server
        const apiUrl = process.env.FUND_API_URL || `http://localhost:${process.env.PORT || 3000}/api/funds/update`

        console.log(`[CRON] Starting fund scraper: ${pythonExec} ${scraperScript} --latest-only`)

        const { stdout, stderr } = await execAsync(
            `"${pythonExec}" "${scraperScript}" --latest-only`,
            {
                cwd: path.join(projectDir, "fund_pipeline"),
                timeout: 280_000, // 4m 40s hard timeout
                env: {
                    ...process.env,
                    FUND_API_URL: apiUrl,
                },
            },
        )

        console.log(`[CRON] Scraper completed successfully`)

        // Extract summary from the last few lines of stdout
        const lines = stdout.trim().split("\n")
        const summaryLines = lines.slice(-15)

        return NextResponse.json({
            success: true,
            message: "Fund scraper completed",
            summary: summaryLines.join("\n"),
            stderr: stderr ? stderr.slice(0, 500) : null,
        })
    } catch (error: any) {
        console.error("[CRON] Scraper execution failed:", error.message)

        return NextResponse.json(
            {
                success: false,
                error: error.message,
                stdout: error.stdout?.slice(-1000),
                stderr: error.stderr?.slice(-1000),
            },
            { status: 500 },
        )
    }
}
