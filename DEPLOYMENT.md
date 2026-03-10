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
