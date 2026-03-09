#!/bin/bash
# =============================================================================
# Production Data Sync Script for yifcapital.co.tz
# =============================================================================
#
# PURPOSE:
#   Automatically scrapes fund data from all configured sources (UTT AMIS,
#   Vertex, Sanlam Pesa, Zansec, WHI, iTrust) AND DSE stock data from
#   stockanalysis.com, then pushes updates to the production Next.js API
#   so the website always shows fresh data.
#
# CRON SETUP (run these commands on your production server):
# ----------------------------------------------------------------
#   1. Make the script executable:
#        chmod +x /var/www/yif-capital-platform/scripts/prod-sync.sh
#
#   2. Open the crontab editor:
#        crontab -e
#
#   3. Add ONE of these lines (pick a schedule):
#
#      # Option A: Run TWICE daily (recommended) — 7 AM and 6 PM EAT
#      0 7,18 * * * /var/www/yif-capital-platform/scripts/prod-sync.sh >> /var/www/yif-capital-platform/fund_pipeline/logs/cron.log 2>&1
#
#      # Option B: Run ONCE daily at 6 PM EAT (after market close)
#      0 18 * * * /var/www/yif-capital-platform/scripts/prod-sync.sh >> /var/www/yif-capital-platform/fund_pipeline/logs/cron.log 2>&1
#
#      # Option C: Run EVERY 6 HOURS for maximum freshness
#      0 */6 * * * /var/www/yif-capital-platform/scripts/prod-sync.sh >> /var/www/yif-capital-platform/fund_pipeline/logs/cron.log 2>&1
#
#   4. Save and exit. Verify with:
#        crontab -l
#
# MANUAL RUN (for testing):
#   bash /var/www/yif-capital-platform/scripts/prod-sync.sh
#
# LOGS:
#   fund_pipeline/logs/automation.log   — combined output
#   fund_pipeline/logs/cron.log         — raw cron output (captures errors)
#   fund_pipeline/logs/scraper_*.log    — per-day scraper logs
#
# =============================================================================

# DO NOT use 'set -e' — it kills the script on the first error,
# preventing the stock scraper from running if the fund scraper fails.
# DO NOT use 'set -u' — cron has minimal env vars so unset vars would crash.
set -o pipefail

# ---------------------------------------------------------------------------
# Cron-safe PATH (cron has very minimal PATH by default)
# ---------------------------------------------------------------------------
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

# ---------------------------------------------------------------------------
# Paths & Environment
# ---------------------------------------------------------------------------
PROJECT_DIR="/var/www/yif-capital-platform"
LOG_FILE="$PROJECT_DIR/fund_pipeline/logs/automation.log"

# Ensure log directory exists
mkdir -p "$PROJECT_DIR/fund_pipeline/logs"

# Change to project directory
if ! cd "$PROJECT_DIR"; then
    echo "[$(date)] ERROR: Cannot cd to $PROJECT_DIR" >> "$LOG_FILE"
    exit 1
fi

export FUND_API_URL="${FUND_API_URL:-http://localhost:3000/api/funds/update}"
export STOCK_API_URL="${STOCK_API_URL:-http://localhost:3000}"
PYTHON_EXEC="$PROJECT_DIR/fund_pipeline/.venv/bin/python3"

# ---------------------------------------------------------------------------
# Pre-flight Checks
# ---------------------------------------------------------------------------
if [ ! -f "$PYTHON_EXEC" ]; then
    echo "[$(date)] ERROR: Python venv not found at $PYTHON_EXEC" >> "$LOG_FILE"
    echo "[$(date)] ERROR: Python venv not found at $PYTHON_EXEC"
    exit 1
fi

# Check if the Next.js app is running (API must be up to receive data)
if command -v curl &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "000" ]; then
        echo "[$(date)] WARNING: Next.js app not reachable on port 3000" >> "$LOG_FILE"
    fi
else
    echo "[$(date)] WARNING: curl not found, skipping server check" >> "$LOG_FILE"
fi

# ---------------------------------------------------------------------------
# Run Fund Scraper
# ---------------------------------------------------------------------------
echo "" >> "$LOG_FILE"
echo "================================================================" >> "$LOG_FILE"
echo "[$(date)] Starting Daily Data Sync..." >> "$LOG_FILE"
echo "================================================================" >> "$LOG_FILE"

FUND_EXIT=0
echo "[$(date)] [1/2] Running Fund Scraper..." >> "$LOG_FILE"
"$PYTHON_EXEC" "$PROJECT_DIR/fund_pipeline/scraper/selenium_scraper.py" --latest-only >> "$LOG_FILE" 2>&1 || FUND_EXIT=$?

if [ $FUND_EXIT -eq 0 ]; then
    echo "[$(date)] ✅ Fund Scraper Complete" >> "$LOG_FILE"
else
    echo "[$(date)] ❌ Fund Scraper FAILED (exit code: $FUND_EXIT)" >> "$LOG_FILE"
fi

# ---------------------------------------------------------------------------
# Run DSE Stock Scraper
# ---------------------------------------------------------------------------
STOCK_EXIT=0
echo "[$(date)] [2/2] Running DSE Stock Scraper..." >> "$LOG_FILE"
"$PYTHON_EXEC" "$PROJECT_DIR/fund_pipeline/scraper/dse_scraper.py" --push >> "$LOG_FILE" 2>&1 || STOCK_EXIT=$?

if [ $STOCK_EXIT -eq 0 ]; then
    echo "[$(date)] ✅ DSE Stock Scraper Complete" >> "$LOG_FILE"
else
    echo "[$(date)] ❌ DSE Stock Scraper FAILED (exit code: $STOCK_EXIT)" >> "$LOG_FILE"
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
if [ $FUND_EXIT -eq 0 ] && [ $STOCK_EXIT -eq 0 ]; then
    echo "[$(date)] ✅ Daily Data Sync Complete — All scrapers succeeded" >> "$LOG_FILE"
else
    echo "[$(date)] ⚠️  Daily Data Sync Finished with errors (Fund=$FUND_EXIT, Stocks=$STOCK_EXIT)" >> "$LOG_FILE"
fi

echo "================================================================" >> "$LOG_FILE"
