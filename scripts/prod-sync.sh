#!/bin/bash
# Production Sync Script for yifcapital.co.tz
# This script is designed to be run daily via Cron.

# Navigate to the project directory
cd "$(dirname "$0")/.."

# Environment Variables
export FUND_API_URL="https://yifcapital.co.tz/api/funds/update"
export PYTHON_EXEC="./fund_pipeline/.venv/bin/python3"

# Log start
echo "[$(date)] Starting Daily Fund Sync..." >> fund_pipeline/logs/automation.log

# 1. Run the Scraper
$PYTHON_EXEC fund_pipeline/scraper/selenium_scraper.py >> fund_pipeline/logs/automation.log 2>&1

# Log end
echo "[$(date)] Daily Fund Sync Complete." >> fund_pipeline/logs/automation.log
