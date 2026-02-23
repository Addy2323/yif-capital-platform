# Production Deployment Guide: yifcapital.co.tz

This guide provides step-by-step instructions for hosting the YIF Capital Platform on a production VPS.

## 1. Server Requirements
* **OS**: Ubuntu 22.04+ (Recommended) or Windows Server.
* **Node.js**: v18 or v20.
* **PostgreSQL**: 14+.
* **Python**: 3.10+ (for data scraping).
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
To run the sync every day at 1:00 AM:

**Linux (Cron):**
1. Make the script executable: `chmod +x scripts/prod-sync.sh`
2. Open crontab: `crontab -e`
3. Add this line:
   ```bash
   0 1 * * * /path/to/yif-capital-platform/scripts/prod-sync.sh
   ```

**Windows (Task Scheduler):**
1. Create a "Basic Task".
2. Set Trigger to "Daily".
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
