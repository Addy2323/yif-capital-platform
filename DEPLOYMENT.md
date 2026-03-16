# Production Deployment Guide: yifcapital.co.tz

This guide provides step-by-step instructions for hosting the YIF Capital Platform on a production VPS.

## 1. Server Requirements
* **OS**: Ubuntu 22.04+ (Recommended) or Windows Server.
* **Node.js**: v18 or v20.
* **PostgreSQL**: 14+.
* **Python**: 3.10+ (for data scraping).
  * **Linux Dependency Note**: On Ubuntu/Debian, install these first:
    ```bash
    sudo apt update
    sudo apt install python3-venv python3-pip
    ```
* **Chrome Browser**: Installed on the server (for Selenium).

---

## 2. Initial Setup

### Clone and Install
```bash
git clone https://github.com/Addy2323/yif-capital-platform.git
cd yif-capital-platform
npm install
```

### Environment Variables
Create a `.env` file based on the local one, ensuring the production URLs and Database strings are correct:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/yifdb"
NEXT_PUBLIC_APP_URL="https://yifcapital.co.tz"
# ... other vars from .env
```

### Database Migration
Apply the Prisma schema to the production database:
```bash
npx prisma db push
```

---

## 3. Data Pipeline Setup (Automation)

The scraper needs a Python environment and Chrome to run.

### Python Environment
```bash
cd fund_pipeline
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Scheduling Automated Updates

**Option A — In-app scheduler (easiest — no cron to remember):**  
If `CRON_SECRET` is set in `.env`, the app runs the full scrape (funds + DSE) **automatically** at **7:00, 18:00, 20:00, 23:00** in the **server’s local time**. No system cron or scripts needed; as long as the app is running (e.g. under PM2), scrapes happen on their own. Just deploy and keep the app up.

**Option B — Cron API (when you want external control):**  
Set `CRON_SECRET` in `.env`, then call the API on a schedule (e.g. cron job or Vercel Cron):

- **Full sync (funds + DSE):** `GET https://yifcapital.co.tz/api/cron/scrape-funds`  
  Header: `Authorization: Bearer YOUR_CRON_SECRET`
- **DSE only (market summary + stocks from dse.co.tz):** `GET https://yifcapital.co.tz/api/cron/scrape-dse`  
  Use this to refresh dashboard data without running the fund scraper (faster).

Example crontab — scrape at **7 AM, 6 PM, 8 PM, 11 PM** (EAT). Use **one** of:
```bash
# Full sync (funds + DSE) at 7 AM, 6 PM, 8 PM, 11 PM
0 7,18,20,23 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://yifcapital.co.tz/api/cron/scrape-funds >> /var/log/fund-scraper.log 2>&1
# Or DSE-only (faster, market summary + stocks only):
0 7,18,20,23 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://yifcapital.co.tz/api/cron/scrape-dse >> /var/log/dse-scraper.log 2>&1
```

**Option C — Shell script (VPS with Python + Chrome):**
1. Make the script executable: `chmod +x scripts/prod-sync.sh`
2. Open crontab: `crontab -e`
3. Add (7 AM, 6 PM, 8 PM, 11 PM):
   ```bash
   0 7,18,20,23 * * * /path/to/yif-capital-platform/scripts/prod-sync.sh >> /path/to/fund_pipeline/logs/cron.log 2>&1
   ```

**Windows (Task Scheduler):**
1. Create a "Basic Task".
2. Set Trigger to "Daily" (or at desired times).
3. Set Action to "Start a Program" and point to `scripts/prod-sync.bat`.

### Contabo VPS — Auto-scrape to your live site

When the app and scraper run on the same VPS (e.g. Contabo), the cron job starts the Python scraper **on the server**; the scraper then POSTs fund performance data to your **live site** so the Funds → Performance tab and Historical Performance Log stay up to date.

1. **Set the API URL the scraper will use**  
   In `.env` on the VPS, set:
   ```env
   FUND_API_URL="https://yifcapital.co.tz/api/funds/update"
   ```
   Replace `yifcapital.co.tz` with your real production domain. The scraper sends scraped data to this URL.

2. **Cron job that triggers the scrape**  
   Use this URL in your cron (same server or external). Replace with your domain and `YOUR_CRON_SECRET`:
   ```bash
   # Full sync (all funds + DSE) — 7 AM, 6 PM, 8 PM, 11 PM
   0 7,18,20,23 * * * curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://yifcapital.co.tz/api/cron/scrape-funds >> /var/log/fund-scraper.log 2>&1
   ```
   When this runs, the app spawns the Python scraper with `FUND_API_URL` above, so data is pushed to your site automatically.

3. **Sources covered**  
   The scraper is configured for: UTT AMIS (6), iTrust (6), Orbit (2), Zan (Timiza), TSL (2), Vertex (1), APEF (Ziada), WHI (Faida), SanlamAllianz (2).  
   **TSL and APEF:** Their pages are in the config; when they publish NAV data, the same cron run will scrape and push it—no code change needed.

4. **Optional: run scraper only (no DSE)**  
   To refresh only fund NAV/performance and not DSE, call the same cron endpoint; the script still runs both. For DSE-only, use `/api/cron/scrape-dse` instead.

### After git pull: get old-to-latest data for all funds

The **cron job runs with `--latest-only`** (only a few pages per source), so it adds **new** data each day but does **not** backfill history. To have **full history from 2025 to latest** for all funds on the server, do this **once** after you pull (or on a fresh deploy):

1. **Pull and build**
   ```bash
   cd /path/to/yif-capital-platform   # or your project path
   git pull
   npm install
   npm run build
   ```

2. **Ensure app and env are ready**
   - `.env` has `DATABASE_URL`, `FUND_API_URL` (e.g. `https://yifcapital.co.tz/api/funds/update`), and `CRON_SECRET`.
   - App is running (e.g. `pm2 restart all` or `npm run start`).

3. **Run a one-time full scrape (all funds, 2025 → latest)**
   ```bash
   cd fund_pipeline
   source .venv/bin/activate
   export FUND_API_URL="https://yifcapital.co.tz/api/funds/update"   # use your real domain
   python3 scraper/selenium_scraper.py
   ```
   **Do not** use `--latest-only` here. This run scrapes many pages per source (until it reaches end of 2024) and pushes all records to your API. It can take **30–90+ minutes** depending on the number of sources and pages.

4. **Set up cron for daily updates**
   - Either rely on **in-app scheduler** (if `CRON_SECRET` is set, the app triggers scrape at 7:00, 18:00, 20:00, 23:00), or
   - Add a **cron entry** that calls your scrape endpoint:
     ```bash
     0 7,18,20,23 * * * curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://yifcapital.co.tz/api/cron/scrape-funds >> /var/log/fund-scraper.log 2>&1
     ```

After step 3, your server DB will have fund data from 2025 to latest. Step 4 keeps it updated every day.

---

## 4. Launching the Platform

### Build the App
```bash
npm run build
```

### Run with PM2 (Recommended)
PM2 ensures the app restarts automatically if the server crashes.
```bash
npm install -g pm2
pm2 start npm --name "yif-app" -- start
```

### View Logs
```bash
pm2 logs yif-app
tail -f fund_pipeline/logs/automation.log
```

---

## 5. SSL and Reverse Proxy
It is recommended to use **Nginx** as a reverse proxy for SSL (HTTPS) management.
* Map port 80/443 to port 3000.
* Use Certbot (Let's Encrypt) for the certificate on `yifcapital.co.tz`.
