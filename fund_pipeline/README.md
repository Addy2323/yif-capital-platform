# Fund Data Scraping Pipeline

Standalone Python backend for scraping Tanzanian fund NAV data and computing analytics metrics.

## Quick Start

```bash
cd fund_pipeline
pip install -r requirements.txt
python scraper/selenium_scraper.py
python processor/calculate_metrics.py
```

## Architecture

```
fund_pipeline/
├── scraper/selenium_scraper.py    # Headless Chrome scraper
├── processor/calculate_metrics.py  # Daily return, AUM, volatility
├── config/sources.json             # Target URLs & settings
├── data/raw/                       # JSON files (raw scraped)
├── data/processed/                 # Cleaned metrics
├── data/archive/                   # Rotated old files
├── logs/                           # Daily log files
└── requirements.txt
```

## Design Rules

| Rule | Status |
|------|--------|
| No DB writes from scraper | ✅ |
| Raw data → JSON files | ✅ |
| Headless execution | ✅ |
| Explicit waits | ✅ |
| Retry mechanism | ✅ |
| Aggregates-only to DB | ✅ |

## Data Sources

- **UTT AMIS** — Fund performance page
- **Zansec** — NAV page  
- **WHI** — NAV data page

## Scheduling

**Windows Task Scheduler:**
```
python C:\path\to\fund_pipeline\scraper\selenium_scraper.py
```

**Linux Cron (daily at 7 PM):**
```
0 19 * * * /usr/bin/python3 /path/to/fund_pipeline/scraper/selenium_scraper.py
```
