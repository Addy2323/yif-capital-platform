#!/bin/bash
# ============================================================
# YIF Capital — Fund Scraper Pipeline Setup
# ============================================================
# Run this script on the production server to set up automated
# fund data scraping. Must be run as root.
#
# Usage:
#   chmod +x setup-scraper.sh
#   sudo ./setup-scraper.sh
# ============================================================

set -e

PROJECT_DIR="/var/www/yif-capital-platform"
PIPELINE_DIR="$PROJECT_DIR/fund_pipeline"
VENV_DIR="$PIPELINE_DIR/.venv"

echo "============================================================"
echo "  YIF Capital — Scraper Pipeline Setup"
echo "============================================================"

# ----------------------------------------------------------
# 1. Install Google Chrome (if not already installed)
# ----------------------------------------------------------
if ! command -v google-chrome &> /dev/null; then
    echo ""
    echo "[1/6] Installing Google Chrome..."
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
    apt-get update -qq
    apt-get install -y google-chrome-stable
    echo "  ✓ Chrome installed: $(google-chrome --version)"
else
    echo ""
    echo "[1/6] Chrome already installed: $(google-chrome --version)"
fi

# ----------------------------------------------------------
# 2. Install Python3 + pip (if not already installed)
# ----------------------------------------------------------
echo ""
echo "[2/6] Checking Python3..."
if ! command -v python3 &> /dev/null; then
    apt-get install -y python3 python3-venv python3-pip
fi
echo "  ✓ Python: $(python3 --version)"

# ----------------------------------------------------------
# 3. Create Python virtual environment
# ----------------------------------------------------------
echo ""
echo "[3/6] Setting up Python virtual environment..."
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
    echo "  ✓ Created venv at $VENV_DIR"
else
    echo "  ✓ Venv already exists at $VENV_DIR"
fi

source "$VENV_DIR/bin/activate"
pip install --upgrade pip -q
pip install -r "$PIPELINE_DIR/requirements.txt" -q
echo "  ✓ Python dependencies installed"

# ----------------------------------------------------------
# 4. Verify .env has required variables
# ----------------------------------------------------------
echo ""
echo "[4/6] Checking .env configuration..."
ENV_FILE="$PROJECT_DIR/.env"

if ! grep -q "FUND_API_URL" "$ENV_FILE" 2>/dev/null; then
    echo "" >> "$ENV_FILE"
    echo "# Fund Scraper Pipeline" >> "$ENV_FILE"
    echo 'FUND_API_URL=http://localhost:3000/api/funds/update' >> "$ENV_FILE"
    echo "  ✓ Added FUND_API_URL to .env"
else
    echo "  ✓ FUND_API_URL already in .env"
fi

if ! grep -q "CRON_SECRET" "$ENV_FILE" 2>/dev/null; then
    GENERATED_SECRET=$(openssl rand -hex 24)
    echo "CRON_SECRET=$GENERATED_SECRET" >> "$ENV_FILE"
    echo "  ✓ Generated and added CRON_SECRET to .env"
    echo "  → Your CRON_SECRET: $GENERATED_SECRET"
else
    CURRENT_SECRET=$(grep "CRON_SECRET" "$ENV_FILE" | cut -d'=' -f2)
    if [ "$CURRENT_SECRET" = "change-me-to-a-random-secret" ]; then
        GENERATED_SECRET=$(openssl rand -hex 24)
        sed -i "s/CRON_SECRET=change-me-to-a-random-secret/CRON_SECRET=$GENERATED_SECRET/" "$ENV_FILE"
        echo "  ✓ Replaced placeholder CRON_SECRET with secure value"
        echo "  → Your CRON_SECRET: $GENERATED_SECRET"
    else
        echo "  ✓ CRON_SECRET already configured"
    fi
fi

# ----------------------------------------------------------
# 5. Test the scraper with a single fund
# ----------------------------------------------------------
echo ""
echo "[5/6] Testing scraper with WHI fund (fastest source)..."
cd "$PIPELINE_DIR"

FUND_API_URL="http://localhost:3000/api/funds/update" \
    "$VENV_DIR/bin/python" scraper/selenium_scraper.py --fund whi --latest-only 2>&1 | tail -10

echo "  ✓ Scraper test complete (check output above)"

# ----------------------------------------------------------
# 6. Set up cron job
# ----------------------------------------------------------
echo ""
echo "[6/6] Setting up cron job..."
CRON_SECRET=$(grep "CRON_SECRET" "$ENV_FILE" | cut -d'=' -f2)

# Remove any existing fund scraper cron entries
crontab -l 2>/dev/null | grep -v "scrape-funds" > /tmp/crontab_clean || true

# Add new cron job (runs at 7 AM, 6 PM, 8 PM, 11 PM EAT daily)
echo "0 7,18,20,23 * * * curl -s -H \"Authorization: Bearer $CRON_SECRET\" http://localhost:3000/api/cron/scrape-funds >> /var/log/fund-scraper.log 2>&1" >> /tmp/crontab_clean

crontab /tmp/crontab_clean
rm /tmp/crontab_clean

echo "  ✓ Cron job installed (7 AM, 6 PM, 8 PM, 11 PM daily)"
echo ""
echo "============================================================"
echo "  Setup Complete!"
echo "============================================================"
echo ""
echo "  Next steps:"
echo "  1. Rebuild the app:  cd $PROJECT_DIR && npm run build && pm2 restart all"
echo "  2. Run full scrape:  cd $PIPELINE_DIR && source .venv/bin/activate && FUND_API_URL=http://localhost:3000/api/funds/update python scraper/selenium_scraper.py --latest-only"
echo "  3. Check data:       psql -U postgres -d yifdb -c \"SELECT \\\"fundId\\\", COUNT(*) FROM \\\"FundDailySummary\\\" GROUP BY \\\"fundId\\\";\""
echo ""
