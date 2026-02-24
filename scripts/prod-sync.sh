#!/bin/bash
# =============================================================================
# Production Fund Sync Script for yifcapital.co.tz
# =============================================================================
#
# PURPOSE:
#   Automatically scrapes fund data from all configured sources (UTT AMIS,
#   Vertex, Sanlam Pesa, Zansec, WHI, iTrust) and pushes updates to the
#   production Next.js API so the website always shows fresh data.
#
# CRON SETUP (run these commands on your production server):
# ----------------------------------------------------------------
#   1. Open the crontab editor:
#        crontab -e
#
#   2. Add ONE of these lines (pick a schedule):
#
#      # Option A: Run TWICE daily (recommended) — 7 AM and 6 PM EAT
#      0 7,18 * * * /var/www/yif-capital-platform/scripts/prod-sync.sh
#
#      # Option B: Run ONCE daily at 6 PM EAT (after market close)
#      0 18 * * * /var/www/yif-capital-platform/scripts/prod-sync.sh
#
#      # Option C: Run EVERY 6 HOURS for maximum freshness
#      0 */6 * * * /var/www/yif-capital-platform/scripts/prod-sync.sh
#
#   3. Save and exit. Verify with:
#        crontab -l
#
# MANUAL RUN (for testing):
#   bash /var/www/yif-capital-platform/scripts/prod-sync.sh
#
# LOGS:
#   fund_pipeline/logs/automation.log   — combined output
#   fund_pipeline/logs/scraper_*.log    — per-day scraper logs
#
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Paths & Environment
# ---------------------------------------------------------------------------
PROJECT_DIR="/var/www/yif-capital-platform"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

export FUND_API_URL="http://localhost:3000/api/funds/update"
PYTHON_EXEC="$PROJECT_DIR/fund_pipeline/.venv/bin/python3"
LOG_FILE="$PROJECT_DIR/fund_pipeline/logs/automation.log"

# Ensure log directory exists
mkdir -p "$PROJECT_DIR/fund_pipeline/logs"

# ---------------------------------------------------------------------------
# Pre-flight Checks
# ---------------------------------------------------------------------------
if [ ! -f "$PYTHON_EXEC" ]; then
    echo "[$(date)] ERROR: Python venv not found at $PYTHON_EXEC" >> "$LOG_FILE"
    exit 1
fi

# Check if the Next.js app is running (API must be up to receive data)
if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    echo "[$(date)] WARNING: Next.js app may not be running on port 3000" >> "$LOG_FILE"
fi

# ---------------------------------------------------------------------------
# Run Scraper
# ---------------------------------------------------------------------------
echo "" >> "$LOG_FILE"
echo "================================================================" >> "$LOG_FILE"
echo "[$(date)] Starting Daily Fund Sync..." >> "$LOG_FILE"
echo "================================================================" >> "$LOG_FILE"

# Run the scraper — it scrapes ALL sources and pushes to the API
$PYTHON_EXEC "$PROJECT_DIR/fund_pipeline/scraper/selenium_scraper.py" >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
if [ $EXIT_CODE -eq 0 ]; then
    echo "[$(date)] ✅ Daily Fund Sync Complete (exit code: $EXIT_CODE)" >> "$LOG_FILE"
else
    echo "[$(date)] ❌ Daily Fund Sync FAILED (exit code: $EXIT_CODE)" >> "$LOG_FILE"
fi

echo "================================================================" >> "$LOG_FILE"
